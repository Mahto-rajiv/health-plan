// ─── Core Types ───────────────────────────────────────────────────────────────

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type WorkoutType = 'strength' | 'cardio' | 'mobility' | 'rest' | 'active-rest';
export type MealPlanId = 'preferred' | 'vegetarian' | 'vegetarian-eggs' | 'non-vegetarian';
export type ProgressMetric = 'weight' | 'waist' | 'squat' | 'bench' | 'deadlift' | 'row' | 'ohp';

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  startWeightKg: number;
  startDate: string;
  bmi: number;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  surplusKcal: number;
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
}

export interface FoodItem {
  name: string;
  quantityStr: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  timeLabel: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  prepNote?: string;
  isFixed?: boolean;
}

export interface DayMealPlan {
  day: DayOfWeek;
  isWeekend: boolean;
  meals: [Meal, Meal, Meal, Meal];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  notes?: string;
}

export interface MealPlan {
  id: MealPlanId;
  name: string;
  description: string;
  icon: string;
  weeklyPlan: DayMealPlan[];
  groceryList: GroceryCategory[];
  weeklyBudgetINR: number;
  monthlyBudgetINR: number;
  budgetNote: string;
  nutritionNotes: string[];
}

export interface GroceryCategory {
  category: string;
  items: GroceryItem[];
}

export interface GroceryItem {
  name: string;
  quantity: string;
  estimatedCostINR: number;
  notes?: string;
}

// ─── Training ─────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment: string;
  sets: number;
  repsStr: string;          // e.g. "8-12" or "10"
  rir: number;              // Reps In Reserve
  restSeconds: number;
  notes?: string;
  formCues: string[];
  progressionRule: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  type: WorkoutType;
  day: DayOfWeek;
  estimatedMinutes: number;
  warmupMinutes: number;
  exercises: Exercise[];
  cooldownNote: string;
  focusNote: string;
  alternativeIfMissed?: string;
}

export interface WeeklySchedule {
  week: number;
  sessions: WorkoutSession[];
}

export interface CompletedSet {
  exerciseId: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  rir?: number;
}

export interface CompletedWorkout {
  date: string;
  sessionId: string;
  sets: CompletedSet[];
  notes?: string;
  durationMinutes?: number;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface ProgressEntry {
  date: string;
  weightKg?: number;
  waistCm?: number;
  notes?: string;
}

export interface StrengthEntry {
  date: string;
  exercise: ProgressMetric;
  weightKg: number;
  reps: number;
  estimatedOneRM: number;
}

export interface NutritionLog {
  date: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
  adherencePercent: number;
}

// ─── Health / Blood Work ──────────────────────────────────────────────────────

export type BloodResultStatus = 'optimal' | 'acceptable' | 'low' | 'borderline' | 'discuss';

export interface BloodResult {
  name: string;
  value: number;
  unit: string;
  refRangeLow: number | null;
  refRangeHigh: number | null;
  refRangeStr: string;
  status: BloodResultStatus;
  interpretation: string;
  relevance: string;
  discussWithDoctor: boolean;
}

// ─── Recovery ─────────────────────────────────────────────────────────────────

export interface SleepEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  durationHours: number;
  qualityRating: number; // 1-5
}

export interface RecoveryTip {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface DashboardState {
  todayWeight: number;
  todayCalories: number;
  todayProtein: number;
  workoutCompleted: boolean;
  selectedMealPlan: MealPlanId;
}
