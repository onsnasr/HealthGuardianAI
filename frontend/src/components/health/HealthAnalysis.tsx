import { Activity, Droplets, Heart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskAnalysisResponse } from "@/types/health.types";

interface HealthAnalysisProps {
    data: RiskAnalysisResponse;
}

const HealthScoreCircle = ({ score }: { score: number }) => {
    const getScoreColor = () => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform">
                <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
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
    );
};

const RiskBar = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) => {
    const percentage = Math.round(value * 100);

    return (
        <div className="group rounded-xl bg-gray-50 p-4 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} shadow-sm`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">{label}</span>
                </div>
                <span className={`text-lg font-bold ${percentage >= 30 ? 'text-red-600' : percentage >= 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {percentage}%
                </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                        percentage >= 30 ? 'bg-red-500' : 
                        percentage >= 20 ? 'bg-yellow-500' : 
                        'bg-green-500'
                    }`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>
        </div>
    );
};

export const HealthAnalysis = ({ data }: HealthAnalysisProps) => {
    return (
        <div className="space-y-6">
            {/* Health Score Card - Red Paint Area */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg">Score de Santé</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center p-6">
                    <HealthScoreCircle score={data.health_score} />
                    <div className="mt-4 text-center">
                        <p className="text-sm font-medium text-gray-600">
                            {data.needs_doctor ? (
                                <span className="text-red-600">⚠️ Consultation recommandée</span>
                            ) : (
                                <span className="text-green-600">✓ Aucune urgence</span>
                            )}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Risk Analysis - Yellow Paint Area */}
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary-500" />
                        Analyse des Risques
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RiskBar label="Diabète" value={data.risk_diabetes} icon={Droplets} color="bg-blue-500" />
                    <RiskBar label="Hypertension" value={data.risk_hypertension} icon={Activity} color="bg-red-500" />
                    <RiskBar label="Obésité" value={data.risk_obesity} icon={TrendingUp} color="bg-orange-500" />
                    <RiskBar label="Maladies Cardiaques" value={data.risk_heart_disease} icon={Heart} color="bg-pink-500" />
                </CardContent>
            </Card>
        </div>
    );
};
