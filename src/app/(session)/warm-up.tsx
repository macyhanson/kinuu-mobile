/**
 * Session Warm-Up Screen
 *
 * Guides caregiver through the 5-min warm-up phase before exercises.
 * Adapts instructions based on child's sensory profile.
 * Per protocol: this phase is NOT optional — it primes RAS for motor learning.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useChildStore } from '@/stores/childStore';
import { useSessionStore } from '@/stores/sessionStore';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { SESSION_PHASES, COMMUNICATION_PROFILES } from '@/constants/sessionProtocol';

const WARM_UP_ACTIVITIES = [
  {
    id: 'deep_pressure',
    name: 'Deep Pressure / Joint Compressions',
    icon: '🤲',
    duration: '3 min',
    instruction:
      'Apply gentle, firm pressure to major joints: shoulders, elbows, wrists, hips, knees, ankles. 2 seconds per joint, 5-10 reps each. Count slowly aloud.',
  },
  {
    id: 'animal_walk',
    name: 'Animal Walk',
    icon: '🐻',
    duration: '2 min',
    instruction:
      'Model a bear walk (hands and feet, hips up) across the room. No demand to copy — just model and let curiosity drive participation.',
  },
];

export default function WarmUpScreen() {
  const router = useRouter();
  const { activeChild } = useChildStore();
  const { currentSession, advancePhase } = useSessionStore();
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  const toggle = (id: string) => {
    setCompletedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    advancePhase();
    router.replace('/(session)/core-exercises');
  };

  const communicationProfile = activeChild
    ? activeChild.isVerbal
      ? COMMUNICATION_PROFILES.verbal
      : COMMUNICATION_PROFILES.minimalVerbal
    : COMMUNICATION_PROFILES.verbal;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(main)/home')}>
          <Text style={styles.backText}>✕ End Session</Text>
        </TouchableOpacity>
        <View style={styles.phaseTag}>
          <Text style={styles.phaseTagText}>🌅 Warm-Up · 5 min</Text>
        </View>
      </View>

      {/* Why warm-up matters */}
      <Card style={styles.purposeCard}>
        <Text style={styles.purposeTitle}>Why This Matters</Text>
        <Text style={styles.purposeText}>{SESSION_PHASES.warm_up.neuroplasticityNote}</Text>
      </Card>

      {/* Communication guidance */}
      {activeChild && (
        <Card style={styles.commCard}>
          <Text style={styles.commLabel}>Communication Approach</Text>
          <Text style={styles.commProfile}>{communicationProfile.label}</Text>
          <Text style={styles.commText}>{communicationProfile.guidance}</Text>
        </Card>
      )}

      {/* Activities */}
      <Text style={styles.sectionTitle}>Warm-Up Activities</Text>
      {WARM_UP_ACTIVITIES.map((activity) => {
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

      {/* Safety reminder */}
      <Card style={styles.safetyCard}>
        <Text style={styles.safetyTitle}>⚠️ Regulation Check</Text>
        <Text style={styles.safetyText}>
          If the child shows any signs of dysregulation — crying, freezing, fleeing — stop and stay in warm-up. Never move to core activities while dysregulated.
        </Text>
      </Card>

      <Button
        label="Begin Core Exercises →"
        onPress={handleContinue}
        fullWidth
        size="lg"
        style={styles.continueBtn}
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
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  phaseTagText: { color: Colors.primary, fontWeight: '600', fontSize: Typography.size.sm },
  purposeCard: { backgroundColor: Colors.primaryPale, borderColor: Colors.primaryLight },
  purposeTitle: { fontWeight: '700', color: Colors.dark, fontSize: Typography.size.base, marginBottom: 4 },
  purposeText: { color: Colors.dark, fontSize: Typography.size.sm, lineHeight: 20 },
  commCard: { borderColor: Colors.border },
  commLabel: { fontSize: Typography.size.xs, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  commProfile: { fontSize: Typography.size.base, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  commText: { fontSize: Typography.size.sm, color: Colors.textSecondary, marginTop: 4, lineHeight: 20 },
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
  safetyCard: { backgroundColor: '#fff8e1', borderColor: '#ffe082' },
  safetyTitle: { fontWeight: '700', fontSize: Typography.size.base, color: '#f57c00', marginBottom: 4 },
  safetyText: { fontSize: Typography.size.sm, color: '#795548', lineHeight: 20 },
  continueBtn: {},
});
