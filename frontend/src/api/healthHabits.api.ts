import apiClient from './axios.config';
import { HealthHabits } from '@/types/health.types';

export const healthHabitsAPI = {
    createOrUpdate: async (data: HealthHabits) => {
        const response = await apiClient.post<HealthHabits>('/health-habits/createOrUpdateHealthHabits', data);
        return response.data;
    },

    update: async (data: HealthHabits) => {
        const response = await apiClient.put<HealthHabits>('/health-habits/updateHealthHabits', data);
        return response.data;
    },

    getMyHabits: async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const response = await apiClient.get<HealthHabits>('/health-habits/getMyHealthHabits', { skipGlobalErrorHandler: true });
        return response.data;
    },

    exists: async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const response = await apiClient.get<boolean>('/health-habits/exists', { skipGlobalErrorHandler: true });
        return response.data;
    },

    deleteMyHabits: async () => {
        const response = await apiClient.delete('/health-habits/deleteMyHealthHabits');
        return response.data;
    }
};
