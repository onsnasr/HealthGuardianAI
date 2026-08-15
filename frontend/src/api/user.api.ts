import apiClient from './axios.config';
import { User } from '@/types/auth.types';

export const userAPI = {
    // Get current user profile
    getProfile: async (email: string): Promise<User> => {
        const response = await apiClient.get<User>(`/users/me?email=${email}`);
        return response.data;
    },

    // Get user by ID
    getUserById: async (id: number): Promise<User> => {
        const response = await apiClient.get<User>(`/users/${id}`);
        return response.data;
    },

    // Update user profile (health info)
    updateProfile: async (id: number, data: Partial<User>): Promise<User> => {
        const response = await apiClient.put<User>(`/users/profile/${id}`, data);
        return response.data;
    },

    // Check profile completion status
    checkProfileStatus: async (id: number): Promise<{ isProfileComplete: boolean; message: string }> => {
        const response = await apiClient.get(`/users/profile-status/${id}`);
        return response.data;
    },
};