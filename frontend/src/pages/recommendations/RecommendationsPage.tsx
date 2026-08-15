import React from 'react';
import { Sparkles } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
                    <Sparkles className="w-10 h-10 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Recommendations</h1>
                <p className="text-gray-600 mb-6">
                    Get personalized health recommendations powered by AI
                </p>
                <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                    🚧 Coming Soon - Phase 6
                </div>
            </div>
        </div>
    );
};