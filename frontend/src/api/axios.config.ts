import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Create axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (error.config?.skipGlobalErrorHandler) {
            return Promise.reject(error);
        }

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    // Validation errors
                    if (data.errors) {
                        Object.values(data.errors).forEach((err: any) => {
                            toast.error(err);
                        });
                    } else if (data.message) {
                        toast.error(data.message);
                    }
                    break;

                case 401:
                    // Unauthorized - Clear token and redirect to login
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/signin';
                    break;

                case 403:
                    toast.error("You don't have permission to access this resource");
                    break;

                case 404:
                    toast.error('Resource not found');
                    break;

                case 409:
                    // Conflict - e.g., email already exists
                    toast.error(data.message || 'Conflict error occurred');
                    break;

                case 500:
                    toast.error('Server error. Please try again later.');
                    break;

                default:
                    toast.error('An unexpected error occurred');
            }
        } else if (error.request) {
            // Network error
            toast.error('Network error. Please check your connection.');
        } else {
            toast.error('An error occurred. Please try again.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;