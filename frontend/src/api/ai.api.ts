import axios from 'axios';
import { RiskAnalysisResponse, FullPlanResponse, ChatbotResponse, CombinedHealthData } from '@/types/health.types';

// AI API base URL (port 8000 for FastAPI)
const AI_API_BASE_URL = 'http://localhost:8000';

// Create axios instance for AI API
export const aiClient = axios.create({
    baseURL: AI_API_BASE_URL,
    timeout: 30000, // 30s for AI operations
    headers: {
        'Content-Type': 'application/json',
    },
});

export const aiAPI = {
    // Predict health risks
    predictRisks: async (data: CombinedHealthData): Promise<RiskAnalysisResponse> => {
        const response = await aiClient.post<RiskAnalysisResponse>('/api/predict-risks', data);
        return response.data;
    },

    // Generate full personalized plan (nutrition + workout + AI coach)
    generateFullPlan: async (data: CombinedHealthData): Promise<FullPlanResponse> => {
        const response = await aiClient.post<FullPlanResponse>('/api/generate-full-plan', data);
        return response.data;
    },

    // Chat with AI coach
    chatbot: async (question: string, userData?: CombinedHealthData): Promise<ChatbotResponse> => {
        const response = await aiClient.post<ChatbotResponse>('/api/chatbot', {
            question,
            user_data: userData,
        });
        return response.data;
    },
};
