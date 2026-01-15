// Core User Types
export type CKDStage = '1' | '2' | '3a' | '3b' | '4' | '5' | 'dialysis' | 'transplant';
export type DietaryType = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';
export type DialysisType = 'hemodialysis' | 'peritoneal';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

// User Profile
export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;

  // Medical Info
  ckdStage: CKDStage;
  diagnosisDate?: Date;
  dialysisType?: DialysisType;
  transplantDate?: Date;
  weight: number; // kg
  height?: number; // cm
  egfr?: number;

  // Dietary
  dietaryPreference: DietaryType;
  cuisinePreferences: string[];
  foodAllergies: string[];

  // Healthcare
  nephrologist?: string;
  hospital?: string;

  // App Settings
  notificationsEnabled: boolean;
  reminderTime: string;
  language: 'en' | 'hi';
  theme: 'light' | 'dark' | 'auto';

  // Permissions
  permissionCamera: boolean;
  permissionNotifications: boolean;
  permissionMicrophone: boolean;

  // Tracking
  streakDays: number;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Nutrient Values
export interface NutrientValues {
  potassium: number; // mg
  phosphorus: number; // mg
  protein: number; // g
  sodium: number; // mg
  calories: number; // kcal
  fluids: number; // ml
}

// Daily Limits
export interface DailyLimits extends NutrientValues {}

// Meal Interfaces
export interface Meal {
  mealId: string;
  userId: string;
  photoUrl: string;
  mealType?: MealType;
  consumedAt: Date;
  nutrients: NutrientValues;
  notes?: string;
  createdAt: Date;
}

export interface MealFood {
  mealFoodId: string;
  mealId: string;
  foodId: string;
  foodName: string;
  portionGrams: number;
  nutrients: NutrientValues;
}

export interface Food {
  foodId: string;
  foodName: string;
  foodNameLocal?: string;
  category: string;
  cuisine?: string;
  nutrientsPer100g: NutrientValues;
  imageUrl?: string;
  description?: string;
  servingSizeGrams: number;
  isVerified: boolean;
  createdAt: Date;
}

// Food Photo Analysis
export interface DetectedFood {
  foodId: string;
  name: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PortionAdjusted {
  foodId: string;
  portionGrams: number;
  portionMultiplier: number;
  additions: string[];
}

export interface NutrientBreakdown {
  mealId: string;
  totalNutrients: NutrientValues;
  foodBreakdown: FoodNutrientDetail[];
  dailyTotalsAfterMeal: NutrientValues;
  limitsExceeded: NutrientAlert[];
}

export interface FoodNutrientDetail {
  foodId: string;
  foodName: string;
  portionSize: number;
  nutrients: NutrientValues;
}

export interface NutrientAlert {
  nutrient: keyof NutrientValues;
  currentIntake: number;
  mealAmount: number;
  totalAfterMeal: number;
  dailyLimit: number;
  percentOfLimit: number;
  severity: 'caution' | 'warning' | 'danger';
}

// Medication Interfaces
export interface Medication {
  medicationId: string;
  userId: string;
  medicationName: string;
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  schedules: MedicationSchedule[];
  instructions?: string;
  prescribedBy?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  interactions: DrugInteraction[];
  createdAt: Date;
}

export interface MedicationSchedule {
  scheduleId: string;
  medicationId: string;
  time: string; // "08:00"
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
}

export interface DrugInteraction {
  interactionId: string;
  type: 'drug-drug' | 'drug-nutrient' | 'drug-condition';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

export interface MedicationLog {
  logId: string;
  medicationId: string;
  scheduleId?: string;
  scheduledTime: Date;
  takenAt?: Date;
  status: 'taken' | 'missed' | 'skipped';
  notes?: string;
  createdAt: Date;
}

// Lab Results
export interface LabResult {
  labResultId: string;
  userId: string;
  testDate: Date;
  source: 'photo_upload' | 'mychart' | 'manual';
  uploadedPhotoUrl?: string;
  biomarkers: Biomarker[];
  notes?: string;
  createdAt: Date;
}

export interface Biomarker {
  biomarkerId: string;
  labResultId: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: { min: number; max: number };
  status: 'normal' | 'low' | 'high' | 'critical';
}

// Chat Interfaces
export interface ChatMessage {
  messageId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    queryType?: 'food_safety' | 'meal_planning' | 'symptom' | 'general';
    foodsReferenced?: string[];
    nutrientWarnings?: string[];
  };
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActiveAt: Date;
}

// Authentication
export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// API Responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    totalPages?: number;
    totalItems?: number;
  };
}

// Dashboard
export interface DashboardData {
  user: {
    fullName: string;
    ckdStage: CKDStage;
    streakDays: number;
  };
  aiPersonalMessage: {
    message: string;
    sentiment: 'positive' | 'neutral' | 'encouraging';
  };
  nutrientsToday: Record<keyof NutrientValues, {
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

// Notifications
export interface Notification {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
  isRead: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
}

// Educational Content
export interface EducationalContent {
  contentId: string;
  title: string;
  subtitle?: string;
  type: 'article' | 'video' | 'tip' | 'recipe';
  category: 'nutrition' | 'medications' | 'lifestyle' | 'symptoms' | 'recipes';
  thumbnailUrl: string;
  content: string;
  duration?: number;
  author: string;
  publishedAt: Date;
  tags: string[];
  isFeatured: boolean;
  createdAt: Date;
}

// Analytics
export interface NutrientTrends {
  period: 'week' | 'month' | '3months';
  dataPoints: NutrientDataPoint[];
  averages: NutrientValues;
  complianceRate: number;
  insights: AIInsight[];
}

export interface NutrientDataPoint {
  date: string;
  nutrients: NutrientValues;
  percentOfLimits: Record<keyof NutrientValues, number>;
  violations: string[];
}

export interface AIInsight {
  type: 'positive' | 'concern' | 'suggestion';
  title: string;
  description: string;
  actionable?: string;
}

// Request types
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}
