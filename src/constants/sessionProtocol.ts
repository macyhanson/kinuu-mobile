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
