# BrainyAct Mobile — Architecture

## Tech Stack
| Layer | Technology |
|---|---|
| App framework | React Native + Expo SDK 51 (Expo Router v3) |
| Language | TypeScript (strict) |
| State management | Zustand |
| Offline storage | AsyncStorage |
| Motion tracking | TensorFlow.js MoveNet OR LightBuzz SDK |
| Exercise engine | Unity (embedded via react-native-unity-view) |
| Navigation | Expo Router (file-based) |

## Directory Structure
```
src/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (session restore)
│   ├── index.tsx           # Entry router
│   ├── (auth)/             # Login, signup, forgot password
│   ├── (onboarding)/       # Welcome, child profile setup
│   ├── (main)/             # Tab navigator: Home, Progress, Reports, Settings
│   ├── (assessment)/       # Pre/post assessment flow
│   ├── (session)/          # Warm-up, exercise player, cool-down
│   └── (offline)/          # Self-regulation (no internet)
├── components/
│   ├── ui/                 # Button, Card, ProgressBar
│   ├── session/            # RegulationCheck, PhaseIndicator
│   ├── unity/              # UnityExerciseView (RN↔Unity bridge)
│   └── dashboard/          # ChildCard, ProgressChart
├── stores/                 # Zustand state
│   ├── authStore           # Auth + token
│   ├── childStore          # Child profiles
│   ├── sessionStore        # Active session + history
│   └── assessmentStore     # Assessment results + hemisphere scoring
├── services/
│   ├── api.ts              # Base fetch client (backend-ready)
│   ├── authService         # Login/signup
│   └── motionTracking      # TF / LightBuzz abstraction
├── constants/
│   ├── theme               # Colors, typography, spacing
│   ├── exercises           # Full exercise library (assessment + play)
│   ├── selfRegulation      # Offline calm exercises
│   └── sessionProtocol     # Program rules, phases, regulation protocol
└── types/                  # All TypeScript interfaces
```

## Unity Integration
Unity scenes are embedded via `react-native-unity-view`.

**Requires:** bare workflow (`expo eject` or `expo prebuild`)

**Message protocol (RN ↔ Unity):**
- RN → Unity: `START_EXERCISE | PAUSE | RESUME | END_EXERCISE | SET_LEVEL | SET_SIDE`
- Unity → RN: `EXERCISE_COMPLETE | RESULT_UPDATE | REGULATION_EVENT | KEYPOINTS_UPDATE`

Unity scenes follow naming convention: `{Mode}_{ExerciseName}` (e.g., `Assessment_FigureEights`, `Play_CrossCrawl`)

## Motion Tracking
Two providers, switched via `EXPO_PUBLIC_MOTION_PROVIDER`:

1. **TensorFlow MoveNet** (default) — free, runs on-device, ~30 FPS
   - Models: `SINGLEPOSE_THUNDER` (accurate) or `SINGLEPOSE_LIGHTNING` (fast)
   - Package: `@tensorflow/tfjs` + `@tensorflow-models/pose-detection` + `@tensorflow/tfjs-react-native`

2. **LightBuzz** (preferred for clinical accuracy) — $24k/yr license
   - Native iOS/Android module required
   - Covers more device types, better 3D tracking
   - Integration: native module via bare workflow

## Session Protocol (Catalyst Version)
- 32 sessions total (Session 1 = Pre-Assessment, Session 32 = Post-Assessment)
- 30 play sessions (2-31)
- Sessions 2-16: exercises start on WEAK hemisphere side
- Sessions 17-31: switch to opposite side
- 3-phase structure per session: Warm-Up (5m) → Core (20m) → Cool-Down (5m)
- Regulation check: any dysregulation → return to warm-up, do not resume trigger exercise

## Assessment → Hemisphere Determination
Assessment exercises are run with left/right side variants. The side with lower accuracy scores becomes the `hemisphereWeakness`. Primary signals: Fukuda rotation, Balance asymmetry, Figure Eights side comparison.

## Offline Mode
Self-regulation exercises in `/(offline)/self-regulation` require:
- No camera
- No internet
- No Unity

They use countdown timers + written/animated instructions only.

## Backend Integration
`src/services/api.ts` is a ready API client. Set `EXPO_PUBLIC_API_URL` to connect.
Currently all data is stored locally via AsyncStorage. Migration to remote is additive.
