import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildStore } from '@/stores/childStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { DiagnosisType, ChildProfile } from '@/types';

const DIAGNOSES: { id: DiagnosisType; label: string }[] = [
  { id: 'autism_level_1', label: 'Autism Level 1' },
  { id: 'autism_level_2', label: 'Autism Level 2' },
  { id: 'autism_level_3', label: 'Autism Level 3' },
  { id: 'adhd', label: 'ADHD' },
  { id: 'dyslexia', label: 'Dyslexia' },
  { id: 'cross_categorical', label: 'Cross-Categorical' },
  { id: 'other', label: 'Other / Undiagnosed' },
];

export default function ChildProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addChild, setActiveChild } = useChildStore();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [diagnoses, setDiagnoses] = useState<DiagnosisType[]>([]);
  const [isVerbal, setIsVerbal] = useState<boolean | null>(null);
  const [tactileDefensive, setTactileDefensive] = useState(false);
  const [demandAvoidant, setDemandAvoidant] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleDiagnosis = (id: DiagnosisType) =>
    setDiagnoses((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);

  const calcAge = (dobStr: string): number => {
    const parts = dobStr.split('/');
    if (parts.length !== 3) return 0;
    const [m, d, y] = parts.map(Number);
    const birth = new Date(y, m - 1, d);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
    return age;
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Please enter the child\'s name.'); return; }
    if (isVerbal === null) { Alert.alert('Required', 'Please select a communication level.'); return; }

    setSaving(true);
    const age = calcAge(dob);
    const child: ChildProfile = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      caregiverId: user?.id ?? '',
      name: name.trim(),
      dateOfBirth: dob,
      age,
      diagnosis: diagnoses,
      hemisphereWeakness: 'undetermined',
      isVerbal,
      sensoryProfile: {
        tactileDefensive,
        auditoryAvoidant: false,
        demandAvoidant,
        seeksHeavyInput: false,
        lightSensitive: false,
      },
      programVersion: 'catalyst',
      currentSessionNumber: 1,
      totalSessions: 32,
      enrolledAt: new Date().toISOString(),
    };
    await addChild(child);
    setActiveChild(child.id);
    setSaving(false);
    router.replace('/(main)/home');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Child Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <Card>
        <Text style={styles.sectionLabel}>Basic Info</Text>
        <View style={styles.field}>
          <Text style={styles.label}>First Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Child's first name" placeholderTextColor={Colors.textMuted} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth (MM/DD/YYYY)</Text>
          <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="01/15/2020" placeholderTextColor={Colors.textMuted} keyboardType="numbers-and-punctuation" />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Diagnosis</Text>
        <Text style={styles.sectionNote}>Select all that apply</Text>
        <View style={styles.chips}>
          {DIAGNOSES.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.chip, diagnoses.includes(d.id) && styles.chipActive]}
              onPress={() => toggleDiagnosis(d.id)}
            >
              <Text style={[styles.chipText, diagnoses.includes(d.id) && styles.chipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Communication Level</Text>
        {[
          { val: true, label: 'Verbal', desc: 'Uses some language, follows simple directions' },
          { val: false, label: 'Minimally Verbal / Nonverbal', desc: 'Gestures, modeling, environmental setup' },
        ].map((opt) => (
          <TouchableOpacity
            key={String(opt.val)}
            style={[styles.radioRow, isVerbal === opt.val && styles.radioRowActive]}
            onPress={() => setIsVerbal(opt.val)}
          >
            <View style={[styles.radio, isVerbal === opt.val && styles.radioActive]} />
            <View>
              <Text style={styles.radioLabel}>{opt.label}</Text>
              <Text style={styles.radioDesc}>{opt.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Sensory Profile</Text>
        <ToggleRow label="Tactile Defensive" desc="Dislikes touch, avoids certain textures" value={tactileDefensive} onChange={setTactileDefensive} />
        <ToggleRow label="Demand Avoidant" desc="Shuts down with direct instructions" value={demandAvoidant} onChange={setDemandAvoidant} />
      </Card>

      <Button label="Save & Continue →" onPress={handleSave} loading={saving} fullWidth size="lg" />
    </ScrollView>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={() => onChange(!value)}>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgApp },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.xl },
  back: { color: Colors.primary, fontSize: Typography.size.lg },
  title: { fontSize: Typography.size.xl, fontWeight: '700', color: Colors.textPrimary },
  sectionLabel: { fontWeight: '700', fontSize: Typography.size.base, color: Colors.textPrimary, marginBottom: 4 },
  sectionNote: { fontSize: Typography.size.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  field: { gap: 4, marginTop: Spacing.sm },
  label: { fontSize: Typography.size.sm, fontWeight: '600', color: Colors.textSecondary },
  input: { height: 48, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, fontSize: Typography.size.base, color: Colors.textPrimary, backgroundColor: Colors.offWhite },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.offWhite },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryPale },
  chipText: { fontSize: Typography.size.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: '600' },
  radioRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.sm, borderRadius: Radius.md, marginTop: 4 },
  radioRowActive: { backgroundColor: Colors.primaryPale },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, marginTop: 2 },
  radioActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  radioLabel: { fontWeight: '600', fontSize: Typography.size.base, color: Colors.textPrimary },
  radioDesc: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 1 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  toggleInfo: { flex: 1, paddingRight: Spacing.md },
  toggleLabel: { fontWeight: '600', fontSize: Typography.size.base, color: Colors.textPrimary },
  toggleDesc: { fontSize: Typography.size.sm, color: Colors.textMuted, marginTop: 1 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border, justifyContent: 'center', padding: 2 },
  toggleOn: { backgroundColor: Colors.primary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white },
  toggleThumbOn: { alignSelf: 'flex-end' },
});
