/**
 * Core Exercises Screen
 *
 * Presents the month-appropriate exercise queue for the current session.
 * Uses useFocusEffect to advance the queue each time the user returns
 * from exercise-player (after a Unity exercise completes).
 */
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useChildStore } from '@/stores/childStore';
import { useSessionStore } from '@/stores/sessionStore';
import { getExerciseById } from '@/constants/exercises';
import { getSessionExerciseIds } from '@/constants/sessionProtocol';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { Exercise } from '@/types';

export default function CoreExercisesScreen() {
  const router = useRouter();
  const { activeChild } = useChildStore();
  const { currentSession, advancePhase } = useSessionStore();

  const [currentIdx, setCurrentIdx] = useState(0);
  const isFirstFocus = useRef(true);

  const sessionNumber = currentSession?.sessionNumber ?? activeChild?.currentSessionNumber ?? 2;
  const { coreIds } = getSessionExerciseIds(sessionNumber);
  const exercises = coreIds
    .map((id) => getExerciseById(id))
    .filter((e): e is Exercise => e !== undefined);

  const isDone = currentIdx >= exercises.length;
  const currentExercise = exercises[currentIdx];
  const progress = exercises.length > 0 ? currentIdx / exercises.length : 0;

  // Each time we return from exercise-player, advance to the next exercise
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setCurrentIdx((i) => Math.min(i + 1, exercises.length));
    }, [exercises.length])
  );

  if (!activeChild || !currentSession) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Session state lost. Please return home.</Text>
        <TouchableOpacity onPress={() => router.replace('/(main)/home')}>
          <Text style={styles.errorLink}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLaunchExercise = () => {
    if (!currentExercise) return;
    router.push({
      pathname: '/(session)/exercise-player',
      params: { exerciseId: currentExercise.id, level: '1' },
    });
  };

  const handleSkip = () => {
    setCurrentIdx((i) => Math.min(i + 1, exercises.length));
  };

  const handleContinueToCoolDown = () => {
    advancePhase();
    router.replace('/(session)/cool-down');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(main)/home')}>
          <Text style={styles.backText}>✕ End Session</Text>
        </TouchableOpacity>
        <View style={styles.phaseTag}>
          <Text style={styles.phaseTagText}>⚡ Core · 20 min</Text>
        </View>
      </View>

      <ProgressBar
        progress={progress}
        label={`${currentIdx} of ${exercises.length} complete`}
        showPercent={false}
        style={styles.progressBar}
      />

      {isDone ? (
        /* All exercises finished */
        <Card elevated style={styles.doneCard}>
          <Text style={styles.doneIcon}>🎯</Text>
          <Text style={styles.doneTitle}>Core Exercises Complete!</Text>
          <Text style={styles.doneBody}>
            Great work. Time for a cool-down to consolidate today's motor learning.
          </Text>
          <Button
            label="Begin Cool-Down →"
            onPress={handleContinueToCoolDown}
            fullWidth
            size="lg"
            style={styles.doneBtn}
          />
        </Card>
      ) : (
        <>
          {currentExercise && (
            <Card elevated style={styles.exerciseCard}>
              <Text style={styles.counter}>
                Exercise {currentIdx + 1} of {exercises.length}
              </Text>
              <Text style={styles.exerciseTitle}>{currentExercise.displayName}</Text>
              <Text style={styles.exerciseDesc}>{currentExercise.description}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>⏱ {currentExercise.durationSeconds}s</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaText}>
                    📡 {currentExercise.motionTracking.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>

              {currentExercise.neuroplasticityNote && (
                <Text style={styles.neuroNote}>{currentExercise.neuroplasticityNote}</Text>
              )}
            </Card>
          )}

          <Button
            label={`Launch ${currentExercise?.displayName ?? 'Exercise'} →`}
            onPress={handleLaunchExercise}
            fullWidth
            size="lg"
          />
          <Button
            label="Skip this exercise"
            onPress={handleSkip}
            variant="secondary"
            fullWidth
            size="md"
          />

          {/* Allow jumping to cool-down early if needed (e.g. dysregulation) */}
          {currentIdx > 0 && (
            <TouchableOpacity onPress={handleContinueToCoolDown} style={styles.earlyExit}>
              <Text style={styles.earlyExitText}>Skip to Cool-Down</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgApp },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  backText: { color: Colors.error, fontSize: Typography.size.base },
  phaseTag: {
    backgroundColor: '#fff3e0',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  phaseTagText: { color: '#e65100', fontWeight: '600', fontSize: Typography.size.sm },
  progressBar: {},
  exerciseCard: { gap: Spacing.sm },
  counter: { fontSize: Typography.size.sm, fontWeight: '700', color: Colors.primary },
  exerciseTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  exerciseDesc: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  metaPill: {
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  metaText: { fontSize: Typography.size.sm, color: Colors.dark },
  neuroNote: {
    fontSize: Typography.size.sm,
    color: Colors.primary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  doneCard: { alignItems: 'center', gap: Spacing.md, padding: Spacing.xl },
  doneIcon: { fontSize: 64 },
  doneTitle: { fontSize: Typography.size.xl, fontWeight: '700', color: Colors.textPrimary },
  doneBody: {
    fontSize: Typography.size.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  doneBtn: { alignSelf: 'stretch' },
  earlyExit: { alignItems: 'center', paddingVertical: Spacing.sm },
  earlyExitText: { color: Colors.textMuted, fontSize: Typography.size.sm },
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
  errorLink: { color: Colors.primary, fontSize: Typography.size.base, fontWeight: '600' },
});
