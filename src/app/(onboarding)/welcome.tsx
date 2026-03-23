import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>B</Text>
        </View>
        <Text style={styles.title}>Welcome to BrainyAct</Text>
        <Text style={styles.subtitle}>
          A neuroscience-based program to build brain-body connections for learning, attention, and behavior.
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '🧠', label: 'Neuroscience-Based', desc: '16-week program designed around neuroplasticity principles.' },
          { icon: '📡', label: 'Motion Tracking', desc: 'Real-time skeletal tracking guides each exercise.' },
          { icon: '📊', label: 'Progress Reports', desc: 'Pre and post assessments show measurable improvement.' },
          { icon: '🌿', label: 'Offline Calm Mode', desc: 'Self-regulation exercises available anytime, no internet needed.' },
        ].map((f) => (
          <View key={f.icon} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button
        label="Set Up First Child →"
        onPress={() => router.push('/(onboarding)/child-profile')}
        fullWidth
        size="lg"
      />
      <Button
        label="I'm a Therapist / Clinician"
        onPress={() => router.push('/(onboarding)/child-profile')}
        variant="secondary"
        fullWidth
        size="md"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgApp },
  content: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xxl, paddingTop: Spacing.xxl },
  hero: { alignItems: 'center', gap: Spacing.md },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: Colors.white, fontSize: 48, fontWeight: '700' },
  title: { fontSize: Typography.size.xxl, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: Typography.size.base, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  features: { gap: Spacing.md },
  featureRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  featureIcon: { fontSize: 28, width: 40 },
  featureText: { flex: 1, gap: 2 },
  featureLabel: { fontWeight: '700', fontSize: Typography.size.base, color: Colors.textPrimary },
  featureDesc: { fontSize: Typography.size.sm, color: Colors.textMuted, lineHeight: 18 },
});
