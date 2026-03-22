import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase, generateId, now } from '../../../database/client';
import { useAuthStore } from '../../auth/store/auth.store';
import { calculateDailyTarget } from '../../../lib/calorie-calculator';
import type { Profile, Goal, DailyTarget } from '../../../types';

const PROFILE_KEY = 'profile';
const GOAL_KEY = 'goal';

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useProfile() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: [PROFILE_KEY, user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const db = await getDatabase();
      const row = await db.getFirstAsync<Profile>(
        'SELECT * FROM profiles WHERE user_id = ?',
        [user.id]
      );
      return row ?? null;
    },
    enabled: !!user,
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (data: Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const db = await getDatabase();

      const existing = await db.getFirstAsync<Profile>(
        'SELECT id FROM profiles WHERE user_id = ?',
        [user.id]
      );

      const timestamp = now();

      if (existing) {
        await db.runAsync(
          `UPDATE profiles SET name=?, gender=?, birth_date=?, height_cm=?, weight_kg=?, activity_level=?, updated_at=?
           WHERE user_id=?`,
          [data.name, data.gender, data.birth_date, data.height_cm, data.weight_kg, data.activity_level, timestamp, user.id]
        );
        return { ...existing, ...data, updated_at: timestamp };
      } else {
        const id = await generateId();
        await db.runAsync(
          `INSERT INTO profiles (id, user_id, name, gender, birth_date, height_cm, weight_kg, activity_level, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, user.id, data.name, data.gender, data.birth_date, data.height_cm, data.weight_kg, data.activity_level, timestamp, timestamp]
        );
        return { id, user_id: user.id, ...data, created_at: timestamp, updated_at: timestamp };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] });
      queryClient.invalidateQueries({ queryKey: ['daily-target'] });
    },
  });
}

// ─── Goal ─────────────────────────────────────────────────────────────────────

export function useGoal() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: [GOAL_KEY, user?.id],
    queryFn: async (): Promise<Goal | null> => {
      if (!user) return null;
      const db = await getDatabase();
      const row = await db.getFirstAsync<Goal>(
        'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [user.id]
      );
      return row ?? null;
    },
    enabled: !!user,
  });
}

export function useSaveGoal() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (data: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      const db = await getDatabase();
      const id = await generateId();
      const created_at = now();

      await db.runAsync(
        `INSERT INTO goals (id, user_id, type, target_weight_kg, weekly_change_kg, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, user.id, data.type, data.target_weight_kg, data.weekly_change_kg, created_at]
      );

      return { id, user_id: user.id, ...data, created_at };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GOAL_KEY] });
      queryClient.invalidateQueries({ queryKey: ['daily-target'] });
    },
  });
}

// ─── Computed Daily Target ────────────────────────────────────────────────────

export function useDailyTarget(): DailyTarget | null {
  const { data: profile } = useProfile();
  const { data: goal } = useGoal();

  if (!profile || !goal) return null;

  return calculateDailyTarget(profile, goal);
}
