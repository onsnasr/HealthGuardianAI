// frontend/src/types/health.types.ts
// ✅ VERSION COMPLÈTE qui résout les 2 problèmes

// ==================== Existing Types (keep them) ====================
export interface HealthHabits {
    id?: string;
    userId: number;
    bpSystolic: number;
    bpDiastolic: number;
    cafeJour: number;
    dailySteps: number;
    exerciseHoursPerWeek: number;
    heuresTravailJour: number;
    hoursOfSleep: number;
    litresEauJour: number;
    bedtimeHour: string;
    activityStatus: string;
    jobType: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface HealthHabitsResponse {
    message: string;
    data: HealthHabits;
}

// ==================== AI API Response Types ====================
export interface MealItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portion: string;
    tunisian_alternative: string;
}

export interface Exercise {
    name: string;
    type: string;
    duration_minutes: number;
    calories_burned: number;
    sets: number;
    reps: number | null;
    tunisian_location: string;
    description: string;
}

export interface RiskAnalysisResponse {
    userId: string;
    bmi: number;
    health_score: number;
    risk_diabetes: number;
    risk_hypertension: number;
    risk_obesity: number;
    risk_heart_disease: number;
    recommendations: string[];
    needs_doctor: boolean;
    diet_plan_type: string;
}

export interface NutritionSchedule {
    userId: string;
    daily_calories: number;
    daily_protein: number;
    daily_carbs: number;
    daily_fat: number;
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snacks: MealItem[];
    tips: string[];
}

export interface WorkoutSchedule {
    userId: string;
    weekly_plan: Record<string, Exercise[]>;
    total_weekly_calories: number;
    progression_notes: string;
    tips: string[];
}

export interface FullPlanResponse {
    status: string;
    ai_coach_message: string;
    health_analysis: RiskAnalysisResponse;
    nutrition_schedule: NutritionSchedule;
    workout_schedule: WorkoutSchedule;
}

export interface ChatbotResponse {
    answer: string;
    question?: string;
    risks_used?: any;
    suggestions?: string[];
    conversation_id?: string;
}

export interface CombinedHealthData {
    userId: string;
    age: number;
    gender: number;
    height: number;
    weight: number;
    hours_of_sleep: number;
    exercise_hours_per_week: number;
    daily_steps: number;
    litres_eau_jour: number;
    cafe_jour: number;
    heures_travail_jour: number;
    bedtime_hour: string;
    bp_systolic: number;
    bp_diastolic: number;
    job_type: string;
    activity_status: string;
    goal: string;
}

// ==================== 🆕 NEW TYPES (Fix for your 2 errors) ====================

/**
 * 🆕 DTO reçu depuis Spring Boot avec toutes les données du patient
 * ✅ FIX pour l'erreur "PatientHealthDashboardData is declared but never used"
 */
export interface PatientHealthDashboardData {
    userId: number;
    patientName: string;
    patientEmail: string;
    age: number;
    weight: number;
    height: number;
    bmi?: number;

    // Health Habits
    hoursOfSleep: number;
    bedtimeHour: string;
    exerciseHoursPerWeek: number;
    dailySteps: number;
    litresEauJour: number;
    cafeJour: number;
    heuresTravailJour: number;
    jobType: string;
    activityStatus: string;
    bpSystolic: number;
    bpDiastolic: number;

    // Status Flags
    hasHealthHabits: boolean;
    isProfileComplete: boolean;
    errorMessage?: string;
}

/**
 * 🆕 Old PatientHealthData interface (used in DoctorPatientsPage.tsx)
 * ✅ FIX pour l'interface qui était manquante
 */
export interface PatientHealthData {
    nutrition: {
        calories: number;
        trend: number;
    };
    exercise: {
        duration: number;
        trend: number;
    };
    dailyHabits: {
        score: number;
        total: number;
        status: string;
    };
    aiInsights: {
        status: string;
        trend: number;
    };
    healthScore: {
        score: number;
        status: string;
    };
    riskAnalysis: {
        diabetes: number;
        hypertension: number;
        obesity: number;
        heartDisease: number;
    };
}