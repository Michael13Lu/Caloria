import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase, generateId, now } from '../../../database/client';
import { useAuthStore } from '../../auth/store/auth.store';
import { calculateDailyConsumed } from '../../../lib/calorie-calculator';
import type { MealEntry, MealType } from '../../../types';

const QUERY_KEY = 'meals';

// ─── Fetch meals for a date ───────────────────────────────────────────────────

export function useMealsForDate(date: string) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: [QUERY_KEY, date, user?.id],
    queryFn: async (): Promise<MealEntry[]> => {
      if (!user) return [];
      const db = await getDatabase();
      const rows = await db.getAllAsync<MealEntry>(
        'SELECT * FROM meal_entries WHERE user_id = ? AND date = ? ORDER BY created_at ASC',
        [user.id, date]
      );
      return rows;
    },
    enabled: !!user,
  });
}

// ─── Add meal entry ───────────────────────────────────────────────────────────

export function useAddMeal() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (
      entry: Omit<MealEntry, 'id' | 'user_id' | 'sync_status' | 'created_at'>
    ) => {
      if (!user) throw new Error('Not authenticated');
      const db = await getDatabase();
      const id = await generateId();
      const created_at = now();

      await db.runAsync(
        `INSERT INTO meal_entries
          (id, user_id, date, meal_type, name, calories, protein_g, fat_g, carbs_g, weight_g, food_item_id, sync_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [
          id, user.id, entry.date, entry.meal_type, entry.name,
          entry.calories, entry.protein_g, entry.fat_g, entry.carbs_g,
          entry.weight_g, entry.food_item_id, created_at,
        ]
      );

      // Add to sync queue
      await db.runAsync(
        `INSERT INTO sync_queue (id, table_name, record_id, operation, payload, created_at, attempts)
          VALUES (?, 'meal_entries', ?, 'insert', ?, ?, 0)`,
        [await generateId(), id, JSON.stringify({ ...entry, id, user_id: user.id, created_at }), created_at]
      );

      return { id, ...entry, user_id: user.id, sync_status: 'pending' as const, created_at };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.date] });
    },
  });
}

// ─── Delete meal entry ────────────────────────────────────────────────────────

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      if (!user) throw new Error('Not authenticated');
      const db = await getDatabase();
      await db.runAsync('DELETE FROM meal_entries WHERE id = ? AND user_id = ?', [id, user.id]);
      return { id, date };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, result.date] });
    },
  });
}

// ─── Daily summary hook ───────────────────────────────────────────────────────

export function useDailySummary(date: string, target: { calories: number; protein_g: number; fat_g: number; carbs_g: number }) {
  const { data: meals = [] } = useMealsForDate(date);

  const consumed = calculateDailyConsumed(meals);

  return {
    meals,
    consumed,
    remaining: {
      calories: target.calories - consumed.calories,
      protein_g: target.protein_g - consumed.protein_g,
      fat_g: target.fat_g - consumed.fat_g,
      carbs_g: target.carbs_g - consumed.carbs_g,
    },
    progress: target.calories > 0 ? Math.min(consumed.calories / target.calories, 1) : 0,
  };
}
