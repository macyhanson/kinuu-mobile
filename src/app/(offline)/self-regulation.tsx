/**
 * Offline Self-Regulation Screen
 *
 * Accessible without internet. Simple guided exercises for regulation.
 * Based on Week 1-2 protocol warm-up and cool-down activities.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SELF_REGULATION_EXERCISES } from '@/constants/selfRegulation';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { SelfRegulationExercise } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  deep_pressure: '🤲',
  joint_compressions: '💪',
  slow_rocking: '🌊',
  animal_walk: '🐻',
  slow_breathing: '🌬️',
  bubble_watch: '🫧',
  visual_tracking: '👁️',
};

export default function SelfRegulationScreen() {
  const router = useRouter();
  const [activeExercise, setActiveExercise] = useState<SelfRegulationExercise | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const startExercise = (exercise: SelfRegulationExercise) => {
    setActiveExercise(exercise);
    setTimeLeft(exercise.durationSeconds);
    setIsRunning(true);
  };

  const stopExercise = () => {
    setIsRunning(false);
    setActiveExercise(null);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (activeExercise) {
    const progress = 1 - timeLeft / activeExercise.durationSeconds;
    return (
      <View style={styles.activeRoot}>
        <View style={styles.activeHeader}>
          <TouchableOpacity onPress={stopExercise}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.activeTitle}>{activeExercise.name}</Text>
          <View style={{ width: 32 }} />
        </View>

        <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerLabel}>{isRunning ? 'in progress' : 'done'}</Text>
        </Animated.View>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>{activeExercise.instruction}</Text>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>Neuroscience Note</Text>
          <Text style={styles.noteText}>{activeExercise.neuroplasticityNote}</Text>
        </View>

        {/* Progress ring (simple bar) */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <Button
          label={isRunning ? 'Stop' : 'Done'}
          onPress={stopExercise}
          variant={isRunning ? 'ghost' : 'primary'}
          fullWidth
          style={styles.stopBtn}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Self-Regulation</Text>
          <Text style={styles.subtitle}>No internet required · Any time, anywhere</Text>
        </View>
      </View>

      <Card style={styles.infoCard}>
        <Text style={styles.infoText}>
          These exercises help regulate the nervous system before or between sessions.
          Regulation is the foundation of learning — a calm nervous system learns best.
        </Text>
      </Card>

      {SELF_REGULATION_EXERCISES.map((exercise) => (
        <TouchableOpacity
          key={exercise.id}
          onPress={() => startExercise(exercise)}
          activeOpacity={0.8}
        >
          <Card style={styles.exerciseCard}>
            <View style={styles.exerciseRow}>
              <View style={styles.exerciseIcon}>
                <Text style={styles.exerciseIconText}>
                  {CATEGORY_ICONS[exercise.type] ?? '🌿'}
                </Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDuration}>
                  {Math.floor(exercise.durationSeconds / 60)} min
                </Text>
              </View>
              <View style={styles.startIcon}>
                <Text style={styles.startIconText}>▶</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backText: {
    color: '#388e3c',
    fontSize: Typography.size.lg,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: '700',
    color: '#1b5e20',
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: '#4caf50',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#f1f8e9',
    borderColor: '#a5d6a7',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.size.sm,
    color: '#2e7d32',
    lineHeight: 20,
  },
  exerciseCard: {
    backgroundColor: Colors.white,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIconText: {
    fontSize: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  exerciseDuration: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  startIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startIconText: {
    color: Colors.white,
    fontSize: 14,
  },

  // Active exercise
  activeRoot: {
    flex: 1,
    backgroundColor: '#1b5e20',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  closeBtn: {
    color: '#a5d6a7',
    fontSize: Typography.size.xl,
    padding: Spacing.xs,
  },
  activeTitle: {
    color: Colors.white,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#81c784',
    marginVertical: Spacing.md,
  },
  timerText: {
    color: Colors.white,
    fontSize: Typography.size.display,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    color: '#a5d6a7',
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  instructionCard: {
    backgroundColor: '#2e7d32',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '100%',
  },
  instructionText: {
    color: Colors.white,
    fontSize: Typography.size.base,
    lineHeight: 24,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    width: '100%',
  },
  noteLabel: {
    color: '#a5d6a7',
    fontSize: Typography.size.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  noteText: {
    color: '#c8e6c9',
    fontSize: Typography.size.sm,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#2e7d32',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#81c784',
    borderRadius: 3,
  },
  stopBtn: {
    marginTop: Spacing.sm,
  },
});
