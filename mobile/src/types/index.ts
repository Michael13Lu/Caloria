// ─── Core Domain Types ───────────────────────────────────────────────────────

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose' | 'maintain' | 'gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type SyncStatus = 'synced' | 'pending' | 'conflict';

// ─── User & Profile ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  gender: Gender;
  birth_date: string;       // ISO date
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  created_at: string;
  updated_at: string;
}

// ─── Goals & Targets ─────────────────────────────────────────────────────────

export interface Goal {
  id: string;
  user_id: string;
  type: GoalType;
  target_weight_kg: number | null;
  weekly_change_kg: number;  // e.g. 0.5 for 500g/week
  created_at: string;
}

export interface DailyTarget {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

// ─── Food & Meals ────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  is_custom: boolean;
  user_id: string | null;
  created_at: string;
}

export interface MealEntry {
  id: string;
  user_id: string;
  date: string;             // YYYY-MM-DD
  meal_type: MealType;
  name: string;             // custom name or food_item.name
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  weight_g: number | null;
  food_item_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
}

// ─── Daily Summary ───────────────────────────────────────────────────────────

export interface DailySummary {
  date: string;
  calories_consumed: number;
  calories_remaining: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  target: DailyTarget;
  meals: MealEntry[];
}

// ─── Weight & Water ──────────────────────────────────────────────────────────

export interface WeightLog {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  note: string | null;
  sync_status: SyncStatus;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  sync_status: SyncStatus;
  created_at: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Reminder {
  id: string;
  user_id: string;
  type: 'meal' | 'water' | 'weigh_in';
  label: string;
  time: string;             // HH:mm
  days: number[];           // 0=Sun, 1=Mon, ... 6=Sat
  enabled: boolean;
  created_at: string;
}

// ─── Sync Queue ──────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'insert' | 'update' | 'delete';
  payload: string;          // JSON
  created_at: string;
  attempts: number;
}
