/**
 * Exercise Player Screen
 *
 * Manages a single exercise within a session:
 * - Embeds Unity scene
 * - Monitors motion tracking data
 * - Handles regulation events
 * - Records result and advances session
 */
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UnityExerciseView } from '@/components/unity/UnityExerciseView';
import { RegulationCheck } from '@/components/session/RegulationCheck';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useSessionStore } from '@/stores/sessionStore';
import { useAssessmentStore } from '@/stores/assessmentStore';
import { useChildStore } from '@/stores/childStore';
import { getExerciseById } from '@/constants/exercises';
import { Colors, Typography, Spacing } from '@/constants/theme';
import type { ExerciseResult, MotionDataSample } from '@/types';

export default function ExercisePlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ exerciseId: string; level: string }>();
  const { activeChild } = useChildStore();
  const { currentSession, recordExerciseResult, flagDysregulation, returnToWarmUp, advancePhase } =
    useSessionStore();
  const { currentAssessment, recordResult: recordAssessmentResult } = useAssessmentStore();

  // Resolved values that work in both session and assessment modes
  const activeSessionId = currentSession?.id ?? currentAssessment?.id ?? '';
  const activeSessionPhase = currentSession?.phase ?? 'core';
  const activeSessionNumber = currentSession?.sessionNumber ?? activeChild?.currentSessionNumber ?? 1;

  const [showRegulationCheck, setShowRegulationCheck] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const motionSamples = useRef<MotionDataSample[]>([]);

  const exercise = getExerciseById(params.exerciseId ?? '');
  const level = parseInt(params.level ?? '1', 10);

  if (!exercise || !activeChild || (!currentSession && !currentAssessment)) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Session state lost. Please return to home.</Text>
        <TouchableOpacity onPress={() => router.replace('/(main)/home')}>
          <Text style={styles.errorLink}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const side =
    activeChild.hemisphereWeakness === 'left'
      ? activeSessionNumber <= 16
        ? 'left'
        : 'right'
      : activeChild.hemisphereWeakness === 'right'
      ? activeSessionNumber <= 16
        ? 'right'
        : 'left'
      : 'bilateral';

  const handleExerciseComplete = useCallback(
    (result: ExerciseResult) => {
      recordExerciseResult(result);
      // Also record in assessment store when an assessment is active
      if (currentAssessment) {
        recordAssessmentResult(result);
      }
      router.back();
    },
    [recordExerciseResult, recordAssessmentResult, currentAssessment, router]
  );

  const handleRegulationEvent = useCallback(() => {
    flagDysregulation({
      timestamp: new Date().toISOString(),
      phase: activeSessionPhase,
      exerciseId: exercise.id,
      action: 'dysregulation_detected',
    });
    setShowRegulationCheck(true);
  }, [flagDysregulation, activeSessionPhase, exercise]);

  const handleReturnToWarmUp = useCallback(() => {
    setShowRegulationCheck(false);
    flagDysregulation({
      timestamp: new Date().toISOString(),
      phase: activeSessionPhase,
      exerciseId: exercise.id,
      action: 'returned_to_warmup',
    });
    returnToWarmUp();
    router.replace('/(session)/warm-up');
  }, [flagDysregulation, returnToWarmUp, router, activeSessionPhase, exercise]);

  const handleEndSession = useCallback(() => {
    setShowRegulationCheck(false);
    flagDysregulation({
      timestamp: new Date().toISOString(),
      phase: activeSessionPhase,
      exerciseId: exercise.id,
      action: 'session_ended_early',
    });
    router.replace('/(main)/home');
  }, [flagDysregulation, router, activeSessionPhase, exercise]);

  const handleKeypointsUpdate = useCallback((sample: MotionDataSample) => {
    motionSamples.current.push(sample);
  }, []);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.displayName}</Text>
          <Text style={styles.levelLabel}>Level {level} · {side}</Text>
        </View>
        <TouchableOpacity onPress={handleRegulationEvent} style={styles.regulationBtn}>
          <Text style={styles.regulationBtnText}>⚠️</Text>
        </TouchableOpacity>
      </View>

      {/* Unity Exercise */}
      <View style={styles.unityContainer}>
        <UnityExerciseView
          config={{
            scene: exercise.unityScene,
            level,
            side,
            childId: activeChild.id,
            sessionId: activeSessionId,
            exerciseId: exercise.id,
          }}
          onExerciseComplete={handleExerciseComplete}
          onRegulationEvent={handleRegulationEvent}
          onKeypointsUpdate={handleKeypointsUpdate}
          onReady={() => setIsReady(true)}
        />
      </View>

      {/* Footer info */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          {exercise.neuroplasticityNote ?? exercise.description}
        </Text>
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devBtn}
            onPress={() =>
              handleExerciseComplete({
                exerciseId: exercise.id,
                sessionId: activeSessionId,
                level,
                attemptCount: 5,
                successCount: 4,
                accuracyPercent: 80,
                performanceZone: 'green',
                completedAt: new Date().toISOString(),
                side,
              })
            }
          >
            <Text style={styles.devBtnText}>[DEV] Simulate Complete</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Regulation Check Overlay */}
      {showRegulationCheck && (
        <RegulationCheck
          onReturnToWarmUp={handleReturnToWarmUp}
          onEndSession={handleEndSession}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.darker,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl + Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  backText: {
    color: Colors.primaryLight,
    fontSize: Typography.size.lg,
  },
  exerciseInfo: {
    flex: 1,
    alignItems: 'center',
  },
  exerciseName: {
    color: Colors.white,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  levelLabel: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  regulationBtn: {
    padding: Spacing.xs,
  },
  regulationBtnText: {
    fontSize: 22,
  },
  unityContainer: {
    flex: 1,
  },
  footer: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  footerNote: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  devBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  devBtnText: {
    color: Colors.primaryLight,
    fontSize: Typography.size.sm,
    fontFamily: 'monospace',
  },
  error: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: Colors.bgApp,
  },
  errorText: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorLink: {
    color: Colors.primary,
    fontSize: Typography.size.base,
    fontWeight: '600',
  },
});
