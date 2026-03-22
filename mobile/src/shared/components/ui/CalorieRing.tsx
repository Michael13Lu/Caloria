import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../../constants/theme';

interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
}

export function CalorieRing({ consumed, target, size = 180 }: CalorieRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(consumed / target, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const remaining = target - consumed;
  const isOver = consumed > target;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOver ? colors.danger : colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.remaining, isOver && { color: colors.danger }]}>
          {Math.abs(Math.round(remaining))}
        </Text>
        <Text style={styles.label}>{isOver ? 'over' : 'kcal left'}</Text>
        <Text style={styles.consumed}>{Math.round(consumed)} eaten</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  remaining: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
  },
  consumed: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: 4,
  },
});
