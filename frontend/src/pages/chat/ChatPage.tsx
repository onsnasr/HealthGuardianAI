import React from 'react';
import { MessageCircle } from 'lucide-react';

export const ChatPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
                    <MessageCircle className="w-10 h-10 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat with Doctors</h1>
                <p className="text-gray-600 mb-6">
                    Real-time messaging with healthcare professionals
                </p>
                <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                    🚧 Coming Soon - Phase 5
                </div>
            </div>
        </div>
    );
};