import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useChildStore } from '@/stores/childStore';
import { useSessionStore } from '@/stores/sessionStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { CATALYST_PROGRAM } from '@/constants/sessionProtocol';
import type { PerformanceZone } from '@/types';

const ZONE_COLORS: Record<PerformanceZone, string> = {
  green: Colors.green,
  yellow: Colors.yellow,
  red: Colors.red,
  invalid: Colors.textMuted,
};

export default function ProgressScreen() {
  const { activeChild } = useChildStore();
  const { sessionHistory } = useSessionStore();

  if (!activeChild) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Select a child on the Home tab to view progress.</Text>
      </View>
    );
  }

  const childSessions = sessionHistory.filter((s) => s.childId === activeChild.id);
  const completedSessions = childSessions.filter((s) => s.completedAt).length;
  const adherence = completedSessions / CATALYST_PROGRAM.totalSessions;

  // Aggregate exercise performance
  const exerciseMap: Record<string, { total: number; success: number; zone: PerformanceZone }> = {};
  for (const session of childSessions) {
    for (const result of session.exerciseResults) {
      if (!exerciseMap[result.exerciseId]) {
        exerciseMap[result.exerciseId] = { total: 0, success: 0, zone: 'yellow' };
      }
      exerciseMap[result.exerciseId].total += result.attemptCount;
      exerciseMap[result.exerciseId].success += result.successCount;
      exerciseMap[result.exerciseId].zone = result.performanceZone;
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.childName}>{activeChild.name}</Text>

      {/* Program Overview */}
      <Card elevated style={styles.overviewCard}>
        <Text style={styles.cardTitle}>Program Overview</Text>
        <ProgressBar
          progress={adherence}
          label={`Sessions: ${completedSessions} / ${CATALYST_PROGRAM.totalSessions}`}
          showPercent
          style={styles.progressBar}
        />
        <View style={styles.statsRow}>
          <StatBox label="Sessions Done" value={String(completedSessions)} />
          <StatBox label="Weak Side" value={activeChild.hemisphereWeakness === 'undetermined' ? 'TBD' : activeChild.hemisphereWeakness.toUpperCase()} />
          <StatBox label="Adherence" value={`${Math.round(adherence * 100)}%`} />
        </View>
      </Card>

      {/* Exercise Performance */}
      <Text style={styles.sectionTitle}>Exercise Performance</Text>
      {Object.entries(exerciseMap).length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No exercise data yet. Complete sessions to see results.</Text>
        </Card>
      ) : (
        Object.entries(exerciseMap).map(([exerciseId, data]) => {
          const accuracy = data.total > 0 ? data.success / data.total : 0;
          return (
            <Card key={exerciseId} style={styles.exerciseCard}>
              <View style={styles.exerciseRow}>
                <View
                  style={[
                    styles.zoneDot,
                    { backgroundColor: ZONE_COLORS[data.zone] },
                  ]}
                />
                <Text style={styles.exerciseId}>{exerciseId.replace(/_/g, ' ')}</Text>
                <Text style={styles.exerciseAccuracy}>{Math.round(accuracy * 100)}%</Text>
              </View>
              <ProgressBar progress={accuracy} color={ZONE_COLORS[data.zone]} height={4} />
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgApp },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  title: { fontSize: Typography.size.xxl, fontWeight: '700', color: Colors.textPrimary, paddingTop: Spacing.xl },
  childName: { fontSize: Typography.size.lg, color: Colors.primary, fontWeight: '600' },
  overviewCard: { gap: Spacing.md },
  cardTitle: { fontSize: Typography.size.lg, fontWeight: '700', color: Colors.textPrimary },
  progressBar: {},
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgApp,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: Typography.size.xl, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: Typography.size.xs, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: '700', color: Colors.textPrimary },
  exerciseCard: { gap: Spacing.sm },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  zoneDot: { width: 10, height: 10, borderRadius: 5 },
  exerciseId: { flex: 1, fontSize: Typography.size.base, color: Colors.textPrimary, textTransform: 'capitalize' },
  exerciseAccuracy: { fontSize: Typography.size.base, fontWeight: '600', color: Colors.textSecondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyText: { fontSize: Typography.size.base, color: Colors.textMuted, textAlign: 'center' },
});
