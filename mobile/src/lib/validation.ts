import { z } from 'zod';

// ─── Profile Schema ───────────────────────────────────────────────────────────

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  gender: z.enum(['male', 'female']),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  height_cm: z.number().min(100, 'Min 100cm').max(250, 'Max 250cm'),
  weight_kg: z.number().min(30, 'Min 30kg').max(300, 'Max 300kg'),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ─── Goal Schema ─────────────────────────────────────────────────────────────

export const goalSchema = z.object({
  type: z.enum(['lose', 'maintain', 'gain']),
  target_weight_kg: z.number().min(30).max(300).nullable(),
  weekly_change_kg: z.number().min(0.1).max(1.0),
});

export type GoalFormData = z.infer<typeof goalSchema>;

// ─── Meal Entry Schema ────────────────────────────────────────────────────────

export const mealEntrySchema = z.object({
  name: z.string().min(1, 'Food name is required').max(100),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  calories: z.number().min(0, 'Must be positive').max(5000),
  protein_g: z.number().min(0).max(500),
  fat_g: z.number().min(0).max(500),
  carbs_g: z.number().min(0).max(500),
  weight_g: z.number().min(0).max(5000).nullable(),
});

export type MealEntryFormData = z.infer<typeof mealEntrySchema>;

// ─── Weight Log Schema ────────────────────────────────────────────────────────

export const weightLogSchema = z.object({
  weight_kg: z.number().min(30, 'Min 30kg').max(300, 'Max 300kg'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(200).optional(),
});

export type WeightLogFormData = z.infer<typeof weightLogSchema>;

// ─── Water Log Schema ─────────────────────────────────────────────────────────

export const waterLogSchema = z.object({
  amount_ml: z.number().min(50).max(2000),
});

export type WaterLogFormData = z.infer<typeof waterLogSchema>;

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

export const signUpSchema = signInSchema.extend({
  password: z.string().min(8, 'Min 8 characters'),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
