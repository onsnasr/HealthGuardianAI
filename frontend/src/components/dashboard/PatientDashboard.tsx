import { useState, useEffect } from "react";
import { Activity, Droplets, Heart, Brain, Utensils, Dumbbell, AlertTriangle, CheckCircle, TrendingUp, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/common/Button";
import { aiAPI } from "@/api/ai.api";
import { useAuthStore } from "@/store/authStore";
import { HealthHabits, FullPlanResponse, MealItem, Exercise, CombinedHealthData } from "@/types/health.types";
import toast from "react-hot-toast";

interface PatientDashboardProps {
    habits: HealthHabits;
    onEdit: () => void;
}

const RiskBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => {
    const percentage = Math.round(value * 100);
    const getColor = () => {
        if (percentage < 20) return "bg-green-500";
        if (percentage < 40) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{label}</span>
                </div>
                <span className="font-semibold">{percentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
                <div className={`h-full rounded-full ${getColor()}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
};

const MealCard = ({ title, meals, icon: Icon }: { title: string; meals: MealItem[]; icon: React.ElementType }) => (
    <Card className="border-gray-200">
        <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-5 w-5 text-primary-500" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {meals.map((meal, idx) => (
                <div key={idx} className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-medium text-gray-900">{meal.name}</p>
                            <p className="text-xs text-gray-600">{meal.portion}</p>
                        </div>
                        <span className="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                            {meal.calories} kcal
                        </span>
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-gray-600">
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fat}g</span>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

const ExerciseCard = ({ day, exercises }: { day: string; exercises: Exercise[] }) => (
    <Card className="border-gray-200">
        <CardHeader className="pb-2">
            <CardTitle className="text-base">{day}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div>
                        <p className="font-medium text-gray-900">{ex.name}</p>
                        <p className="text-xs text-gray-600">{ex.description}</p>
                        <span className="mt-1 inline-block rounded bg-secondary-100 px-2 py-0.5 text-xs">{ex.type}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-primary-600">{ex.calories_burned} kcal</p>
                        <p className="text-xs text-gray-600">{ex.duration_minutes} min</p>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

export const PatientDashboard = ({ habits, onEdit }: PatientDashboardProps) => {
    const { user } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [planData, setPlanData] = useState<FullPlanResponse | null>(null);

    useEffect(() => {
        const fetchHealthPlan = async () => {
            console.log("📊 PatientDashboard - Component mounted");
            console.log("📊 PatientDashboard - Habits received:", habits);
            console.log("📊 PatientDashboard - User from store:", user);

            if (!user) {
                console.error("❌ PatientDashboard - User not authenticated");
                setIsLoading(false);
                return;
            }

            try {
                const combinedData: CombinedHealthData = {
                    userId: user.id.toString(),
                    age: user.age || 30,
                    gender: 0,
                    height: user.height || 1.75,
                    weight: user.weight || 70,
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

                console.log("📤 PatientDashboard - Sending to AI API:", combinedData);
                const fullPlan = await aiAPI.generateFullPlan(combinedData);
                console.log("✅ PatientDashboard - AI response received:", fullPlan);
                setPlanData(fullPlan);
            } catch (error) {
                console.error("❌ PatientDashboard - Failed to fetch health plan:", error);
                console.error("❌ PatientDashboard - Error details:", error);
                toast.error("Failed to load health plan. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHealthPlan();
    }, [habits, user]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!planData) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-600">Unable to load health plan. Please try again.</p>
                <Button onClick={onEdit} variant="primary" className="mt-4">
                    Update Habits
                </Button>
            </div>
        );
    }

    const { health_analysis, nutrition_schedule, workout_schedule, ai_coach_message } = planData;

    const formatCoachMessage = (msg: string) => {
        return msg.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <h3 key={i} className="mt-4 text-lg font-bold text-gray-900">{line.replace(/\*\*/g, '')}</h3>;
            }
            return <p key={i} className="mt-2 text-gray-600">{line}</p>;
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header with Edit Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Health Dashboard</h1>
                        <p className="text-gray-600">Your personalized health insights</p>
                    </div>
                    <Button onClick={onEdit} variant="outline" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Habits
                    </Button>
                </div>

                {/* Health Score */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-gray-200 md:col-span-1">
                        <CardContent className="flex flex-col items-center justify-center p-6">
                            <div className="relative flex h-32 w-32 items-center justify-center">
                                <svg className="h-full w-full -rotate-90 transform">
                                    <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="12"
                                        strokeDasharray={`${(health_analysis.health_score / 100) * 351.86} 351.86`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-4xl font-bold text-gray-900">{health_analysis.health_score}</span>
                                    <p className="text-xs text-gray-600">Health Score</p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                {health_analysis.needs_doctor ? (
                                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                                        <AlertTriangle className="h-4 w-4" /> Consultation recommended
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                                        <CheckCircle className="h-4 w-4" /> No urgent issues
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary-500" />
                                Risk Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RiskBar label="Diabetes" value={health_analysis.risk_diabetes} icon={Droplets} />
                            <RiskBar label="Hypertension" value={health_analysis.risk_hypertension} icon={Activity} />
                            <RiskBar label="Obesity" value={health_analysis.risk_obesity} icon={TrendingUp} />
                            <RiskBar label="Heart Disease" value={health_analysis.risk_heart_disease} icon={Heart} />
                        </CardContent>
                    </Card>
                </div>

                {/* Recommendations */}
                <Card className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Important Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {health_analysis.recommendations && health_analysis.recommendations.length > 0 ? (
                                health_analysis.recommendations.map((rec, idx) => (
                                    <li key={idx} className="rounded-lg bg-yellow-50 p-3 text-gray-900">
                                        {rec}
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No specific recommendations available.</p>
                            )}
                        </ul>
                    </CardContent>
                </Card>

                {/* AI Coach Message */}
                <Card className="border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary-500" />
                            Health Analysis Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                        {ai_coach_message ? formatCoachMessage(ai_coach_message) : (
                            <p className="text-gray-500 italic">No analysis available yet.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs for Nutrition and Workout */}
                <Tabs defaultValue="nutrition" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="nutrition" className="flex items-center gap-2">
                            <Utensils className="h-4 w-4" />
                            Nutrition Plan
                        </TabsTrigger>
                        <TabsTrigger value="workout" className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4" />
                            Workout Plan
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="nutrition" className="mt-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <MealCard title="Breakfast" meals={nutrition_schedule.breakfast} icon={Utensils} />
                            <MealCard title="Lunch" meals={nutrition_schedule.lunch} icon={Utensils} />
                            <MealCard title="Dinner" meals={nutrition_schedule.dinner} icon={Utensils} />
                            <MealCard title="Snacks" meals={nutrition_schedule.snacks} icon={Utensils} />
                        </div>
                        <Card className="border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-base">Nutrition Tips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {nutrition_schedule.tips.map((tip, idx) => (
                                        <li key={idx} className="rounded-lg bg-blue-50 p-2 text-sm text-gray-900">
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="workout" className="mt-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {Object.entries(workout_schedule.weekly_plan).map(([day, exercises]) => (
                                <ExerciseCard key={day} day={day} exercises={exercises} />
                            ))}
                        </div>
                        <Card className="border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-base">Workout Tips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {workout_schedule.tips.map((tip, idx) => (
                                        <li key={idx} className="rounded-lg bg-blue-50 p-2 text-sm text-gray-900">
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <div className="mb-4 rounded-lg bg-primary-50 p-4 text-center">
                            <p className="text-sm text-primary-600">Total Weekly Calories Burned</p>
                            <p className="text-2xl font-bold text-primary-700">{workout_schedule.total_weekly_calories} kcal</p>
                        </div>

                        <Card className="border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-base">Progression Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {workout_schedule.progression_notes ? (
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                        {workout_schedule.progression_notes}
                                    </pre>
                                ) : (
                                    <p className="text-gray-500 italic">No progression notes available.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
