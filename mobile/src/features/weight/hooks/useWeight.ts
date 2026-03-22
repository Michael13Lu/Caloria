import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase, generateId, now } from '../../../database/client';
import { useAuthStore } from '../../auth/store/auth.store';
import type { WeightLog } from '../../../types';

const QUERY_KEY = 'weight-logs';

export function useWeightLogs(limit = 30) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: [QUERY_KEY, user?.id, limit],
    queryFn: async (): Promise<WeightLog[]> => {
      if (!user) return [];
      const db = await getDatabase();
      return db.getAllAsync<WeightLog>(
        'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date DESC LIMIT ?',
        [user.id, limit]
      );
    },
    enabled: !!user,
  });
}

export function useAddWeightLog() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (data: { weight_kg: number; date: string; note?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const db = await getDatabase();
      const id = await generateId();
      const created_at = now();

      // Upsert by date
      const existing = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM weight_logs WHERE user_id = ? AND date = ?',
        [user.id, data.date]
      );

      if (existing) {
        await db.runAsync(
          'UPDATE weight_logs SET weight_kg = ?, note = ?, sync_status = ? WHERE id = ?',
          [data.weight_kg, data.note ?? null, 'pending', existing.id]
        );
        return { id: existing.id, user_id: user.id, sync_status: 'pending' as const, created_at, ...data };
      } else {
        await db.runAsync(
          `INSERT INTO weight_logs (id, user_id, date, weight_kg, note, sync_status, created_at)
           VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
          [id, user.id, data.date, data.weight_kg, data.note ?? null, created_at]
        );
        return { id, user_id: user.id, sync_status: 'pending' as const, created_at, ...data };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
