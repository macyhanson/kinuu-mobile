import type { SelfRegulationExercise } from '@/types';

/**
 * Offline self-regulation exercises.
 * Based on Week 1-2 protocols: regulation before motor learning.
 * These require NO internet and NO camera.
 */
export const SELF_REGULATION_EXERCISES: SelfRegulationExercise[] = [
  {
    id: 'deep_pressure_roll',
    type: 'deep_pressure',
    name: 'Deep Pressure Rolling',
    durationSeconds: 300,
    instruction:
      'Lie on a soft mat. Slowly roll a large ball or pillow over your legs, trunk, and arms with firm, steady pressure. Count slowly: one... two... three. Let your body feel the weight.',
    adaptations: [
      {
        condition: 'tactile_defensive',
        instruction: 'Place a blanket between the ball and body. Start with the legs only.',
      },
      {
        condition: 'seeks_heavy_input',
        instruction: 'Increase pressure slightly and add gentle joint compressions between rolls.',
      },
    ],
    neuroplasticityNote:
      'Deep pressure activates Golgi tendon organs and muscle spindles, sending calming signals to the somatosensory cortex and reducing sympathetic arousal.',
  },
  {
    id: 'joint_compressions',
    type: 'joint_compressions',
    name: 'Joint Compressions',
    durationSeconds: 300,
    instruction:
      'Sit comfortably. Apply gentle firm pressure to each joint: shoulders (press down), elbows (squeeze and release), wrists, hips, knees, ankles. Hold each for 2 seconds, pause 1 second, repeat 5-10 times per joint.',
    adaptations: [
      {
        condition: 'tactile_defensive',
        instruction: 'Apply compressions through a compression shirt or blanket.',
      },
      {
        condition: 'seeks_heavy_input',
        instruction: 'Increase pressure slightly and add slow, firm downward strokes along the limb between compressions.',
      },
    ],
    neuroplasticityNote:
      'Joint compressions stimulate Ruffini endings and Pacinian corpuscles, rapidly calming the autonomic nervous system and sharpening the brain\'s body map.',
  },
  {
    id: 'slow_rocking',
    type: 'slow_rocking',
    name: 'Slow Rhythmic Rocking',
    durationSeconds: 300,
    instruction:
      'Sit or lie down. Rock slowly and rhythmically — side to side or front to back. Breathe slowly. Hum a low, steady tone if comfortable. Let the child lead the pace.',
    adaptations: [
      {
        condition: 'tactile_defensive',
        instruction: 'Allow the child to rock independently on a therapy ball or rocking chair.',
      },
    ],
    neuroplasticityNote:
      'Slow vestibular input activates the parasympathetic nervous system and promotes neurochemical shift from active learning to memory consolidation.',
  },
  {
    id: 'bear_walk',
    type: 'animal_walk',
    name: 'Bear Walk',
    durationSeconds: 120,
    instruction:
      'Walk on hands and feet with hips up — like a bear. Move slowly across the room. No need to say anything — just do it and let the child watch and join if they want.',
    adaptations: [
      {
        condition: 'low_motor_delay',
        instruction: 'Place cushions on the floor to reduce the distance to the ground.',
      },
      { condition: 'nonverbal', instruction: 'Model only — no animal names or verbal prompts needed.' },
    ],
    neuroplasticityNote:
      'Quadrupedal locomotion activates central pattern generators in novel patterns, driving faster neuroplastic change than familiar walking.',
  },
  {
    id: 'crab_walk',
    type: 'animal_walk',
    name: 'Crab Walk',
    durationSeconds: 120,
    instruction:
      'Sit on the floor, place hands behind you, lift your hips, and walk backward. Model it yourself first — make it playful. No demand to copy.',
    adaptations: [
      {
        condition: 'low_motor_delay',
        instruction: 'Allow sitting scoot as a precursor. Progress to full crab walk over sessions.',
      },
    ],
    neuroplasticityNote:
      'Crab walk activates posterior shoulder, triceps, and hip flexors in an unfamiliar pattern, challenging praxis circuits.',
  },
  {
    id: 'slow_breathing',
    type: 'slow_breathing',
    name: 'Slow Deep Breathing',
    durationSeconds: 180,
    instruction:
      'Breathe in slowly for 4 counts, hold for 2 counts, breathe out slowly for 6 counts. Place one hand on your belly — feel it rise and fall. Do this together with the child.',
    adaptations: [
      {
        condition: 'demand_avoidant',
        instruction: 'Do not ask the child to breathe — just model it yourself nearby. Let them observe and join.',
      },
    ],
    neuroplasticityNote:
      'Slow exhalation activates the vagus nerve, promoting parasympathetic regulation and reducing cortisol that impairs motor learning.',
  },
  {
    id: 'bubble_watch',
    type: 'bubble_watch',
    name: 'Bubble Watching',
    durationSeconds: 180,
    instruction:
      'Blow bubbles slowly in front of the child. Watch them float together. Let the child reach for or pop them at their own pace. No instructions needed.',
    adaptations: [
      { condition: 'auditoryAvoidant', instruction: 'Blow bubbles farther away to reduce visual overwhelm.' },
      {
        condition: 'seeks_heavy_input',
        instruction: 'Allow the child to blow bubbles themselves — sustained exhalation activates the vagus nerve.',
      },
    ],
    neuroplasticityNote:
      'Slow, iridescent visual stimulation activates parasympathetic downregulation with minimal arousal demand. Bubble blowing independently activates the vagus nerve.',
  },
  {
    id: 'visual_tracking_toy',
    type: 'visual_tracking',
    name: 'Visual Tracking',
    durationSeconds: 300,
    instruction:
      'Slowly move a preferred toy in a horizontal arc at the child\'s eye level (12-18 inches away). Left to right, right to left, then up/down, then diagonal. Watch the child\'s eyes — not the toy.',
    adaptations: [
      { condition: 'light_sensitive', instruction: 'Use a physical toy, not a flashlight or LED.' },
      {
        condition: 'tactile_defensive',
        instruction: 'Try bubbles if the child won\'t track a toy — nearly universally engaging.',
      },
    ],
    neuroplasticityNote:
      'Smooth pursuit eye movements strengthen frontal eye field and cerebellar circuits, which are frequently immature in ASD, improving visual attention.',
  },
];
