import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyTarget } from '../../src/features/profile/hooks/useProfile';
import { useDailySummary, useDeleteMeal } from '../../src/features/meals/hooks/useMeals';
import { useMealsStore } from '../../src/features/meals/store/meals.store';
import { CalorieRing } from '../../src/shared/components/ui/CalorieRing';
import { MacroBar } from '../../src/shared/components/ui/MacroBar';
import { MealGroup } from '../../src/shared/components/ui/MealCard';
import { Card } from '../../src/shared/components/ui/Card';
import { colors, spacing, typography } from '../../src/shared/constants/theme';
import { getTodayDate } from '../../src/lib/calorie-calculator';
import type { MealType } from '../../src/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const DEFAULT_TARGET = { calories: 2000, protein_g: 150, fat_g: 65, carbs_g: 200 };

export default function DashboardScreen() {
  const router = useRouter();
  const target = useDailyTarget() ?? DEFAULT_TARGET;
  const today = getTodayDate();
  const { meals, consumed, remaining, progress } = useDailySummary(today, target);
  const deleteMeal = useDeleteMeal();
  const openAddMeal = useMealsStore((s) => s.openAddMeal);

  const handleAddMeal = (mealType: MealType) => {
    useMealsStore.getState().setActiveMealType(mealType);
    router.push('/meal/add');
  };

  const handleDeleteMeal = (id: string) => {
    deleteMeal.mutate({ id, date: today });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Today</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addFab}
            onPress={() => router.push('/meal/add')}
            activeOpacity={0.8}
          >
            <Text style={styles.addFabText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Calorie Ring */}
        <Card style={styles.ringCard}>
          <View style={styles.ringRow}>
            <CalorieRing
              consumed={consumed.calories}
              target={target.calories}
              size={160}
            />
            <View style={styles.ringStats}>
              <StatItem label="Target" value={`${target.calories}`} unit="kcal" />
              <StatItem label="Eaten" value={`${Math.round(consumed.calories)}`} unit="kcal" color={colors.primary} />
              <StatItem
                label="Remaining"
                value={`${Math.abs(Math.round(remaining.calories))}`}
                unit="kcal"
                color={remaining.calories < 0 ? colors.danger : colors.success}
              />
            </View>
          </View>

          {/* Macro bars */}
          <View style={styles.macros}>
            <MacroBar
              label="Protein"
              consumed={consumed.protein_g}
              target={target.protein_g}
              color={colors.protein}
            />
            <MacroBar
              label="Fat"
              consumed={consumed.fat_g}
              target={target.fat_g}
              color={colors.fat}
            />
            <MacroBar
              label="Carbs"
              consumed={consumed.carbs_g}
              target={target.carbs_g}
              color={colors.carbs}
            />
          </View>
        </Card>

        {/* Meal groups */}
        <Text style={styles.sectionTitle}>Meals</Text>
        {MEAL_TYPES.map((mealType) => (
          <MealGroup
            key={mealType}
            mealType={mealType}
            entries={meals.filter((m) => m.meal_type === mealType)}
            onAdd={() => handleAddMeal(mealType)}
            onDelete={handleDeleteMeal}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <View style={statStyles.item}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, color ? { color } : {}]}>
        {value} <Text style={statStyles.unit}>{unit}</Text>
      </Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  item: { gap: 1 },
  label: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  value: { ...typography.h3, color: colors.text },
  unit: { ...typography.small, color: colors.textMuted, fontWeight: '400' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  greeting: { ...typography.h2, color: colors.text },
  date: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  addFab: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
  },
  addFabText: { ...typography.bodyMd, color: colors.white },
  ringCard: { gap: spacing.md },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ringStats: { flex: 1, paddingLeft: spacing.md, gap: spacing.md },
  macros: { flexDirection: 'row', gap: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.xs },
});
