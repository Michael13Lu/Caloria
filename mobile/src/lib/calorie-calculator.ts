import type { Profile, Goal, DailyTarget, ActivityLevel, GoalType } from '../types';

// ─── Activity Multipliers (Mifflin-St Jeor based) ────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // desk job, no exercise
  light: 1.375,        // light exercise 1-3 days/week
  moderate: 1.55,      // moderate exercise 3-5 days/week
  active: 1.725,       // hard exercise 6-7 days/week
  very_active: 1.9,    // very hard exercise + physical job
};

// ─── Calorie adjustment per goal (per day) ───────────────────────────────────

const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  lose: -500,      // ~0.5kg/week deficit
  maintain: 0,
  gain: 300,       // lean bulk surplus
};

// ─── BMR Calculation (Mifflin-St Jeor) ───────────────────────────────────────

export function calculateBMR(profile: Profile): number {
  const { weight_kg, height_cm, gender, birth_date } = profile;

  const age = calculateAge(birth_date);

  if (gender === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
}

// ─── TDEE Calculation ────────────────────────────────────────────────────────

export function calculateTDEE(profile: Profile): number {
  const bmr = calculateBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activity_level];
  return Math.round(bmr * multiplier);
}

// ─── Daily Target with Goal Adjustment ───────────────────────────────────────

export function calculateDailyTarget(
  profile: Profile,
  goal: Pick<Goal, 'type' | 'weekly_change_kg'>
): DailyTarget {
  const tdee = calculateTDEE(profile);

  // Custom weekly change override (e.g. user wants 0.3kg/week instead of 0.5)
  const customAdjustment = (goal.weekly_change_kg * 7700) / 7; // 7700 kcal per kg
  const baseAdjustment = GOAL_ADJUSTMENTS[goal.type];

  // Use custom if provided, else use preset
  const adjustment =
    goal.weekly_change_kg !== 0.5
      ? goal.type === 'lose'
        ? -customAdjustment
        : goal.type === 'gain'
        ? customAdjustment
        : 0
      : baseAdjustment;

  const calories = Math.max(1200, Math.round(tdee + adjustment)); // never below 1200

  // ─── Macro Distribution ───────────────────────────────────────────────────
  // Protein: 2g per kg bodyweight
  // Fat: 0.8g per kg bodyweight
  // Carbs: remaining calories

  const protein_g = Math.round(profile.weight_kg * 2);
  const fat_g = Math.round(profile.weight_kg * 0.8);

  const protein_calories = protein_g * 4;
  const fat_calories = fat_g * 9;
  const carbs_calories = Math.max(0, calories - protein_calories - fat_calories);
  const carbs_g = Math.round(carbs_calories / 4);

  return { calories, protein_g, fat_g, carbs_g };
}

// ─── Daily Summary Calculation ───────────────────────────────────────────────

export function calculateDailyConsumed(meals: Array<{
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}>) {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein_g: acc.protein_g + meal.protein_g,
      fat_g: acc.fat_g + meal.fat_g,
      carbs_g: acc.carbs_g + meal.carbs_g,
    }),
    { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0 }
  );
}

// ─── Nutrition from weight ────────────────────────────────────────────────────

export function calculateNutritionFromWeight(
  food: { calories_per_100g: number; protein_per_100g: number; fat_per_100g: number; carbs_per_100g: number },
  weight_g: number
) {
  const ratio = weight_g / 100;
  return {
    calories: Math.round(food.calories_per_100g * ratio),
    protein_g: Math.round(food.protein_per_100g * ratio * 10) / 10,
    fat_g: Math.round(food.fat_per_100g * ratio * 10) / 10,
    carbs_g: Math.round(food.carbs_per_100g * ratio * 10) / 10,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateAge(birth_date: string): number {
  const today = new Date();
  const birth = new Date(birth_date);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatCalories(n: number): string {
  return Math.round(n).toLocaleString();
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
