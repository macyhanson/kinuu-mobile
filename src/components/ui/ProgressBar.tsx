import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';

interface Props {
  progress: number; // 0-1
  label?: string;
  showPercent?: boolean;
  color?: string;
  height?: number;
}

export function ProgressBar({
  progress,
  label,
  showPercent = false,
  color = Colors.primary,
  height = 8,
}: Props) {
  const pct = Math.min(1, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {(label || showPercent) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && (
            <Text style={styles.percent}>{Math.round(pct * 100)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct * 100}%`,
              backgroundColor: color,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  percent: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
  },
  track: {
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {},
});
