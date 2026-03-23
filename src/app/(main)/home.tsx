import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useChildStore } from '@/stores/childStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { CATALYST_PROGRAM } from '@/constants/sessionProtocol';
import type { ChildProfile } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { children, activeChild, setActiveChild } = useChildStore();

  const handleStartSession = (child: ChildProfile) => {
    setActiveChild(child.id);
    const isAssessmentSession =
      CATALYST_PROGRAM.assessmentSessions.includes(child.currentSessionNumber as 1 | 32);

    if (isAssessmentSession) {
      router.push('/(assessment)/pre-assessment');
    } else {
      router.push('/(session)/warm-up');
    }
  };

  const handleOfflineMode = () => {
    router.push('/(offline)/self-regulation');
  };

  const progressPct = activeChild
    ? activeChild.currentSessionNumber / CATALYST_PROGRAM.totalSessions
    : 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>
            {children.length} {children.length === 1 ? 'child' : 'children'} enrolled
          </Text>
        </View>
        <TouchableOpacity
          style={styles.offlineBtn}
          onPress={handleOfflineMode}
        >
          <Text style={styles.offlineBtnText}>🌿 Calm</Text>
        </TouchableOpacity>
      </View>

      {/* Active Child Progress */}
      {activeChild && (
        <Card elevated style={styles.activeCard}>
          <View style={styles.activeHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {activeChild.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.activeInfo}>
              <Text style={styles.activeName}>{activeChild.name}</Text>
              <Text style={styles.activeSession}>
                Session {activeChild.currentSessionNumber} of {CATALYST_PROGRAM.totalSessions}
              </Text>
            </View>
            <View style={styles.hemisphereTag}>
              <Text style={styles.hemisphereText}>
                {activeChild.hemisphereWeakness === 'undetermined'
                  ? '—'
                  : `${activeChild.hemisphereWeakness.charAt(0).toUpperCase()}${activeChild.hemisphereWeakness.slice(1)} focus`}
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={progressPct}
            label="Program Progress"
            showPercent
            style={styles.progressBar}
          />

          <Button
            label={
              CATALYST_PROGRAM.assessmentSessions.includes(activeChild.currentSessionNumber as 1 | 32)
                ? 'Start Assessment'
                : 'Start Session'
            }
            onPress={() => handleStartSession(activeChild)}
            fullWidth
            size="lg"
            style={styles.startBtn}
          />
        </Card>
      )}

      {/* All Children */}
      <Text style={styles.sectionTitle}>All Children</Text>
      {children.map((child) => (
        <TouchableOpacity
          key={child.id}
          onPress={() => setActiveChild(child.id)}
          activeOpacity={0.8}
        >
          <Card
            style={[
              styles.childCard,
              activeChild?.id === child.id && styles.childCardActive,
            ]}
          >
            <View style={styles.childRow}>
              <View style={[styles.avatar, styles.avatarSm]}>
                <Text style={styles.avatarTextSm}>
                  {child.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childMeta}>
                  Age {child.age} · Session {child.currentSessionNumber}/{CATALYST_PROGRAM.totalSessions}
                </Text>
              </View>
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>
                  {Math.round((child.currentSessionNumber / CATALYST_PROGRAM.totalSessions) * 100)}%
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Add Child */}
      <Button
        label="+ Add Child"
        onPress={() => router.push('/(onboarding)/child-profile')}
        variant="secondary"
        fullWidth
        style={styles.addBtn}
      />

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push('/(main)/progress')}
        >
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionLabel}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push('/(main)/reports')}
        >
          <Text style={styles.quickActionIcon}>📄</Text>
          <Text style={styles.quickActionLabel}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleOfflineMode}
        >
          <Text style={styles.quickActionIcon}>🌿</Text>
          <Text style={styles.quickActionLabel}>Self-Regulate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => router.push('/(main)/settings')}
        >
          <Text style={styles.quickActionIcon}>⚙️</Text>
          <Text style={styles.quickActionLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  greeting: {
    fontSize: Typography.size.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textMuted,
    marginTop: 2,
  },
  offlineBtn: {
    backgroundColor: '#e8f5e9',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  offlineBtnText: {
    fontSize: Typography.size.sm,
    color: '#388e3c',
    fontWeight: '600',
  },
  activeCard: {
    gap: Spacing.md,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.size.xl,
    fontWeight: '700',
  },
  avatarSm: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarTextSm: {
    color: Colors.white,
    fontSize: Typography.size.lg,
    fontWeight: '700',
  },
  activeInfo: {
    flex: 1,
  },
  activeName: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  activeSession: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  hemisphereTag: {
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  hemisphereText: {
    fontSize: Typography.size.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    marginVertical: Spacing.xs,
  },
  startBtn: {},
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  childCard: {
    marginBottom: Spacing.xs,
  },
  childCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: Typography.size.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  childMeta: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sessionBadge: {
    backgroundColor: Colors.bgApp,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  sessionBadgeText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  addBtn: {
    marginTop: Spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});
