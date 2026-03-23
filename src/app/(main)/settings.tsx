import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile */}
      <Card elevated style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? '?'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleTag}>
          <Text style={styles.roleText}>{user?.role?.replace('_', ' ')}</Text>
        </View>
      </Card>

      {/* Options */}
      <SettingRow label="Notification Preferences" icon="🔔" onPress={() => {}} />
      <SettingRow label="Motion Tracking Provider" icon="📡" onPress={() => {}} />
      <SettingRow label="Language" icon="🌐" onPress={() => {}} />
      <SettingRow label="Privacy & Data" icon="🔒" onPress={() => {}} />
      <SettingRow label="About BrainyAct" icon="ℹ️" onPress={() => {}} />

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>BrainyAct v0.1.0 · Kinuu</Text>
    </ScrollView>
  );
}

function SettingRow({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.settingRow}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.chevron}>›</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgApp },
  content: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xxl },
  title: { fontSize: Typography.size.xxl, fontWeight: '700', color: Colors.textPrimary, paddingTop: Spacing.xl, marginBottom: Spacing.sm },
  profileCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 32, fontWeight: '700' },
  userName: { fontSize: Typography.size.xl, fontWeight: '700', color: Colors.textPrimary },
  userEmail: { fontSize: Typography.size.base, color: Colors.textMuted },
  roleTag: {
    backgroundColor: Colors.primaryPale,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  roleText: { color: Colors.primary, fontSize: Typography.size.sm, fontWeight: '600', textTransform: 'capitalize' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingIcon: { fontSize: 20 },
  settingLabel: { flex: 1, fontSize: Typography.size.base, color: Colors.textPrimary },
  chevron: { fontSize: Typography.size.xl, color: Colors.textMuted },
  logoutBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  logoutText: { color: Colors.error, fontWeight: '600', fontSize: Typography.size.base },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: Typography.size.xs, marginTop: Spacing.sm },
});
