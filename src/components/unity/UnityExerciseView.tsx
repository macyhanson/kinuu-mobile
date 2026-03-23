/**
 * Unity Exercise View
 *
 * Embeds a Unity scene for exercise playback.
 * Uses react-native-unity-view (requires bare workflow + custom dev client).
 *
 * Communication protocol between React Native and Unity:
 *   RN → Unity: postMessage({ type, payload })
 *   Unity → RN: onUnityMessage({ type, payload })
 *
 * Message types:
 *   RN→Unity: 'START_EXERCISE' | 'PAUSE' | 'RESUME' | 'END_EXERCISE' | 'SET_LEVEL' | 'SET_SIDE'
 *   Unity→RN: 'EXERCISE_COMPLETE' | 'RESULT_UPDATE' | 'REGULATION_EVENT' | 'KEYPOINTS_UPDATE'
 */

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import type { ExerciseResult, MotionDataSample } from '@/types';

export interface UnityExerciseConfig {
  scene: string;
  level: number;
  side: 'left' | 'right' | 'bilateral';
  childId: string;
  sessionId: string;
  exerciseId: string;
}

interface UnityMessage {
  type: string;
  payload: Record<string, unknown>;
}

interface Props {
  config: UnityExerciseConfig;
  onExerciseComplete: (result: ExerciseResult) => void;
  onRegulationEvent: () => void;
  onKeypointsUpdate?: (sample: MotionDataSample) => void;
  onReady?: () => void;
}

export function UnityExerciseView({
  config,
  onExerciseComplete,
  onRegulationEvent,
  onKeypointsUpdate,
  onReady,
}: Props) {
  const unityRef = useRef<unknown>(null);

  const sendToUnity = useCallback((message: UnityMessage) => {
    if (unityRef.current) {
      // (unityRef.current as UnityViewRef).postMessage(JSON.stringify(message));
      console.log('[Unity] Send:', message);
    }
  }, []);

  const handleUnityMessage = useCallback(
    (rawMessage: string) => {
      try {
        const message: UnityMessage = JSON.parse(rawMessage);

        switch (message.type) {
          case 'READY':
            onReady?.();
            sendToUnity({
              type: 'START_EXERCISE',
              payload: {
                scene: config.scene,
                level: config.level,
                side: config.side,
              },
            });
            break;

          case 'EXERCISE_COMPLETE': {
            const result: ExerciseResult = {
              exerciseId: config.exerciseId,
              sessionId: config.sessionId,
              level: config.level,
              attemptCount: (message.payload.attemptCount as number) ?? 0,
              successCount: (message.payload.successCount as number) ?? 0,
              accuracyPercent: (message.payload.accuracyPercent as number) ?? 0,
              performanceZone:
                (message.payload.performanceZone as ExerciseResult['performanceZone']) ?? 'yellow',
              completedAt: new Date().toISOString(),
              side: config.side === 'bilateral' ? 'bilateral' : config.side,
            };
            onExerciseComplete(result);
            break;
          }

          case 'REGULATION_EVENT':
            onRegulationEvent();
            break;

          case 'KEYPOINTS_UPDATE':
            if (onKeypointsUpdate) {
              onKeypointsUpdate(message.payload as unknown as MotionDataSample);
            }
            break;

          default:
            console.warn('[Unity] Unknown message type:', message.type);
        }
      } catch (err) {
        console.error('[Unity] Failed to parse message:', err);
      }
    },
    [config, onExerciseComplete, onRegulationEvent, onKeypointsUpdate, onReady, sendToUnity]
  );

  // Unity is only available in bare workflow with native build
  const isUnityAvailable = false; // set to true when native module is installed

  if (!isUnityAvailable || Platform.OS === 'web') {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>{config.scene}</Text>
        <Text style={styles.placeholderSub}>
          Unity exercise · Level {config.level} · Side: {config.side}
        </Text>
        <Text style={styles.placeholderNote}>
          Unity view available in native build.{'\n'}Run: expo run:ios / expo run:android
        </Text>
      </View>
    );
  }

  // When react-native-unity-view is installed:
  // const UnityView = require('react-native-unity-view').default;
  // return (
  //   <UnityView
  //     ref={unityRef}
  //     style={styles.unity}
  //     onUnityMessage={(e) => handleUnityMessage(e.nativeEvent.message)}
  //   />
  // );

  return <View style={styles.placeholder} />;
}

const styles = StyleSheet.create({
  unity: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: Colors.darker,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 32,
  },
  placeholderTitle: {
    color: Colors.primaryLight,
    fontSize: Typography.size.lg,
    fontWeight: '600',
  },
  placeholderSub: {
    color: Colors.white,
    fontSize: Typography.size.base,
  },
  placeholderNote: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    textAlign: 'center',
    marginTop: 16,
  },
});
