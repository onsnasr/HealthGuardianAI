import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FullPlanResponse } from '@/types/health.types';
import { aiAPI } from '@/api/ai.api';
import { healthHabitsAPI } from '@/api/healthHabits.api';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

interface HealthPlanState {
    planData: FullPlanResponse | null;
    userId: string | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    fetchHealthPlan: () => Promise<void>;
    clearPlan: () => void;
}

export const useHealthPlanStore = create<HealthPlanState>()(
    persist(
        (set) => ({
            planData: null,
            userId: null,
            isLoading: false,
            error: null,
            lastUpdated: null,

            fetchHealthPlan: async () => {
                const { user } = useAuthStore.getState();

                if (!user) {
                    set({ error: 'User not authenticated' });
                    return;
                }

                // Check for profile completeness
                if (!user.age || !user.height || !user.weight) {
                    set({ isLoading: false, planData: null, userId: null });
                    return;
                }

                // IMPORTANT: Clear old cached data to force fresh fetch AND set loading in one atomic update
                // This prevents the Dashboard from seeing a state where planData is null BUT loading is false
                set({
                    planData: null,
                    lastUpdated: null,
                    isLoading: true,
                    error: null
                });

                try {
                    const habits = await healthHabitsAPI.getMyHabits();

                    if (!habits) {
                        set({ isLoading: false, planData: null, userId: null });
                        return;
                    }

                    // Combine user profile + habits
                    const combinedData = {
                        userId: String(user.id),  // Convert to string
                        age: user.age,
                        gender: 0,
                        height: user.height,
                        weight: user.weight,
                        hours_of_sleep: habits.hoursOfSleep,
                        exercise_hours_per_week: habits.exerciseHoursPerWeek,
                        daily_steps: habits.dailySteps,
                        litres_eau_jour: habits.litresEauJour,
                        cafe_jour: habits.cafeJour,
                        heures_travail_jour: habits.heuresTravailJour,
                        bedtime_hour: habits.bedtimeHour,
                        bp_systolic: habits.bpSystolic,
                        bp_diastolic: habits.bpDiastolic,
                        job_type: habits.jobType,
                        activity_status: habits.activityStatus,
                        goal: 'health',
                    };

                    const fullPlan = await aiAPI.generateFullPlan(combinedData);

                    set({
                        planData: fullPlan,
                        userId: String(user.id),
                        isLoading: false,
                        lastUpdated: new Date().toISOString(),
                        error: null,
                    });

                    toast.success('Plan de santé mis à jour!');
                } catch (error) {
                    console.error('❌ HealthPlanStore - Error:', error);
                    set({
                        error: error instanceof Error ? error.message : 'Failed to fetch health plan',
                        isLoading: false,
                    });
                    // Removed toast.error to prevent popup loops
                    console.error('Impossible de charger le plan de santé', error);
                }
            },

            clearPlan: () => {
                set({
                    planData: null,
                    userId: null,
                    error: null,
                    lastUpdated: null,
                });
            },
        }),
        {
            name: 'health-plan-storage',
            partialize: (state) => ({
                planData: state.planData,
                userId: state.userId,
                lastUpdated: state.lastUpdated,
            }),
        }
    )
);