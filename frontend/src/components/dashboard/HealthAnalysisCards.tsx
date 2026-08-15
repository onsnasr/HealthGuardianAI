import { useEffect } from 'react';
import { useHealthPlanStore } from '@/store/healthPlanStore';
import {
    Activity,
    TrendingUp,
    Droplets,
    Heart,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

// Health Score Card Component
export const HealthScoreCard = () => {
    const { planData, isLoading, fetchHealthPlan } = useHealthPlanStore();

    useEffect(() => {
        // Fetch health plan if not already loaded
        if (!planData && !isLoading) {
            fetchHealthPlan();
        }
    }, [planData, isLoading, fetchHealthPlan]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-card h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!planData) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-card h-64 flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">No health data available</p>
                <p className="text-sm text-gray-400">Complete your daily habits</p>
            </div>
        );
    }

    const { health_analysis } = planData;
    const score = health_analysis.health_score;

    const getScoreColor = () => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary-500" />
                Health Score
            </h3>
            <div className="h-64 flex flex-col items-center justify-center">
                {/* Health Score Circle */}
                <div className="relative flex h-32 w-32 items-center justify-center mb-4">
                    <svg className="h-full w-full -rotate-90 transform">
                        <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="12"
                            strokeDasharray={`${(score / 100) * 351.86} 351.86`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute text-center">
                        <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
                        <p className="text-xs text-gray-600">Score</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                    {health_analysis.needs_doctor ? (
                        <span className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                            Consultation Recommended
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            No Urgent Issues
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Risk Predictions Card Component  
export const RiskPredictionsCard = () => {
    const { planData, isLoading } = useHealthPlanStore();

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-card h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!planData) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-card h-64 flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-4">No data available</p>
                <p className="text-sm text-gray-400">Complete your daily habits</p>
            </div>
        );
    }

    const { health_analysis } = planData;

    const RiskBar = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) => {
        const percentage = Math.round(value * 100);

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
                            <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{label}</span>
                    </div>
                    <span className={`text-sm font-bold ${percentage >= 30 ? 'text-red-600' : percentage >= 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {percentage}%
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${percentage >= 30 ? 'bg-red-500' :
                            percentage >= 20 ? 'bg-yellow-500' :
                                'bg-green-500'
                            }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Risk Analysis
            </h3>
            <div className="space-y-4">
                <RiskBar label="Diabetes" value={health_analysis.risk_diabetes} icon={Droplets} color="bg-blue-500" />
                <RiskBar label="Hypertension" value={health_analysis.risk_hypertension} icon={Activity} color="bg-red-500" />
                <RiskBar label="Obesity" value={health_analysis.risk_obesity} icon={TrendingUp} color="bg-orange-500" />
                <RiskBar label="Heart Disease" value={health_analysis.risk_heart_disease} icon={Heart} color="bg-pink-500" />
            </div>
        </div>
    );
};
