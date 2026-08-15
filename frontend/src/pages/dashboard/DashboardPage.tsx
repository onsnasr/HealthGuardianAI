import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useHealthPlanStore } from '@/store/healthPlanStore';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { DailyHabitsModal } from '@/components/dashboard/DailyHabitsModal';
import { HealthScoreCard, RiskPredictionsCard } from '@/components/dashboard/HealthAnalysisCards';
import { healthHabitsAPI } from '@/api/healthHabits.api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Activity,
    Apple,
    Dumbbell,
    ClipboardList,
    Sparkles,
    Brain,
    AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';

// Stats Card Component
const StatsCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
    onClick?: () => void;
}> = ({ title, value, icon, color, trend, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {icon}
                </div>
                {trend && (
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-lg font-medium opacity-90 mb-1">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
        </motion.div>
    );
};

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { planData, userId: planUserId, isLoading: isPlanLoading, fetchHealthPlan, clearPlan } = useHealthPlanStore();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isDailyHabitsModalOpen, setIsDailyHabitsModalOpen] = useState(false);
    const [habitsExist, setHabitsExist] = useState<boolean | null>(null);

    // Effect to validate plan ownership
    useEffect(() => {
        if (user && planUserId && String(user.id) !== planUserId) {
            clearPlan();
        }
    }, [user, planUserId, clearPlan]);

    useEffect(() => {
        const checkHabits = async () => {
            try {
                const response = await healthHabitsAPI.exists();
                // Handle various response types (boolean, object, empty object)
                let exists = !!response;
                if (typeof response === 'object' && response !== null) {
                    // If empty object, treat as false
                    if (Object.keys(response).length === 0) {
                        exists = false;
                    }
                    // If explicit boolean property exists
                    else if ('exists' in response) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        exists = (response as any).exists;
                    }
                }
                
                setHabitsExist(exists);

                // Fetch health plan if habits exist and we don't have data yet
                if (exists && !planData && !isPlanLoading) {
                    fetchHealthPlan();
                }
            } catch (error) {
                console.error('Failed to check habits existence:', error);
            }
        };
        checkHabits();
    }, [planData, isPlanLoading, fetchHealthPlan, isDailyHabitsModalOpen, user?.isProfileComplete]);

    const formatCoachMessage = (msg: string) => {
        return msg.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <h3 key={i} className="mt-4 text-lg font-bold text-gray-900">{line.replace(/\*\*/g, '')}</h3>;
            }
            return <p key={i} className="mt-2 text-gray-600">{line}</p>;
        });
    };

    return (
        <>
            <div className="p-6">
                {/* Profile Incomplete Alert */}
                {(!user?.isProfileComplete && (!user?.age || !user?.weight || !user?.height)) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl"
                    >
                        <div className="flex items-start gap-3">
                            <Activity className="w-6 h-6 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-900 text-lg">Complete Your Profile</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Please complete your health information (age, weight, height) to unlock all features and get personalized recommendations.
                                </p>
                                <Button
                                    variant="primary"
                                    className="mt-3 bg-yellow-500 hover:bg-yellow-600"
                                    onClick={() => setIsProfileModalOpen(true)}
                                >
                                    Complete Now
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}



                {/* Daily Habits Alert */}
                {!habitsExist && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-6 bg-orange-50 border-l-4 border-orange-400 rounded-r-xl"
                    >
                        <div className="flex items-start gap-3">
                            <Activity className="w-6 h-6 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-orange-900 text-lg">
                                    {habitsExist ? "Update Your Daily Habits" : "Add Your Daily Habits"}
                                </h3>
                                <p className="text-sm text-orange-700 mt-1">
                                    {habitsExist
                                        ? "Keep your health data up to date to get the most accurate AI insights and recommendations."
                                        : "Complete your daily health habits to unlock personalized features like chatbot assistance and custom nutrition plans."}
                                </p>
                                <Button
                                    variant="primary"
                                    className="mt-3 bg-orange-500 hover:bg-orange-600"
                                    onClick={() => setIsDailyHabitsModalOpen(true)}
                                >
                                    {habitsExist ? "Update Now" : "Complete Now"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 4 Main Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Nutrition"
                        value="1,850"
                        icon={<Apple className="w-6 h-6" />}
                        color="bg-gradient-to-br from-green-500 to-emerald-600"
                        trend="↑ 12%"
                        onClick={() => navigate('/nutrition')}
                    />

                    <StatsCard
                        title="Exercise"
                        value="45 min"
                        icon={<Dumbbell className="w-6 h-6" />}
                        color="bg-gradient-to-br from-blue-500 to-cyan-600"
                        trend="↑ 8%"
                        onClick={() => navigate('/exercise')}
                    />

                    <StatsCard
                        title="Daily Habits"
                        value="8/10"
                        icon={<ClipboardList className="w-6 h-6" />}
                        color="bg-gradient-to-br from-purple-500 to-pink-600"
                        trend="✓ Good"
                        onClick={() => navigate('/tracking')}
                    />

                    <StatsCard
                        title="AI Insights"
                        value="Good"
                        icon={<Sparkles className="w-6 h-6" />}
                        color="bg-gradient-to-br from-orange-500 to-red-600"
                        trend="↑ 5%"
                        onClick={() => navigate('/recommendations')}
                    />
                </div>

                {/* Health Analysis Section */}
                {planData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Health Score - Red Paint Area */}
                        <HealthScoreCard />

                        {/* Risk Predictions - Yellow Paint Area */}
                        <RiskPredictionsCard />
                    </div>
                )}

                {/* AI Report & Recommendations Section */}
                {planData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* AI Coach Message */}
                        <Card className="border-gray-200 lg:col-span-2 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-primary-500" />
                                    Health Analysis Report
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-sm max-w-none">
                                {planData.ai_coach_message ? formatCoachMessage(planData.ai_coach_message) : (
                                    <p className="text-gray-500 italic">No analysis available yet.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <Card className="border-gray-200 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {planData.health_analysis.recommendations && planData.health_analysis.recommendations.length > 0 ? (
                                        planData.health_analysis.recommendations.map((rec, idx) => (
                                            <li key={idx} className="rounded-lg bg-yellow-50 p-3 text-sm text-gray-900">
                                                {rec}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">No specific recommendations.</p>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-card mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/nutrition')}
                            className="p-4 border-2 border-primary-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
                        >
                            <Apple className="w-8 h-8 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold text-gray-900">Log Meal</h4>
                            <p className="text-sm text-gray-600 mt-1">Track your nutrition</p>
                        </button>

                        <button
                            onClick={() => navigate('/exercise')}
                            className="p-4 border-2 border-secondary-200 rounded-xl hover:border-secondary-500 hover:bg-secondary-50 transition-all text-left group"
                        >
                            <Dumbbell className="w-8 h-8 text-secondary-500 mb-2 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold text-gray-900">Log Workout</h4>
                            <p className="text-sm text-gray-600 mt-1">Record your exercise</p>
                        </button>

                        <button
                            onClick={() => navigate('/tracking')}
                            className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                        >
                            <ClipboardList className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                            <h4 className="font-semibold text-gray-900">Daily Survey</h4>
                            <p className="text-sm text-gray-600 mt-1">Complete today's check-in</p>
                        </button>
                    </div>
                </div>

                {/* Coming Soon Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center"
                >
                    <Sparkles className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">More Features Coming Soon! 🚀</h3>
                    <p className="text-white/90 max-w-2xl mx-auto">
                        We're working on AI-powered health predictions, appointment booking with doctors,
                        real-time chat, and personalized recommendations. Stay tuned!
                    </p>
                </motion.div>
            </div>

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            {/* Daily Habits Modal */}
            <DailyHabitsModal
                isOpen={isDailyHabitsModalOpen}
                onClose={() => setIsDailyHabitsModalOpen(false)}
            />
        </>
    );
};
