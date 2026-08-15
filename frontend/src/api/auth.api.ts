import apiClient from './axios.config';
import { SignInRequest, SignUpRequest, AuthResponse } from '@/types/auth.types';

export const authAPI = {
    // Sign Up
    signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/signup', data);
        return response.data;
    },

    // Sign In
    signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/signin', credentials);
        return response.data;
    },

    // Test API connection
    testConnection: async (): Promise<string> => {
        const response = await apiClient.get<string>('/auth/test');
        return response.data;
    },
};