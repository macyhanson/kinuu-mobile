/**
 * Cool-Down Screen (Phase 3)
 *
 * Slow, rhythmic, calming activities to consolidate motor learning via
 * parasympathetic shift (per session protocol). On completion:
 *   1. Persists the completed session to AsyncStorage
 *   2. Increments child's currentSessionNumber
 *   3. Routes to home
 *
 * NOT optional — parasympathetic shift enhances hippocampal + cerebellar memory consolidation.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useChildStore } from '@/stores/childStore';
import { useSessionStore } from '@/stores/sessionStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { SESSION_PHASES } from '@/constants/sessionProtocol';

const COOL_DOWN_ACTIVITIES = [
  {
    id: 'slow_breathing',
    name: 'Slow Breathing',
    icon: '🌬️',
    duration: '2 min',
    instruction:
      'Model slow, deep belly breaths. Breathe in for 4 counts, hold for 2, breathe out for 6. No demand — just model and breathe together.',
  },
  {
    id: 'slow_rocking',
    name: 'Slow Rocking / Swaying',
    icon: '🌊',
    duration: '2 min',
    instruction:
      'Gentle side-to-side rocking or swaying. Can be in caregiver\'s lap, a rocking chair, or standing. Rhythm should feel like slow waves.',
  },
  {
    id: 'heavy_work_finish',
    name: 'Heavy Work Finish',
    icon: '🤲',
    duration: '1 min',
    instruction:
      'Light joint compressions (shoulders, arms) or a brief wall push. Grounds the nervous system before transition.',
  },
];

export default function CoolDownScreen() {
  const router = useRouter();
  const { activeChild, updateChild } = useChildStore();
  const { currentSession, completeSession } = useSessionStore();
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const toggle = (id: string) => {
    setCompletedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleCompleteSession = async () => {
    if (!activeChild || !currentSession) return;
    setIsCompleting(true);
    try {
      await completeSession();
      await updateChild(activeChild.id, {
        currentSessionNumber: activeChild.currentSessionNumber + 1,
      });
      router.replace('/(main)/home');
    } catch {
      setIsCompleting(false);
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(main)/home')}>
          <Text style={styles.backText}>✕ End Session</Text>
        </TouchableOpacity>
        <View style={styles.phaseTag}>
          <Text style={styles.phaseTagText}>🌙 Cool-Down · 5 min</Text>
        </View>
      </View>

      {/* Why cool-down matters */}
      <Card style={styles.purposeCard}>
        <Text style={styles.purposeTitle}>Why This Matters</Text>
        <Text style={styles.purposeText}>{SESSION_PHASES.cool_down.neuroplasticityNote}</Text>
      </Card>

      {/* Activities */}
      <Text style={styles.sectionTitle}>Cool-Down Activities</Text>
      {COOL_DOWN_ACTIVITIES.map((activity) => {
        const done = completedActivities.includes(activity.id);
        return (
          <TouchableOpacity
            key={activity.id}
            onPress={() => toggle(activity.id)}
            activeOpacity={0.8}
          >
            <Card style={[styles.activityCard, done && styles.activityDone]}>
              <View style={styles.activityRow}>
                <Text style={styles.activityIcon}>{activity.icon}</Text>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityDuration}>{activity.duration}</Text>
                </View>
                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                  {done && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
              {!done && (
                <Text style={styles.activityInstruction}>{activity.instruction}</Text>
              )}
            </Card>
          </TouchableOpacity>
        );
      })}

      {/* Session summary */}
      {currentSession && (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Session Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Exercises completed</Text>
            <Text style={styles.summaryValue}>{currentSession.exerciseResults.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Regulation events</Text>
            <Text style={styles.summaryValue}>{currentSession.regulationEvents.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Session</Text>
            <Text style={styles.summaryValue}>#{currentSession.sessionNumber}</Text>
          </View>
        </Card>
      )}

      <Button
        label={isCompleting ? 'Saving…' : 'Complete Session ✓'}
        onPress={handleCompleteSession}
        fullWidth
        size="lg"
        style={styles.completeBtn}
      />
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
    backgroundColor: '#e8eaf6',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  phaseTagText: { color: '#3949ab', fontWeight: '600', fontSize: Typography.size.sm },
  purposeCard: { backgroundColor: Colors.primaryPale, borderColor: Colors.primaryLight },
  purposeTitle: { fontWeight: '700', color: Colors.dark, fontSize: Typography.size.base, marginBottom: 4 },
  purposeText: { color: Colors.dark, fontSize: Typography.size.sm, lineHeight: 20 },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: '700', color: Colors.textPrimary },
  activityCard: { gap: Spacing.sm },
  activityDone: { opacity: 0.7, borderColor: Colors.green },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  activityIcon: { fontSize: 28 },
  activityInfo: { flex: 1 },
  activityName: { fontWeight: '600', fontSize: Typography.size.base, color: Colors.textPrimary },
  activityDuration: { color: Colors.textMuted, fontSize: Typography.size.sm },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { borderColor: Colors.green, backgroundColor: Colors.green },
  checkmark: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  activityInstruction: { color: Colors.textSecondary, fontSize: Typography.size.sm, lineHeight: 20, paddingLeft: 44 },
  summaryCard: { gap: Spacing.sm, backgroundColor: Colors.offWhite },
  summaryTitle: { fontWeight: '700', color: Colors.textPrimary, fontSize: Typography.size.base },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: Typography.size.sm, color: Colors.textMuted },
  summaryValue: { fontSize: Typography.size.base, fontWeight: '700', color: Colors.textPrimary },
  completeBtn: {},
});
