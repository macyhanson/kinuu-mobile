import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Assessment, HemisphereResult, HemisphereWeakness, ExerciseResult } from '@/types';

interface AssessmentState {
  currentAssessment: Assessment | null;
  assessmentHistory: Assessment[];

  startAssessment: (assessment: Assessment) => void;
  recordResult: (result: ExerciseResult) => void;
  completeAssessment: (hemisphereResult: HemisphereResult) => Promise<Assessment>;
  loadHistory: (childId: string) => Promise<void>;
  getPreAssessment: (childId: string) => Assessment | undefined;
  getPostAssessment: (childId: string) => Assessment | undefined;
}

const historyKey = (childId: string) => `@brainyact:assessments:${childId}`;

/**
 * Derives hemisphere weakness from exercise results.
 * Primary signal: Fukuda rotation and balance asymmetry.
 * Supporting signals: Dance, Cross Crawl, Figure Eights side performance.
 */
function deriveHemisphereWeakness(results: ExerciseResult[]): HemisphereResult {
  const leftScores: number[] = [];
  const rightScores: number[] = [];
  const determinedBy: string[] = [];

  for (const result of results) {
    if (result.side === 'left') {
      leftScores.push(result.accuracyPercent);
      determinedBy.push(result.exerciseId);
    } else if (result.side === 'right') {
      rightScores.push(result.accuracyPercent);
    }
  }

  const avg = (arr: number[]) =>
    arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;

  const leftScore = avg(leftScores);
  const rightScore = avg(rightScores);

  let weakness: HemisphereWeakness = 'undetermined';
  if (leftScore > 0 || rightScore > 0) {
    if (leftScore < rightScore - 5) weakness = 'left';
    else if (rightScore < leftScore - 5) weakness = 'right';
  }

  return { leftScore, rightScore, weakness, determinedBy };
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  currentAssessment: null,
  assessmentHistory: [],

  startAssessment: (assessment) => {
    set({ currentAssessment: assessment });
  },

  recordResult: (result) => {
    const current = get().currentAssessment;
    if (!current) return;
    set({
      currentAssessment: {
        ...current,
        exerciseResults: [...current.exerciseResults, result],
      },
    });
  },

  completeAssessment: async (providedResult) => {
    const current = get().currentAssessment;
    if (!current) throw new Error('No active assessment');

    // Use provided result or derive from exercise data
    const hemisphereResult =
      providedResult ?? deriveHemisphereWeakness(current.exerciseResults);

    const overallScore =
      current.exerciseResults.reduce((sum, r) => sum + r.accuracyPercent, 0) /
      Math.max(current.exerciseResults.length, 1);

    const completed: Assessment = {
      ...current,
      hemisphereResult,
      overallScore,
      completedAt: new Date().toISOString(),
    };

    const key = historyKey(current.childId);
    const existing = await AsyncStorage.getItem(key);
    const history: Assessment[] = existing ? JSON.parse(existing) : [];
    history.push(completed);
    await AsyncStorage.setItem(key, JSON.stringify(history));

    set({ currentAssessment: null, assessmentHistory: history });
    return completed;
  },

  loadHistory: async (childId) => {
    const key = historyKey(childId);
    const raw = await AsyncStorage.getItem(key);
    const history: Assessment[] = raw ? JSON.parse(raw) : [];
    set({ assessmentHistory: history });
  },

  getPreAssessment: (childId) =>
    get().assessmentHistory.find((a) => a.childId === childId && a.type === 'pre'),

  getPostAssessment: (childId) =>
    get().assessmentHistory.find((a) => a.childId === childId && a.type === 'post'),
}));
