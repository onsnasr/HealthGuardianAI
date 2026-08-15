import { useEffect } from 'react';
import { useHealthPlanStore } from '@/store/healthPlanStore';
import { Coffee, Sun, Moon, Apple, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MealItem } from '@/types/health.types';

const MealCard = ({ title, meals, icon: Icon, gradient }: { title: string; meals: MealItem[]; icon: React.ElementType; gradient: string }) => (
    <Card className="border-gray-200 overflow-hidden">
        <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
        <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">{title}</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {meals.map((meal, idx) => (
                <div
                    key={idx}
                    className="rounded-xl bg-gray-50 p-4 transition-all duration-200 hover:bg-gray-100"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{meal.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{meal.portion}</p>
                        </div>
                        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                            {meal.calories} kcal
                        </span>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            P: {meal.protein}g
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                            C: {meal.carbs}g
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            F: {meal.fat}g
                        </span>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

export const NutritionPlanComponent = () => {
    const { planData, isLoading, fetchHealthPlan } = useHealthPlanStore();

    useEffect(() => {
        if (!planData && !isLoading) {
            fetchHealthPlan();
        }
    }, [planData, isLoading, fetchHealthPlan]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!planData) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                    <p className="text-gray-500 mb-4">No nutrition plan available</p>
                    <p className="text-sm text-gray-400">Complete your daily habits to generate your plan</p>
                </div>
            </div>
        );
    }

    const { nutrition_schedule } = planData;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Nutrition Plan</h1>
                <p className="text-gray-600">Your personalized meal program</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <MealCard title="Breakfast" meals={nutrition_schedule.breakfast} icon={Coffee} gradient="from-yellow-500 to-orange-500" />
                <MealCard title="Lunch" meals={nutrition_schedule.lunch} icon={Sun} gradient="from-orange-500 to-red-500" />
                <MealCard title="Dinner" meals={nutrition_schedule.dinner} icon={Moon} gradient="from-purple-500 to-indigo-500" />
                <MealCard title="Snacks" meals={nutrition_schedule.snacks} icon={Apple} gradient="from-green-500 to-emerald-500" />
            </div>

            {/* Nutrition Tips */}
            <Card className="border-gray-200 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-primary-300" />
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-300">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold">Nutrition Tips</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {nutrition_schedule.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 text-sm">
                                <span className="text-blue-600">✓</span>
                                <span className="text-gray-700">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};
