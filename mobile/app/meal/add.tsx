import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddMeal } from '../../src/features/meals/hooks/useMeals';
import { useMealsStore } from '../../src/features/meals/store/meals.store';
import { mealEntrySchema, MealEntryFormData } from '../../src/lib/validation';
import { Button } from '../../src/shared/components/ui/Button';
import { Input } from '../../src/shared/components/ui/Input';
import { Card } from '../../src/shared/components/ui/Card';
import { colors, spacing, typography } from '../../src/shared/constants/theme';
import { getTodayDate } from '../../src/lib/calorie-calculator';
import type { MealType } from '../../src/types';

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
];

// Quick templates for fast entry
const QUICK_TEMPLATES = [
  { name: 'Chicken breast 150g', calories: 248, protein_g: 46, fat_g: 5, carbs_g: 0 },
  { name: 'Rice cooked 200g', calories: 260, protein_g: 5, fat_g: 0.4, carbs_g: 57 },
  { name: 'Eggs x2', calories: 156, protein_g: 13, fat_g: 11, carbs_g: 1 },
  { name: 'Oatmeal 80g dry', calories: 303, protein_g: 11, fat_g: 5, carbs_g: 52 },
  { name: 'Banana', calories: 89, protein_g: 1.1, fat_g: 0.3, carbs_g: 23 },
  { name: 'Greek yogurt 200g', calories: 132, protein_g: 18, fat_g: 1, carbs_g: 12 },
];

export default function AddMealScreen() {
  const router = useRouter();
  const addMeal = useAddMeal();
  const activeMealType = useMealsStore((s) => s.activeMealType);
  const [tab, setTab] = useState<'manual' | 'quick'>('manual');

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MealEntryFormData>({
    resolver: zodResolver(mealEntrySchema),
    defaultValues: {
      meal_type: activeMealType,
      protein_g: 0,
      fat_g: 0,
      carbs_g: 0,
      weight_g: null,
    },
  });

  const selectedMealType = useMealsStore((s) => s.activeMealType);

  const onSubmit = async (data: MealEntryFormData) => {
    await addMeal.mutateAsync({
      ...data,
      date: getTodayDate(),
      food_item_id: null,
    });
    router.back();
  };

  const applyTemplate = (t: typeof QUICK_TEMPLATES[number]) => {
    setValue('name', t.name);
    setValue('calories', t.calories);
    setValue('protein_g', t.protein_g);
    setValue('fat_g', t.fat_g);
    setValue('carbs_g', t.carbs_g);
    setTab('manual');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Food</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Meal type selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mealTypeRow}
        >
          {MEAL_TYPES.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.mealTypeChip,
                selectedMealType === m.value && styles.mealTypeChipActive,
              ]}
              onPress={() => useMealsStore.getState().setActiveMealType(m.value)}
            >
              <Text style={styles.mealTypeEmoji}>{m.emoji}</Text>
              <Text
                style={[
                  styles.mealTypeLabel,
                  selectedMealType === m.value && styles.mealTypeLabelActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'manual' && styles.tabBtnActive]}
            onPress={() => setTab('manual')}
          >
            <Text style={[styles.tabText, tab === 'manual' && styles.tabTextActive]}>
              Manual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'quick' && styles.tabBtnActive]}
            onPress={() => setTab('quick')}
          >
            <Text style={[styles.tabText, tab === 'quick' && styles.tabTextActive]}>
              Quick Add
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {tab === 'manual' ? (
            <View style={styles.form}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Food Name"
                    placeholder="e.g. Chicken breast"
                    value={value}
                    onChangeText={onChange}
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="calories"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Calories (kcal)"
                    placeholder="0"
                    keyboardType="numeric"
                    value={value?.toString()}
                    onChangeText={(v) => onChange(parseFloat(v) || 0)}
                    error={errors.calories?.message}
                  />
                )}
              />

              <View style={styles.macroRow}>
                <Controller
                  control={control}
                  name="protein_g"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Protein (g)"
                      placeholder="0"
                      keyboardType="numeric"
                      value={value?.toString()}
                      onChangeText={(v) => onChange(parseFloat(v) || 0)}
                      error={errors.protein_g?.message}
                      containerStyle={styles.macroInput}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="fat_g"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Fat (g)"
                      placeholder="0"
                      keyboardType="numeric"
                      value={value?.toString()}
                      onChangeText={(v) => onChange(parseFloat(v) || 0)}
                      error={errors.fat_g?.message}
                      containerStyle={styles.macroInput}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="carbs_g"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Carbs (g)"
                      placeholder="0"
                      keyboardType="numeric"
                      value={value?.toString()}
                      onChangeText={(v) => onChange(parseFloat(v) || 0)}
                      error={errors.carbs_g?.message}
                      containerStyle={styles.macroInput}
                    />
                  )}
                />
              </View>

              <Controller
                control={control}
                name="weight_g"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Weight (g) — optional"
                    placeholder="150"
                    keyboardType="numeric"
                    value={value?.toString() ?? ''}
                    onChangeText={(v) => onChange(parseFloat(v) || null)}
                  />
                )}
              />

              {addMeal.error && (
                <Text style={styles.error}>{String(addMeal.error)}</Text>
              )}

              <Button
                title="Add to Log"
                onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                size="lg"
              />
            </View>
          ) : (
            <View style={styles.quickList}>
              {QUICK_TEMPLATES.map((t) => (
                <TouchableOpacity
                  key={t.name}
                  onPress={() => applyTemplate(t)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.quickItem}>
                    <View style={styles.quickItemLeft}>
                      <Text style={styles.quickName}>{t.name}</Text>
                      <Text style={styles.quickMacros}>
                        P: {t.protein_g}g · F: {t.fat_g}g · C: {t.carbs_g}g
                      </Text>
                    </View>
                    <View style={styles.quickRight}>
                      <Text style={styles.quickCalories}>{t.calories}</Text>
                      <Text style={styles.quickKcal}>kcal</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, color: colors.textMuted },
  headerTitle: { ...typography.h3, color: colors.text },
  mealTypeRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  mealTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  mealTypeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeEmoji: { fontSize: 14 },
  mealTypeLabel: { ...typography.small, color: colors.textMuted, fontWeight: '500' },
  mealTypeLabelActive: { color: colors.white },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    backgroundColor: colors.bgCard,
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: { backgroundColor: colors.bg },
  tabText: { ...typography.bodyMd, color: colors.textMuted },
  tabTextActive: { color: colors.text },
  scroll: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  form: { gap: spacing.md },
  macroRow: { flexDirection: 'row', gap: spacing.sm },
  macroInput: { flex: 1 },
  error: { ...typography.small, color: colors.danger, textAlign: 'center' },
  quickList: { gap: spacing.sm },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickItemLeft: { flex: 1 },
  quickName: { ...typography.bodyMd, color: colors.text },
  quickMacros: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  quickRight: { alignItems: 'flex-end' },
  quickCalories: { ...typography.h3, color: colors.primary },
  quickKcal: { ...typography.small, color: colors.textMuted },
});
