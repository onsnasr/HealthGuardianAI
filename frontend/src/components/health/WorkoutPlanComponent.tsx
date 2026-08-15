import { useEffect } from 'react';
import { useHealthPlanStore } from '@/store/healthPlanStore';
import { Dumbbell, Clock, Flame, MapPin, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Exercise } from '@/types/health.types';

const ExerciseCard = ({ day, exercises }: { day: string; exercises: Exercise[] }) => {
    const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration_minutes, 0);

    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'core': return 'bg-purple-500';
            case 'strength': return 'bg-blue-500';
            default: return 'bg-primary-500';
        }
    };

    return (
        <Card className="border-gray-200 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-primary-300" />
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Dumbbell className="h-4 w-4 text-primary-600" />
                        </div>
                        {day}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock className="h-3.5 w-3.5" />
                            {totalDuration} min
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                            <Flame className="h-3.5 w-3.5" />
                            {totalCalories} kcal
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {exercises.map((ex, idx) => {
                    const typeColor = getTypeColor(ex.type);

                    return (
                        <div
                            key={idx}
                            className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-all duration-200 hover:bg-gray-100"
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeColor} flex-shrink-0`}>
                                <Dumbbell className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{ex.name}</p>
                                <p className="text-xs text-gray-600 mt-1">{ex.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium">
                                        {ex.type}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-600">
                                        <MapPin className="h-3 w-3" />
                                        {ex.tunisian_location}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-sm font-bold text-primary-600">{ex.calories_burned}</p>
                                <p className="text-xs text-gray-600">kcal</p>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export const WorkoutPlanComponent = () => {
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
                    <p className="text-gray-500 mb-4">No workout plan available</p>
                    <p className="text-sm text-gray-400">Complete your daily habits to generate your plan</p>
                </div>
            </div>
        );
    }

    const { workout_schedule } = planData;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Workout Plan</h1>
                <p className="text-gray-600">Your personalized fitness program</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {Object.entries(workout_schedule.weekly_plan).map(([day, exercises]) => (
                    <ExerciseCard key={day} day={day} exercises={exercises} />
                ))}
            </div>

            {/* Weekly Summary */}
            <Card className="border-gray-200 bg-gradient-to-br from-primary-50 to-transparent overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-primary-500 to-primary-300" />
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-300 flex items-center justify-center">
                                <Flame className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Calories burned per week</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {workout_schedule.total_weekly_calories}
                                    <span className="text-lg text-gray-600 font-normal ml-1">kcal</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="rounded-xl bg-white px-6 py-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-primary-600">3</p>
                                <p className="text-xs text-gray-600">Sessions/week</p>
                            </div>
                            <div className="rounded-xl bg-white px-6 py-3 text-center shadow-sm">
                                <p className="text-2xl font-bold text-primary-600">50</p>
                                <p className="text-xs text-gray-600">Min/session</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Workout Tips */}
            <Card className="border-gray-200 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
                            <Target className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold">Workout Tips</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {workout_schedule.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-3 rounded-lg bg-purple-50 p-3 text-sm">
                                <span className="text-purple-600">✓</span>
                                <span className="text-gray-700">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};
