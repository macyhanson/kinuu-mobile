/**
 * Pre-Assessment Screen (Session 1 and Session 32)
 *
 * Walks through the Catalyst Version assessment protocol:
 * Face Scan → Fukuda → Balance → Figure Eights → Cross Crawl →
 * Dance → BDPQ → Piano Hands → Shoot the Object → Digit Span
 *
 * At the end: determines hemisphere weakness and updates child profile.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useChildStore } from '@/stores/childStore';
import { useAssessmentStore } from '@/stores/assessmentStore';
import { useSessionStore } from '@/stores/sessionStore';
import { ASSESSMENT_EXERCISES } from '@/constants/exercises';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { Assessment } from '@/types';
import { nanoid } from './utils';

export default function PreAssessmentScreen() {
  const router = useRouter();
  const { activeChild, updateChild } = useChildStore();
  const { startAssessment, currentAssessment, completeAssessment } = useAssessmentStore();
  const { startSession } = useSessionStore();

  const [currentIdx, setCurrentIdx] = useState(-1); // -1 = intro
  const [isComplete, setIsComplete] = useState(false);

  const isIntro = currentIdx === -1;
  const isDone = currentIdx >= ASSESSMENT_EXERCISES.length;
  const currentExercise = ASSESSMENT_EXERCISES[currentIdx];
  const progress = Math.max(0, currentIdx) / ASSESSMENT_EXERCISES.length;

  const handleStart = () => {
    if (!activeChild) return;
    const assessmentId = nanoid();
    startAssessment({
      id: assessmentId,
      childId: activeChild.id,
      type: activeChild.currentSessionNumber === 1 ? 'pre' : 'post',
      sessionNumber: activeChild.currentSessionNumber,
      date: new Date().toISOString(),
      exerciseResults: [],
      hemisphereResult: { leftScore: 0, rightScore: 0, weakness: 'undetermined', determinedBy: [] },
      overallScore: 0,
    });
    // Start a synthetic session so exercise-player can find currentSession
    startSession({
      id: assessmentId,
      childId: activeChild.id,
      sessionNumber: activeChild.currentSessionNumber,
      type: 'assessment',
      date: new Date().toISOString(),
      durationMinutes: 21,
      phase: 'core',
      exerciseResults: [],
      regulationEvents: [],
    });
    setCurrentIdx(0);
  };

  const handleLaunchExercise = () => {
    if (!currentExercise) return;
    router.push({
      pathname: '/(session)/exercise-player',
      params: { exerciseId: currentExercise.id, level: '1' },
    });
  };

  const handleNextExercise = () => {
    if (currentIdx < ASSESSMENT_EXERCISES.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      handleCompleteAssessment();
    }
  };

  const handleCompleteAssessment = async () => {
    if (!activeChild || !currentAssessment) return;
    try {
      // Pass no argument — store derives hemisphere weakness from recorded exercise results
      const result = await completeAssessment();
      await updateChild(activeChild.id, {
        hemisphereWeakness: result.hemisphereResult.weakness,
        currentSessionNumber: activeChild.currentSessionNumber + 1,
      });
      setIsComplete(true);
    } catch {
      Alert.alert('Error', 'Failed to complete assessment. Please try again.');
    }
  };

  if (isComplete) {
    return (
      <View style={styles.completeRoot}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={styles.completeTitle}>Assessment Complete!</Text>
        <Text style={styles.completeBody}>
          Hemisphere focus: <Text style={styles.highlight}>{activeChild?.hemisphereWeakness?.toUpperCase() ?? '—'}</Text>
        </Text>
        <Text style={styles.completeNote}>
          Sessions will now start on the {activeChild?.hemisphereWeakness ?? 'appropriate'} side to build strength in that hemisphere.
        </Text>
        <Button
          label="Go to Dashboard"
          onPress={() => router.replace('/(main)/home')}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.lg }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(main)/home')}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeChild?.currentSessionNumber === 1 ? 'Pre-Assessment' : 'Post-Assessment'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {!isIntro && <ProgressBar progress={progress} showPercent style={styles.progressBar} />}

      {isIntro ? (
        <>
          <View style={styles.introHero}>
            <Text style={styles.introIcon}>🧠</Text>
            <Text style={styles.introTitle}>Assessment</Text>
            <Text style={styles.introSubtitle}>
              {activeChild?.currentSessionNumber === 1
                ? 'Establishes your baseline and determines hemisphere focus'
                : 'Measures progress from Session 1 to today'}
            </Text>
          </View>

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>What to Expect</Text>
            <Text style={styles.infoText}>
              {ASSESSMENT_EXERCISES.length} exercises · ~21 minutes{'\n\n'}
              Each exercise measures a different aspect of motor skill and brain-body connection.
              Results determine which side needs the most support.
            </Text>
          </Card>

          {ASSESSMENT_EXERCISES.map((ex, i) => (
            <View key={ex.id} style={styles.exerciseItem}>
              <View style={styles.exerciseNum}>
                <Text style={styles.exerciseNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.exerciseName}>{ex.displayName}</Text>
              <Text style={styles.exerciseDuration}>{ex.durationSeconds}s</Text>
            </View>
          ))}

          <Button
            label="Begin Assessment"
            onPress={handleStart}
            fullWidth
            size="lg"
            style={styles.startBtn}
          />
        </>
      ) : (
        <>
          {currentExercise && (
            <Card elevated style={styles.exerciseCard}>
              <Text style={styles.exerciseCounter}>
                Exercise {currentIdx + 1} of {ASSESSMENT_EXERCISES.length}
              </Text>
              <Text style={styles.exerciseTitle}>{currentExercise.displayName}</Text>
              <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
              <View style={styles.exerciseMeta}>
                <Text style={styles.exerciseMetaItem}>⏱ {currentExercise.durationSeconds}s</Text>
                <Text style={styles.exerciseMetaItem}>
                  📡 {currentExercise.motionTracking.replace('_', ' ')}
                </Text>
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
            label="Mark Complete & Next"
            onPress={handleNextExercise}
            variant="secondary"
            fullWidth
            size="md"
          />
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
  backText: { color: Colors.textMuted, fontSize: Typography.size.xl, padding: 4 },
  headerTitle: { fontSize: Typography.size.lg, fontWeight: '700', color: Colors.textPrimary },
  progressBar: {},
  introHero: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg },
  introIcon: { fontSize: 64 },
  introTitle: { fontSize: Typography.size.xxl, fontWeight: '700', color: Colors.textPrimary },
  introSubtitle: { fontSize: Typography.size.base, color: Colors.textMuted, textAlign: 'center' },
  infoCard: { backgroundColor: Colors.primaryPale, borderColor: Colors.primaryLight },
  infoTitle: { fontWeight: '700', color: Colors.dark, fontSize: Typography.size.base, marginBottom: 4 },
  infoText: { fontSize: Typography.size.sm, color: Colors.dark, lineHeight: 20 },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  exerciseNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumText: { color: Colors.white, fontWeight: '700', fontSize: Typography.size.sm },
  exerciseName: { flex: 1, fontSize: Typography.size.base, color: Colors.textPrimary },
  exerciseDuration: { fontSize: Typography.size.sm, color: Colors.textMuted },
  startBtn: { marginTop: Spacing.md },
  exerciseCard: { gap: Spacing.sm },
  exerciseCounter: { fontSize: Typography.size.sm, color: Colors.primary, fontWeight: '700' },
  exerciseTitle: { fontSize: Typography.size.xxl, fontWeight: '700', color: Colors.textPrimary },
  exerciseDescription: { fontSize: Typography.size.base, color: Colors.textSecondary, lineHeight: 22 },
  exerciseMeta: { flexDirection: 'row', gap: Spacing.md },
  exerciseMetaItem: { fontSize: Typography.size.sm, color: Colors.textMuted },
  neuroNote: { fontSize: Typography.size.sm, color: Colors.primary, fontStyle: 'italic', lineHeight: 18 },
  completeRoot: {
    flex: 1,
    backgroundColor: Colors.bgApp,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  completeIcon: { fontSize: 72 },
  completeTitle: { fontSize: Typography.size.xxl, fontWeight: '700', color: Colors.textPrimary },
  completeBody: { fontSize: Typography.size.lg, color: Colors.textSecondary, textAlign: 'center' },
  highlight: { color: Colors.primary, fontWeight: '700' },
  completeNote: { fontSize: Typography.size.base, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
