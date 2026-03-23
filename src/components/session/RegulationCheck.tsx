/**
 * Regulation Safety Check
 *
 * Displays a warning banner + action when a regulation event is flagged.
 * Per protocol: if child is dysregulated, immediately return to warm-up.
 * Do NOT resume the triggering activity in this session.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { REGULATION_PROTOCOL } from '@/constants/sessionProtocol';

interface Props {
  onReturnToWarmUp: () => void;
  onEndSession: () => void;
}

export function RegulationCheck({ onReturnToWarmUp, onEndSession }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>⚠️</Text>
        </View>
        <Text style={styles.title}>Regulation Check</Text>
        <Text style={styles.body}>
          Signs of dysregulation detected. Stop the current activity and return to warm-up.
        </Text>
        <Text style={styles.rationale}>{REGULATION_PROTOCOL.rationale}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnPrimary} onPress={onReturnToWarmUp}>
            <Text style={styles.btnPrimaryText}>Return to Warm-Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={onEndSession}>
            <Text style={styles.btnGhostText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bgOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.lg,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff3cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  rationale: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: Typography.size.base,
  },
  btnGhost: {
    borderRadius: Radius.full,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhostText: {
    color: Colors.textMuted,
    fontSize: Typography.size.base,
  },
});
