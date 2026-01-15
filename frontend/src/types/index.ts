// Core User Types
export type CKDStage = '1' | '2' | '3a' | '3b' | '4' | '5' | 'dialysis' | 'transplant';
export type DietaryType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

// User Profile
export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  ckdStage: string;
  weight: number;
  height?: number;
  dietaryPreference: string;
  cuisinePreferences: string[];
  foodAllergies: string[];
  streakDays: number;
  lastActiveAt?: Date;
}

// Nutrient Values
export interface NutrientValues {
  potassium: number;
  phosphorus: number;
  protein: number;
  sodium: number;
  calories: number;
  fluids: number;
}

// Dashboard types
export interface DashboardData {
  user: {
    fullName: string;
    ckdStage: string;
    streakDays: number;
  };
  aiPersonalMessage: {
    message: string;
    sentiment: 'positive' | 'neutral' | 'encouraging';
  };
  nutrientsToday: Record<string, {
    consumed: number;
    limit: number;
    percent: number;
  }>;
  contextualCards: ContextualCard[];
  notificationsUnread: number;
}

export interface ContextualCard {
  type: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: number;
}

// Meals & Foods
export interface DetectedFood {
  foodId: string;
  foodName: string;
  category: string;
  cuisine?: string;
  imageUrl?: string;
  defaultPortionGrams: number;
  nutrientsPer100g: NutrientValues;
}

export interface FoodWithPortion {
  foodId: string;
  portionGrams: number;
}

export interface NutrientAnalysis {
  foodBreakdown: FoodNutrientDetail[];
  totalNutrients: NutrientValues;
  currentIntake: NutrientValues;
  totalAfterMeal: NutrientValues;
  dailyLimits: NutrientValues;
  warnings: NutrientWarning[];
  isSafe: boolean;
}

export interface NutrientWarning {
  nutrient: string;
  severity: 'warning' | 'danger';
  currentIntake: number;
  mealAmount: number;
  totalAfterMeal: number;
  dailyLimit: number;
  percentOfLimit: number;
  message: string;
}

export interface FoodNutrientDetail {
  foodId: string;
  foodName: string;
  portionGrams: number;
  nutrients: NutrientValues;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}
