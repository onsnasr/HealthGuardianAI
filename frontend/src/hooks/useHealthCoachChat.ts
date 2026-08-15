import { useState } from 'react';
import { aiAPI } from '@/api/ai.api';
import { useAuthStore } from '@/store/authStore';
import { healthHabitsAPI } from '@/api/healthHabits.api';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const useHealthCoachChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuthStore();

    const sendMessage = async (userMessage: string) => {
        if (!userMessage.trim()) return;

        // Add user message
        const newUserMessage: ChatMessage = {
            role: 'user',
            content: userMessage,
        };
        setMessages((prev) => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            // Get user context for personalized responses
            let userData = undefined;

            if (user) {
                try {
                    const habits = await healthHabitsAPI.getMyHabits();
                    userData = {
                        userId: String(user.id),  // Convert to string
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
                } catch (error) {
                    console.warn('Failed to fetch habits for chat context:', error);
                }
            }

            // Call chatbot API
            const response = await aiAPI.chatbot(userMessage, userData);

            if (!response || !response.answer) {
                throw new Error('Invalid response from chatbot API');
            }

            // Add assistant response
            const newAssistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.answer,
            };
            setMessages((prev) => [...prev, newAssistantMessage]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: "Désolé, je n'ai pas pu répondre à votre question. Veuillez réessayer.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
    };

    return {
        messages,
        isLoading,
        sendMessage,
        clearMessages,
    };
};
