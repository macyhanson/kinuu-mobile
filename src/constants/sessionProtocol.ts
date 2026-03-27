/**
 * BrainyAct Catalyst Version Session Protocol
 * 4 months | 32 sessions | 2x/week | ~30 min
 * Sessions 1 & 32 = Assessment
 * Sessions 2-16 = Start on WEAK side (left if left-hemisphere weak)
 * Sessions 17-31 = Switch to opposite side
 */

export const CATALYST_PROGRAM = {
  totalSessions: 32,
  assessmentSessions: [1, 32],
  playSessions: Array.from({ length: 30 }, (_, i) => i + 2),
  /** After session 15 of play (session 16 overall), switch sides */
  sideSwitchAfterPlaySession: 15,
  targetDurationMinutes: 30,
  sessionsPerWeek: 2,
  durationMonths: 4,
} as const;

export const SESSION_PHASES = {
  warm_up: {
    id: 'warm_up',
    label: 'Warm-Up',
    durationMinutes: 5,
    purpose: 'Activate vestibular and proprioceptive systems; bring arousal to the learning zone.',
    neuroplasticityNote:
      'Primes the reticular activating system for motor learning. NOT optional — skipping this impairs learning in the core phase.',
  },
  core: {
    id: 'core',
    label: 'Core Activities',
    durationMinutes: 20,
    purpose: 'Primary motor skill targets. Gross motor first (proximal stability), then fine/perceptual-motor (distal precision).',
    neuroplasticityNote:
      'Neural circuits strengthen through successful, regulated repetitions — not duration alone.',
  },
  cool_down: {
    id: 'cool_down',
    label: 'Cool-Down',
    durationMinutes: 5,
    purpose: 'Slow, rhythmic, calming activity. Consolidates motor learning through parasympathetic shift.',
    neuroplasticityNote:
      'Parasympathetic shift enhances hippocampal and cerebellar memory consolidation.',
  },
} as const;

export const REGULATION_PROTOCOL = {
  signs: [
    'Crying',
    'Freezing',
    'Fleeing',
    'Self-injurious behavior',
    'Extended distress stimming',
  ],
  immediateAction: 'Stop current activity. Return to warm-up phase (heavy work or deep pressure).',
  resumeRule: 'Do NOT resume the triggering activity in this session.',
  rationale:
    'Cortisol release during stress directly impairs hippocampal and cerebellar circuits. Protecting regulation IS protecting progress.',
} as const;

export const COMMUNICATION_PROFILES = {
  verbal: {
    label: 'Verbal (some language, follows simple directions)',
    guidance: 'Use 1-3 word cues paired with gestures. Never rely on language alone — always pair with visual or physical cue.',
  },
  minimalVerbal: {
    label: 'Minimally verbal or nonverbal',
    guidance: 'Use only gestures, modeling, and environmental setup. The space does the teaching.',
  },
  sensitiveSensory: {
    label: 'High sensory sensitivity',
    guidance: 'Start in child\'s preferred sensory state. Introduce sound/sensory elements only after regulation is established.',
  },
  demandAvoidant: {
    label: 'Demand avoidant',
    guidance: 'Never use directive language ("do this", "your turn"). Set up activity and model. Let curiosity drive initiation. If no engagement after 2-3 min, move on without comment.',
  },
} as const;

// ─── Exercise Selection ────────────────────────────────────────────────────────

/**
 * Month-appropriate exercise pools for play sessions.
 * Returns IDs — resolve with getExerciseById from constants/exercises.
 *
 * Month 1 (sessions 2-9):   Foundational vestibular + gross motor
 * Month 2 (sessions 10-17): Bilateral integration + cross-midline
 * Month 3 (sessions 18-25): Motor planning, sequencing, rhythm
 * Month 4 (sessions 26-31): Cognitive-motor full suite
 */
const SESSION_EXERCISE_POOLS: Record<1 | 2 | 3 | 4, { warmUpIds: string[]; coreIds: string[] }> = {
  1: {
    warmUpIds: ['obstacle_challenge'],
    coreIds: ['hopscotch', 'moving_sidewalk', 'cross_crawl_play', 'figure_eights_play'],
  },
  2: {
    warmUpIds: ['obstacle_challenge'],
    coreIds: ['figure_eights_play', 'cross_crawl_play', 'dance_auditory', 'dance_sequence'],
  },
  3: {
    warmUpIds: ['obstacle_challenge'],
    coreIds: ['dance_sequence', 'cross_crawl_play', 'camera_game', 'drawing'],
  },
  4: {
    warmUpIds: ['obstacle_challenge'],
    coreIds: ['dance_sequence', 'digit_span_play', 'timed_sorting', 'dichotic_listening'],
  },
};

/**
 * Returns warm-up and core exercise IDs for a given play session number (2-31).
 * Session 1 = pre-assessment, session 32 = post-assessment — not handled here.
 */
export function getSessionExerciseIds(sessionNumber: number): { warmUpIds: string[]; coreIds: string[] } {
  // Map overall session number to play session index (session 2 = play session 1)
  const playSession = Math.max(1, sessionNumber - 1);
  let month: 1 | 2 | 3 | 4;
  if (playSession <= 8) month = 1;
  else if (playSession <= 16) month = 2;
  else if (playSession <= 24) month = 3;
  else month = 4;
  return SESSION_EXERCISE_POOLS[month];
}

/** Month-by-month neurological targets */
export const MONTHLY_TARGETS = [
  {
    month: 1,
    weeks: [1, 2, 3, 4],
    label: 'Foundational Motor Skills',
    target: 'Senses and early sensory-motor. Body awareness, antigravity muscle strengthening, vestibular activation, proprioceptive calibration, basic cause-effect motor experience.',
    techBridge: 'Move the Light (Phase 1) — any movement produces positive response.',
  },
  {
    month: 2,
    weeks: [5, 6, 7, 8],
    label: 'Postural & Bilateral Development',
    target: 'Core stability, bilateral integration, cross-midline movements.',
    techBridge: 'Follow the Float, Cross the Space come online.',
  },
  {
    month: 3,
    weeks: [9, 10, 11, 12],
    label: 'Motor Planning & Sequencing',
    target: 'Praxis, motor sequencing, timing, rhythm integration.',
    techBridge: 'Dance Sequence, Cross Crawl to the Beat.',
  },
  {
    month: 4,
    weeks: [13, 14, 15, 16],
    label: 'Cognitive-Motor Integration',
    target: 'Higher-order coordination, auditory-motor coupling, visual-motor integration, working memory under movement.',
    techBridge: 'Full exercise suite — all exercises active.',
  },
] as const;
