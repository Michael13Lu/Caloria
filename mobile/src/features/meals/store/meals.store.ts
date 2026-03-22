import { create } from 'zustand';
import type { MealType } from '../../../types';

interface MealsUIState {
  selectedDate: string;
  activeMealType: MealType;
  isAddMealOpen: boolean;
  setSelectedDate: (date: string) => void;
  setActiveMealType: (type: MealType) => void;
  openAddMeal: (mealType?: MealType) => void;
  closeAddMeal: () => void;
}

export const useMealsStore = create<MealsUIState>((set) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  activeMealType: 'breakfast',
  isAddMealOpen: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveMealType: (type) => set({ activeMealType: type }),
  openAddMeal: (mealType) =>
    set((state) => ({
      isAddMealOpen: true,
      activeMealType: mealType ?? state.activeMealType,
    })),
  closeAddMeal: () => set({ isAddMealOpen: false }),
}));
