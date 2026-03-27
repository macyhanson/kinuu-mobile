# BrainyActMobile — Codebase Analysis
> Generated: 2026-03-23 | Branch: `claude/analyze-brainyact-app-c4h7e`

---

## Summary

The app has a solid architectural foundation: the type system is comprehensive, Zustand stores are cleanly structured, the exercise/protocol constants accurately reflect the clinical design, and the routing groups match the intended UX flow. However, several **critical bugs and missing screens** will prevent the app from functioning end-to-end today.

---

## Critical Bugs

### 1. Assessment never computes hemisphere weakness
**File:** `src/app/(assessment)/pre-assessment.tsx:70` + `src/stores/assessmentStore.ts:72-78`

`handleCompleteAssessment` always passes the initial zeroed-out `hemisphereResult` from `startAssessment` into `completeAssessment`:

```ts
// pre-assessment.tsx:70
const result = await completeAssessment(currentAssessment.hemisphereResult);
// ↑ This is always { leftScore:0, rightScore:0, weakness:'undetermined' }
```

`completeAssessment` accepts `providedResult` as a required (non-optional) argument and short-circuits the `deriveHemisphereWeakness` call via `??`. Because `providedResult` is never `null/undefined`, the derivation function is unreachable.

**Result:** Every assessment ends with `weakness: 'undetermined'`, making the hemisphere-targeted exercise protocol inoperative.

**Fix:** Either make `providedResult` optional in the store signature, or don't pass `currentAssessment.hemisphereResult` from the screen — let the store derive it from recorded exercise results.

---

### 2. Assessment exercises crash in exercise-player (no active session)
**File:** `src/app/(assessment)/pre-assessment.tsx:51-56`

`handleLaunchExercise` pushes to `/(session)/exercise-player`, but `exercise-player.tsx` requires `currentSession` from `sessionStore`. The assessment flow uses `assessmentStore` — it never calls `sessionStore.startSession()`.

```ts
// exercise-player.tsx:36-45
if (!exercise || !activeChild || !currentSession) {
  return <ErrorView />; // always hits this during assessment
}
```

**Result:** Every "Launch Exercise" tap in the assessment flow shows the error fallback screen.

**Fix:** Either (a) start a synthetic session in `sessionStore` at assessment start, or (b) pass an `isAssessment` flag to exercise-player and source state from `assessmentStore` instead.

---

### 3. Broken route: `/(session)/core-exercises` does not exist
**File:** `src/app/(session)/warm-up.tsx:51`

```ts
router.replace('/(session)/core-exercises'); // screen does not exist
```

The file `src/app/(session)/core-exercises.tsx` was never created. Tapping "Begin Core Exercises" will produce a navigation error.

---

### 4. `deriveHemisphereWeakness` only tracks left-side exercises in `determinedBy`
**File:** `src/stores/assessmentStore.ts:29-34`

```ts
if (result.side === 'left') {
  leftScores.push(result.accuracyPercent);
  determinedBy.push(result.exerciseId); // ← only pushed for left
} else if (result.side === 'right') {
  rightScores.push(result.accuracyPercent);
  // determinedBy not updated here
}
```

The `determinedBy` array will only ever list left-side exercises regardless of which side actually determined the result.

---

### 5. `abandonSession` discards regulation data
**File:** `src/stores/sessionStore.ts:85-87`

```ts
abandonSession: async (_reason) => {
  set({ currentSession: null, isDysregulated: false });
},
```

Abandoned sessions (early exits, dysregulation walk-offs) are never persisted to AsyncStorage. Regulation events recorded up to that point are lost. This matters clinically — early exits and their triggers are meaningful data.

---

## Missing Screens / Incomplete Flow

| Screen | Status | Impact |
|--------|--------|--------|
| `/(session)/core-exercises` | **Missing** | Session flow broken at warm-up completion |
| `/(session)/cool-down` | **Missing** | No cool-down phase possible |
| `/(main)/progress` | Exists as file, content unknown | Progress tab may be empty |
| `/(main)/reports` | Exists as file, content unknown | Reports tab may be empty |

### No play session exercise selection logic
There is no screen or store function that selects *which exercises* to present in a play session or in what order. `PLAY_EXERCISES` has 13 exercises but nothing orchestrates which subset runs per session or per monthly target.

### Session number not incremented after play sessions
`pre-assessment.tsx:72-74` increments `currentSessionNumber` after an assessment. No equivalent logic exists for play sessions — `currentSessionNumber` will never advance past session 2 after the pre-assessment.

### Communication profile selection incomplete
`warm-up.tsx:54-58` only branches on `isVerbal` → `verbal` / `minimalVerbal`. The `demandAvoidant` and `sensitiveSensory` profiles (defined in `sessionProtocol.ts`) are never selected even when `child.sensoryProfile.demandAvoidant === true`. This is clinically important: demand-avoidant children require a fundamentally different interaction style.

---

## Motion Tracking Issues

### `detectWeakSide` uses wrong signal
**File:** `src/services/motionTracking.ts:126-148`

The function compares shoulder keypoint *confidence scores* (model certainty the keypoint is visible) as a proxy for motor weakness. A lower confidence score means the camera can't see the landmark — not that the side is motorically weaker. This will produce garbage results.

Real side detection requires kinematic analysis: range of motion, symmetry of excursion, timing asymmetry — not model confidence.

### TensorFlow detector creation is commented out
**File:** `src/services/motionTracking.ts:71-74`

The actual MoveNet detector is commented out. `initTensorFlow` only calls `tf.ready()` — no pose detection model is loaded. `startTracking()` and `stopTracking()` are empty stubs.

---

## Protocol Compliance Notes

### Side-switch threshold is correct ✓
`exercise-player.tsx:47-56` checks `sessionNumber <= 16` for weak-side exercises. This correctly targets sessions 2-16 (play sessions 1-15) on the weak side, switching at session 17, matching `CATALYST_PROGRAM.sideSwitchAfterPlaySession: 15`.

### Regulation protocol is correctly modeled ✓
`REGULATION_PROTOCOL` in `sessionProtocol.ts`, `RegulationCheck` component, and `returnToWarmUp` in `sessionStore` correctly implement the "stop + return, do not resume" rule.

### Neuroplasticity notes are accurate ✓
The notes in `sessionProtocol.ts` and `exercises.ts` accurately reflect the clinical rationale (RAS priming, corpus callosum, cerebellar consolidation).

### BDPQ exercise tracking mode may be wrong
`bdpq` uses `motionTracking: 'hand'`, but BDPQ/Stick Figures is a visual-cognitive letter discrimination task — hand tracking is only relevant if the child responds by pointing/touching. If the response is verbal or on-screen tap, `motionTracking: 'none'` would be more accurate.

---

## Recommended Build Order

Given the bugs above, the highest-leverage work to make a runnable end-to-end session is:

1. **Create `/(session)/core-exercises.tsx`** — exercise queue screen that pulls from `PLAY_EXERCISES`, presents each in sequence, advances through the queue, then routes to cool-down.
2. **Create `/(session)/cool-down.tsx`** — mirrors warm-up, uses self-regulation-style activities, persists session on complete and increments `currentSessionNumber`.
3. **Fix the assessment → exercise-player integration** — start a session or thread `assessmentStore` into exercise-player.
4. **Fix `completeAssessment` to actually derive hemisphere weakness** from recorded exercise results.
5. **Add play session exercise selection** — even a simple ordered subset per session number is enough to start.
6. **Wire `demandAvoidant` profile** into warm-up and session communication guidance.
7. **Implement real motion tracking** — at minimum connect the MoveNet detector; replace confidence-score side detection with kinematic asymmetry.
