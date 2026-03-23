// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'caregiver' | 'therapist' | 'clinician';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationName?: string; // for therapists/clinicians
  createdAt: string;
}

// ─── Child Profile ────────────────────────────────────────────────────────────

export type DiagnosisType = 'autism_level_1' | 'autism_level_2' | 'autism_level_3' | 'adhd' | 'dyslexia' | 'cross_categorical' | 'other';

export type HemisphereWeakness = 'left' | 'right' | 'undetermined';

export interface ChildProfile {
  id: string;
  caregiverId: string;
  name: string;
  dateOfBirth: string;
  age: number;
  diagnosis: DiagnosisType[];
  /** Determined from assessment; drives which side exercises start on */
  hemisphereWeakness: HemisphereWeakness;
  isVerbal: boolean;
  sensoryProfile: SensoryProfile;
  programVersion: 'catalyst' | 'clinical';
  currentSessionNumber: number; // 1-32 for Catalyst
  totalSessions: number;        // 32 for Catalyst
  enrolledAt: string;
}

export interface SensoryProfile {
  tactileDefensive: boolean;
  auditoryAvoidant: boolean;
  demandAvoidant: boolean;
  seeksHeavyInput: boolean;
  lightSensitive: boolean;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export type SessionPhase = 'warm_up' | 'core' | 'cool_down';
export type SessionType = 'assessment' | 'play';

export interface SessionRecord {
  id: string;
  childId: string;
  sessionNumber: number;
  type: SessionType;
  date: string;
  durationMinutes: number;
  phase: SessionPhase;
  completedAt?: string;
  exerciseResults: ExerciseResult[];
  regulationEvents: RegulationEvent[];
  notes?: string;
}

export interface RegulationEvent {
  timestamp: string;
  phase: SessionPhase;
  exerciseId?: string;
  action: 'dysregulation_detected' | 'returned_to_warmup' | 'session_paused' | 'session_ended_early';
}

// ─── Exercises ────────────────────────────────────────────────────────────────

export type ExerciseCategory =
  | 'gross_motor'
  | 'fine_motor'
  | 'visual_tracking'
  | 'vestibular'
  | 'proprioceptive'
  | 'auditory'
  | 'cognitive'
  | 'self_regulation';

export type ExercisePhase = 'warm_up' | 'core' | 'cool_down';
export type MotionTrackingMode = 'full_body' | 'upper_body' | 'hand' | 'eye' | 'none';

export interface Exercise {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: ExerciseCategory;
  phase: ExercisePhase;
  durationSeconds: number;
  /** Which Unity scene handles this exercise */
  unityScene: string;
  motionTracking: MotionTrackingMode;
  /** Levels 1-N; assessment uses its own level config */
  levels: ExerciseLevel[];
  /** Whether this exercise is available offline */
  offlineAvailable: boolean;
  adaptations: ExerciseAdaptation[];
  neuroplasticityNote?: string;
  availableInAssessment: boolean;
  availableInPlay: boolean;
}

export interface ExerciseLevel {
  level: number;
  description: string;
  successThreshold: number; // e.g. 0.7 = 70%
  successStreakRequired: number; // e.g. 3 = 3 times in a row
  windowMs?: number; // timing window for rhythm exercises
}

export interface ExerciseAdaptation {
  condition: 'tactile_defensive' | 'demand_avoidant' | 'nonverbal' | 'low_tone' | 'low_motor_delay' | 'advanced';
  instruction: string;
}

// ─── Exercise Results ─────────────────────────────────────────────────────────

export type PerformanceZone = 'green' | 'yellow' | 'red' | 'invalid';

export interface ExerciseResult {
  exerciseId: string;
  sessionId: string;
  level: number;
  attemptCount: number;
  successCount: number;
  accuracyPercent: number;
  performanceZone: PerformanceZone;
  completedAt: string;
  motionData?: MotionDataSample[];
  side?: 'left' | 'right' | 'bilateral';
}

// ─── Motion Tracking ──────────────────────────────────────────────────────────

export interface MotionDataSample {
  timestamp: number;
  keypoints: Keypoint[];
  confidence: number;
}

export interface Keypoint {
  name: KeypointName;
  x: number;
  y: number;
  z?: number;
  score: number;
}

export type KeypointName =
  | 'nose' | 'left_eye' | 'right_eye'
  | 'left_ear' | 'right_ear'
  | 'left_shoulder' | 'right_shoulder'
  | 'left_elbow' | 'right_elbow'
  | 'left_wrist' | 'right_wrist'
  | 'left_hip' | 'right_hip'
  | 'left_knee' | 'right_knee'
  | 'left_ankle' | 'right_ankle';

export type MotionTrackingProvider = 'tensorflow_movenet' | 'lightbuzz' | 'arkit' | 'none';

// ─── Assessment ───────────────────────────────────────────────────────────────

export type AssessmentType = 'pre' | 'post' | 'mid';

export interface Assessment {
  id: string;
  childId: string;
  type: AssessmentType;
  sessionNumber: number;
  date: string;
  completedAt?: string;
  exerciseResults: ExerciseResult[];
  hemisphereResult: HemisphereResult;
  overallScore: number;
}

export interface HemisphereResult {
  leftScore: number;
  rightScore: number;
  weakness: HemisphereWeakness;
  /** Exercises used to determine this */
  determinedBy: string[];
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressReport {
  childId: string;
  generatedAt: string;
  dateRange: { from: string; to: string };
  totalSessions: number;
  completedSessions: number;
  adherencePercent: number;
  preAssessment?: Assessment;
  postAssessment?: Assessment;
  improvementByExercise: ImprovementRecord[];
  overallImprovementPercent: number;
  regulationEvents: number;
  averageSessionDuration: number;
}

export interface ImprovementRecord {
  exerciseId: string;
  exerciseName: string;
  preScore: number;
  postScore: number;
  improvementPercent: number;
  trend: 'improving' | 'stable' | 'declining';
}

// ─── Offline / Self-Regulation ────────────────────────────────────────────────

export type SelfRegulationExerciseType =
  | 'deep_pressure'
  | 'joint_compressions'
  | 'slow_rocking'
  | 'animal_walk'
  | 'slow_breathing'
  | 'bubble_watch'
  | 'visual_tracking';

export interface SelfRegulationExercise {
  id: string;
  type: SelfRegulationExerciseType;
  name: string;
  durationSeconds: number;
  instruction: string;
  adaptations: { condition: string; instruction: string }[];
  neuroplasticityNote: string;
}
