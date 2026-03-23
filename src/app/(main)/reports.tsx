import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useChildStore } from '@/stores/childStore';
import { useAssessmentStore } from '@/stores/assessmentStore';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function ReportsScreen() {
  const { activeChild } = useChildStore();
  const { assessmentHistory } = useAssessmentStore();

  const childAssessments = assessmentHistory.filter((a) => a.childId === activeChild?.id);
  const pre = childAssessments.find((a) => a.type === 'pre');
  const post = childAssessments.find((a) => a.type === 'post');

  if (!activeChild) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Select a child on the Home tab to view reports.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.childName}>{activeChild.name}</Text>

      {pre ? (
        <AssessmentCard label="Pre-Assessment" assessment={pre} />
      ) : (
        <Card style={styles.pendingCard}>
          <Text style={styles.pendingText}>Pre-assessment not yet completed (Session 1).</Text>
        </Card>
      )}

      {post ? (
        <AssessmentCard label="Post-Assessment" assessment={post} />
      ) : (
        <Card style={styles.pendingCard}>
          <Text style={styles.pendingText}>Post-assessment available at Session 32.</Text>
        </Card>
      )}

      {pre && post && (
        <Card elevated style={styles.improvementCard}>
          <Text style={styles.improvementTitle}>Overall Improvement</Text>
          <Text style={styles.improvementValue}>
            {post.overallScore > pre.overallScore
              ? `+${Math.round(post.overallScore - pre.overallScore)}%`
              : `${Math.round(post.overallScore - pre.overallScore)}%`}
          </Text>
          <Text style={styles.improvementLabel}>
            From {Math.round(pre.overallScore)}% → {Math.round(post.overallScore)}%
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

function AssessmentCard({ label, assessment }: { label: string; assessment: ReturnType<typeof useAssessmentStore.getState>['assessmentHistory'][0] }) {
  return (
    <Card elevated>
      <Text style={styles.assessmentLabel}>{label}</Text>
      <Text style={styles.assessmentDate}>
        {new Date(assessment.date).toLocaleDateString()}
      </Text>
      <View style={styles.hemisphereRow}>
        <View style={styles.hemisphereCol}>
          <Text style={styles.hemisphereScore}>{Math.round(assessment.hemisphereResult.leftScore)}%</Text>
          <Text style={styles.hemisphereColLabel}>Left</Text>
        </View>
        <View style={styles.hemisphereCol}>
          <Text style={styles.hemisphereScore}>{Math.round(assessment.hemisphereResult.rightScore)}%</Text>
          <Text style={styles.hemisphereColLabel}>Right</Text>
        </View>
        <View style={styles.hemisphereCol}>
          <Text style={[styles.hemisphereScore, { color: Colors.primary }]}>{Math.round(assessment.overallScore)}%</Text>
          <Text style={styles.hemisphereColLabel}>Overall</Text>
        </View>
      </View>
      <Text style={styles.weaknessNote}>
        Weakness: {assessment.hemisphereResult.weakness}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgApp },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  title: { fontSize: Typography.size.xxl, fontWeight: '700', color: Colors.textPrimary, paddingTop: Spacing.xl },
  childName: { fontSize: Typography.size.lg, color: Colors.primary, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyText: { fontSize: Typography.size.base, color: Colors.textMuted, textAlign: 'center' },
  pendingCard: { borderStyle: 'dashed' },
  pendingText: { color: Colors.textMuted, fontSize: Typography.size.base, textAlign: 'center' },
  improvementCard: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.xl, backgroundColor: Colors.primaryPale, borderColor: Colors.primaryLight },
  improvementTitle: { fontSize: Typography.size.base, fontWeight: '700', color: Colors.dark },
  improvementValue: { fontSize: Typography.size.display, fontWeight: '700', color: Colors.primary },
  improvementLabel: { fontSize: Typography.size.sm, color: Colors.dark },
  assessmentLabel: { fontSize: Typography.size.lg, fontWeight: '700', color: Colors.textPrimary },
  assessmentDate: { fontSize: Typography.size.sm, color: Colors.textMuted },
  hemisphereRow: { flexDirection: 'row', marginVertical: Spacing.md, gap: Spacing.md },
  hemisphereCol: { flex: 1, alignItems: 'center', gap: 2 },
  hemisphereScore: { fontSize: Typography.size.xl, fontWeight: '700', color: Colors.textPrimary },
  hemisphereColLabel: { fontSize: Typography.size.sm, color: Colors.textMuted },
  weaknessNote: { fontSize: Typography.size.sm, color: Colors.textMuted, textTransform: 'capitalize' },
});
