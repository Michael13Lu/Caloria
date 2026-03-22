import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface MacroBarProps {
  label: string;
  consumed: number;
  target: number;
  color: string;
  unit?: string;
}

export function MacroBar({ label, consumed, target, color, unit = 'g' }: MacroBarProps) {
  const progress = target > 0 ? Math.min(consumed / target, 1) : 0;
  const isOver = consumed > target;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          <Text style={[styles.consumed, isOver && { color: colors.danger }]}>
            {Math.round(consumed)}
          </Text>
          <Text style={styles.target}> / {Math.round(target)}{unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: isOver ? colors.danger : color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  values: {},
  consumed: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
  },
  target: {
    ...typography.small,
    color: colors.textMuted,
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
