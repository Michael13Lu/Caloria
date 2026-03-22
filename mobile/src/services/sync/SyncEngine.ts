import { supabase } from '../../lib/supabase';
import { getDatabase } from '../../database/client';
import type { SyncQueueItem } from '../../types';

const MAX_ATTEMPTS = 3;
const SYNC_INTERVAL_MS = 30_000; // 30 seconds

class SyncEngine {
  private timer: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;

  start() {
    if (this.timer) return;
    // Immediate sync on start
    this.sync();
    this.timer = setInterval(() => this.sync(), SYNC_INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async sync() {
    if (this.isSyncing) return;

    // Check connectivity via Supabase auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    this.isSyncing = true;

    try {
      const db = await getDatabase();
      const queue = await db.getAllAsync<SyncQueueItem>(
        'SELECT * FROM sync_queue WHERE attempts < ? ORDER BY created_at ASC LIMIT 50',
        [MAX_ATTEMPTS]
      );

      if (queue.length === 0) return;

      for (const item of queue) {
        try {
          await this.processItem(item);
          // Remove from queue on success
          await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);

          // Mark record as synced
          await db.runAsync(
            `UPDATE ${item.table_name} SET sync_status = 'synced' WHERE id = ?`,
            [item.record_id]
          );
        } catch (err) {
          // Increment attempt counter
          await db.runAsync(
            'UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?',
            [item.id]
          );
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async processItem(item: SyncQueueItem) {
    const payload = JSON.parse(item.payload);

    switch (item.operation) {
      case 'insert':
        await supabase.from(item.table_name).upsert(payload);
        break;
      case 'update':
        await supabase
          .from(item.table_name)
          .update(payload)
          .eq('id', item.record_id);
        break;
      case 'delete':
        await supabase
          .from(item.table_name)
          .delete()
          .eq('id', item.record_id);
        break;
    }
  }

  // Pull remote data for the current user (initial load or after long offline period)
  async pullRemoteData(userId: string) {
    const db = await getDatabase();

    // Pull meal entries (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: meals } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', since);

    if (meals) {
      for (const meal of meals) {
        await db.runAsync(
          `INSERT OR REPLACE INTO meal_entries
            (id, user_id, date, meal_type, name, calories, protein_g, fat_g, carbs_g, weight_g, food_item_id, sync_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
          [meal.id, meal.user_id, meal.date, meal.meal_type, meal.name,
           meal.calories, meal.protein_g, meal.fat_g, meal.carbs_g,
           meal.weight_g, meal.food_item_id, meal.created_at]
        );
      }
    }

    // Pull weight logs
    const { data: weightLogs } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(90);

    if (weightLogs) {
      for (const log of weightLogs) {
        await db.runAsync(
          `INSERT OR REPLACE INTO weight_logs (id, user_id, date, weight_kg, note, sync_status, created_at)
           VALUES (?, ?, ?, ?, ?, 'synced', ?)`,
          [log.id, log.user_id, log.date, log.weight_kg, log.note, log.created_at]
        );
      }
    }
  }
}

export const syncEngine = new SyncEngine();
