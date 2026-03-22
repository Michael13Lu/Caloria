import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema, GoalFormData } from '../../../lib/validation';
import { useSaveGoal, useProfile, useDailyTarget } from '../hooks/useProfile';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Card } from '../../../shared/components/ui/Card';
import { colors, spacing, typography } from '../../../shared/constants/theme';
import type { GoalType } from '../../../types';
import { calculateDailyTarget } from '../../../lib/calorie-calculator';

const GOALS: { value: GoalType; label: string; emoji: string; desc: string }[] = [
  { value: 'lose', label: 'Lose Weight', emoji: '📉', desc: 'Calorie deficit' },
  { value: 'maintain', label: 'Maintain', emoji: '⚖️', desc: 'Stay at current weight' },
  { value: 'gain', label: 'Gain Muscle', emoji: '💪', desc: 'Calorie surplus' },
];

interface Props {
  onNext: () => void;
}

export function GoalStep({ onNext }: Props) {
  const saveGoal = useSaveGoal();
  const { data: profile } = useProfile();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      type: 'lose',
      target_weight_kg: null,
      weekly_change_kg: 0.5,
    },
  });

  const selectedType = watch('type');
  const weeklyChange = watch('weekly_change_kg');

  // Live calorie preview
  const previewTarget = profile
    ? calculateDailyTarget(profile, { type: selectedType, weekly_change_kg: weeklyChange || 0.5 })
    : null;

  const onSubmit = async (data: GoalFormData) => {
    await saveGoal.mutateAsync(data);
    onNext();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Set your goal</Text>
      <Text style={styles.subtitle}>You can change this anytime</Text>

      {/* Goal type */}
      <View style={styles.goalList}>
        {GOALS.map((g) => (
          <Button
            key={g.value}
            title={`${g.emoji}  ${g.label}  ·  ${g.desc}`}
            variant={selectedType === g.value ? 'primary' : 'secondary'}
            onPress={() => setValue('type', g.value)}
            style={styles.goalBtn}
          />
        ))}
      </View>

      {/* Target weight */}
      {selectedType !== 'maintain' && (
        <Controller
          control={control}
          name="target_weight_kg"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Target Weight (kg)"
              placeholder="70"
              keyboardType="numeric"
              value={value?.toString() ?? ''}
              onChangeText={(v) => onChange(parseFloat(v) || null)}
              error={errors.target_weight_kg?.message}
            />
          )}
        />
      )}

      {/* Weekly change */}
      {selectedType !== 'maintain' && (
        <Controller
          control={control}
          name="weekly_change_kg"
          render={({ field: { onChange, value } }) => (
            <Input
              label={selectedType === 'lose' ? 'Weekly loss (kg)' : 'Weekly gain (kg)'}
              placeholder="0.5"
              keyboardType="numeric"
              value={value?.toString()}
              onChangeText={(v) => onChange(parseFloat(v) || 0.5)}
              error={errors.weekly_change_kg?.message}
            />
          )}
        />
      )}

      {/* Live preview */}
      {previewTarget && (
        <Card style={styles.preview}>
          <Text style={styles.previewTitle}>Your Daily Target</Text>
          <Text style={styles.previewCalories}>{previewTarget.calories} kcal</Text>
          <View style={styles.macroRow}>
            <MacroPill label="Protein" value={previewTarget.protein_g} color={colors.protein} />
            <MacroPill label="Fat" value={previewTarget.fat_g} color={colors.fat} />
            <MacroPill label="Carbs" value={previewTarget.carbs_g} color={colors.carbs} />
          </View>
        </Card>
      )}

      {saveGoal.error && (
        <Text style={styles.error}>{String(saveGoal.error)}</Text>
      )}

      <Button
        title="Start Tracking →"
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting}
        size="lg"
      />
    </ScrollView>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillValue, { color }]}>{value}g</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: -spacing.sm },
  goalList: { gap: spacing.xs },
  goalBtn: { justifyContent: 'flex-start', paddingHorizontal: spacing.md },
  preview: { alignItems: 'center', gap: spacing.sm },
  previewTitle: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  previewCalories: { fontSize: 36, fontWeight: '700', color: colors.text },
  macroRow: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    gap: 2,
  },
  pillValue: { ...typography.bodyMd, fontWeight: '700' },
  pillLabel: { ...typography.small, color: colors.textMuted },
  error: { ...typography.small, color: colors.danger, textAlign: 'center' },
});
