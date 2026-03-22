import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Card } from './Card';
import { colors, spacing, typography } from '../../constants/theme';
import type { MealEntry, MealType } from '../../../types';

const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

interface MealGroupProps {
  mealType: MealType;
  entries: MealEntry[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function MealGroup({ mealType, entries, onAdd, onDelete }: MealGroupProps) {
  const total = entries.reduce((sum, e) => sum + e.calories, 0);

  const handleDelete = (entry: MealEntry) => {
    Alert.alert('Delete', `Remove "${entry.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
    ]);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{MEAL_EMOJIS[mealType]}</Text>
          <Text style={styles.title}>{MEAL_LABELS[mealType]}</Text>
        </View>
        <View style={styles.headerRight}>
          {total > 0 && <Text style={styles.total}>{Math.round(total)} kcal</Text>}
          <TouchableOpacity onPress={onAdd} style={styles.addBtn} activeOpacity={0.7}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {entries.length > 0 && (
        <View style={styles.entries}>
          {entries.map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.entry}
              onLongPress={() => handleDelete(entry)}
              activeOpacity={0.7}
            >
              <View style={styles.entryLeft}>
                <Text style={styles.entryName}>{entry.name}</Text>
                <Text style={styles.entryMacros}>
                  P: {entry.protein_g}g · F: {entry.fat_g}g · C: {entry.carbs_g}g
                </Text>
              </View>
              <Text style={styles.entryCalories}>{Math.round(entry.calories)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {entries.length === 0 && (
        <TouchableOpacity onPress={onAdd} style={styles.emptyRow} activeOpacity={0.7}>
          <Text style={styles.emptyText}>Tap + to add food</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.xs },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  emoji: { fontSize: 16 },
  title: { ...typography.bodyMd, color: colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  total: { ...typography.small, color: colors.textMuted },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: colors.white, fontSize: 18, fontWeight: '600', lineHeight: 22 },
  entries: { marginTop: spacing.sm, gap: 2 },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  entryLeft: { flex: 1, marginRight: spacing.sm },
  entryName: { ...typography.body, color: colors.text },
  entryMacros: { ...typography.small, color: colors.textMuted, marginTop: 1 },
  entryCalories: { ...typography.bodyMd, color: colors.textMuted },
  emptyRow: { paddingTop: spacing.sm },
  emptyText: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
});
