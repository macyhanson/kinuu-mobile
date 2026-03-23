import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionRecord, SessionPhase, ExerciseResult, RegulationEvent } from '@/types';

interface SessionState {
  currentSession: SessionRecord | null;
  currentPhase: SessionPhase;
  sessionHistory: SessionRecord[];
  isDysregulated: boolean;

  startSession: (session: SessionRecord) => void;
  advancePhase: () => void;
  recordExerciseResult: (result: ExerciseResult) => void;
  flagDysregulation: (event: RegulationEvent) => void;
  returnToWarmUp: () => void;
  completeSession: () => Promise<void>;
  abandonSession: (reason: string) => Promise<void>;
  loadHistory: (childId: string) => Promise<void>;
}

const historyKey = (childId: string) => `@brainyact:sessions:${childId}`;

const PHASE_ORDER: SessionPhase[] = ['warm_up', 'core', 'cool_down'];

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  currentPhase: 'warm_up',
  sessionHistory: [],
  isDysregulated: false,

  startSession: (session) => {
    set({ currentSession: session, currentPhase: 'warm_up', isDysregulated: false });
  },

  advancePhase: () => {
    const current = get().currentPhase;
    const idx = PHASE_ORDER.indexOf(current);
    if (idx < PHASE_ORDER.length - 1) {
      set({ currentPhase: PHASE_ORDER[idx + 1] });
    }
  },

  recordExerciseResult: (result) => {
    const session = get().currentSession;
    if (!session) return;
    set({
      currentSession: {
        ...session,
        exerciseResults: [...session.exerciseResults, result],
      },
    });
  },

  flagDysregulation: (event) => {
    const session = get().currentSession;
    if (!session) return;
    set({
      isDysregulated: true,
      currentSession: {
        ...session,
        regulationEvents: [...session.regulationEvents, event],
      },
    });
  },

  returnToWarmUp: () => {
    set({ currentPhase: 'warm_up', isDysregulated: false });
  },

  completeSession: async () => {
    const session = get().currentSession;
    if (!session) return;
    const completed: SessionRecord = {
      ...session,
      completedAt: new Date().toISOString(),
    };
    const key = historyKey(session.childId);
    const existing = await AsyncStorage.getItem(key);
    const history: SessionRecord[] = existing ? JSON.parse(existing) : [];
    history.push(completed);
    await AsyncStorage.setItem(key, JSON.stringify(history));
    set({ currentSession: null, sessionHistory: history });
  },

  abandonSession: async (_reason) => {
    set({ currentSession: null, isDysregulated: false });
  },

  loadHistory: async (childId) => {
    const key = historyKey(childId);
    const raw = await AsyncStorage.getItem(key);
    const history: SessionRecord[] = raw ? JSON.parse(raw) : [];
    set({ sessionHistory: history });
  },
}));
