/**
 * Motion Tracking Service
 *
 * Abstraction layer supporting two providers:
 *   1. TensorFlow.js MoveNet (free, open-source, runs on-device)
 *   2. LightBuzz Skeleton Tracking SDK (commercial, $24k/yr, native iOS/Android)
 *
 * The provider is selected via EXPO_PUBLIC_MOTION_PROVIDER env var.
 * Default: tensorflow_movenet
 *
 * LightBuzz integration requires the native module to be built
 * into the Expo app (bare workflow or custom dev client).
 */

import type { MotionDataSample, MotionTrackingProvider, Keypoint } from '@/types';

export type MotionTrackingStatus = 'idle' | 'initializing' | 'tracking' | 'error' | 'unsupported';

export interface MotionTrackingConfig {
  provider: MotionTrackingProvider;
  targetFPS: number;
  minConfidence: number;
  /** For LightBuzz: the camera device to use */
  cameraDevice?: 'front' | 'back';
}

const DEFAULT_CONFIG: MotionTrackingConfig = {
  provider: (process.env.EXPO_PUBLIC_MOTION_PROVIDER as MotionTrackingProvider) ?? 'tensorflow_movenet',
  targetFPS: 30,
  minConfidence: 0.4,
  cameraDevice: 'front',
};

class MotionTrackingService {
  private config: MotionTrackingConfig = DEFAULT_CONFIG;
  private status: MotionTrackingStatus = 'idle';
  private listeners: ((sample: MotionDataSample) => void)[] = [];

  getStatus(): MotionTrackingStatus {
    return this.status;
  }

  getProvider(): MotionTrackingProvider {
    return this.config.provider;
  }

  async initialize(config?: Partial<MotionTrackingConfig>): Promise<void> {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.status = 'initializing';

    try {
      if (this.config.provider === 'tensorflow_movenet') {
        await this.initTensorFlow();
      } else if (this.config.provider === 'lightbuzz') {
        await this.initLightBuzz();
      }
      this.status = 'idle';
    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  private detector: unknown = null;

  private async initTensorFlow(): Promise<void> {
    const tf = await import('@tensorflow/tfjs');
    await import('@tensorflow/tfjs-react-native');
    await tf.ready();

    const poseDetection = await import('@tensorflow-models/pose-detection');
    this.detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
    );
    console.log('[MotionTracking] TensorFlow MoveNet initialized');
  }

  private async initLightBuzz(): Promise<void> {
    // LightBuzz native module — requires bare workflow + native build
    // const LightBuzz = require('@lightbuzz/skeleton-tracking-rn').default;
    // await LightBuzz.initialize({ license: process.env.EXPO_PUBLIC_LIGHTBUZZ_LICENSE });
    console.log('[MotionTracking] LightBuzz SDK initialized (placeholder)');
  }

  onPose(callback: (sample: MotionDataSample) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /** Emit a pose sample (called internally or from native bridge) */
  emitPose(sample: MotionDataSample): void {
    if (sample.confidence >= this.config.minConfidence) {
      this.listeners.forEach((l) => l(sample));
    }
  }

  async startTracking(): Promise<void> {
    this.status = 'tracking';
    // Real implementation: start camera feed → run model → emit poses
  }

  async stopTracking(): Promise<void> {
    this.status = 'idle';
    // Real implementation: stop camera feed and model inference
  }

  /**
   * Analyze collected motion data for a specific exercise.
   * Returns accuracy score 0-100.
   */
  analyzeExerciseData(samples: MotionDataSample[], exerciseId: string): number {
    if (samples.length === 0) return 0;
    // Placeholder: average confidence as proxy for accuracy
    // Real: exercise-specific kinematic analysis
    const avgConfidence =
      samples.reduce((sum, s) => sum + s.confidence, 0) / samples.length;
    return Math.round(avgConfidence * 100);
  }

  /**
   * Detect which side (left/right) shows movement deficit.
   * Used during Fukuda, balance, and asymmetric exercises.
   *
   * Method: compares range of motion (x-axis excursion) of homologous limb
   * keypoints (wrist, elbow, knee, ankle). The side with significantly less
   * excursion has lower motor output and is considered the weaker side.
   *
   * Requires at least 30 samples for a reliable reading.
   */
  detectWeakSide(samples: MotionDataSample[]): 'left' | 'right' | 'undetermined' {
    if (samples.length < 30) return 'undetermined';

    const LIMB_PAIRS: Array<[keyof typeof samples[0]['keypoints'][0], keyof typeof samples[0]['keypoints'][0]]> = [];
    const LEFT_LANDMARKS = ['left_wrist', 'left_elbow', 'left_knee', 'left_ankle'] as const;
    const RIGHT_LANDMARKS = ['right_wrist', 'right_elbow', 'right_knee', 'right_ankle'] as const;

    /** Compute range of x-positions for a named keypoint across all samples */
    const rangeOfMotion = (landmarkName: string): number => {
      const xs = samples
        .map((s) => s.keypoints.find((k) => k.name === landmarkName))
        .filter((k): k is NonNullable<typeof k> => k !== undefined && k.score > 0.4)
        .map((k) => k.x);
      if (xs.length < 5) return 0;
      return Math.max(...xs) - Math.min(...xs);
    };

    const leftROM = LEFT_LANDMARKS.reduce((sum, name) => sum + rangeOfMotion(name), 0);
    const rightROM = RIGHT_LANDMARKS.reduce((sum, name) => sum + rangeOfMotion(name), 0);

    // Require at least 10% asymmetry to call a side weak
    const total = leftROM + rightROM;
    if (total === 0) return 'undetermined';
    const asymmetry = Math.abs(leftROM - rightROM) / total;
    if (asymmetry < 0.1) return 'undetermined';

    return leftROM < rightROM ? 'left' : 'right';
  }
}

export const motionTracking = new MotionTrackingService();
