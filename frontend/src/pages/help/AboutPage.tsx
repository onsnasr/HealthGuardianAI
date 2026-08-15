import React from 'react';
import { Heart, Target, Users, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-card p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">About HealthGuardian AI</h1>
                    <p className="text-gray-600 text-lg">
                        Your Intelligent Health Prevention Companion
                    </p>
                </div>

                {/* Mission */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary-500" />
                        Our Mission
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        HealthGuardian AI was created to address the growing epidemic of chronic diseases
                        (diabetes, hypertension, obesity) by providing intelligent, preventive healthcare
                        solutions. We believe that prevention is better than cure, and our AI-powered platform
                        helps you stay ahead of health issues before they become serious.
                    </p>
                </div>

                {/* What We Do */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-secondary-500" />
                        What We Do
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-primary-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">🍎 Nutrition Tracking</h3>
                            <p className="text-sm text-gray-600">
                                Monitor your daily meals and get personalized dietary recommendations
                            </p>
                        </div>

                        <div className="p-4 bg-secondary-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">💪 Exercise Monitoring</h3>
                            <p className="text-sm text-gray-600">
                                Track your physical activity and get customized workout plans
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">🤖 AI Predictions</h3>
                            <p className="text-sm text-gray-600">
                                Advanced machine learning to predict health risks and trends
                            </p>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">👨‍⚕️ Doctor Connect</h3>
                            <p className="text-sm text-gray-600">
                                Easy appointment booking and real-time chat with healthcare professionals
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6 text-green-500" />
                        Our Team
                    </h2>
                    <p className="text-gray-700 mb-4">
                        HealthGuardian AI is developed by a passionate team of healthcare professionals,
                        data scientists, and software engineers dedicated to making healthcare more accessible
                        and preventive.
                    </p>
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong>Version:</strong> 1.2.0<br />
                            <strong>Last Updated:</strong> November 2025<br />
                            <strong>Location:</strong> Tunis, Tunisia
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};