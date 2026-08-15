import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, SignInRequest, SignUpRequest, User } from '@/types/auth.types';
import { authAPI } from '@/api/auth.api';
import toast from 'react-hot-toast';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            signIn: async (credentials: SignInRequest) => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.signIn(credentials);

                    // Store token
                    localStorage.setItem('token', response.token);

                    // CORRECTION : Toujours utiliser la valeur du backend
                    set({
                        user: {
                            id: response.userId,
                            firstName: response.firstName,
                            lastName: response.lastName,
                            email: response.email,
                            role: response.role,
                            isProfileComplete: response.isProfileComplete,
                            isActive: response.isActive, // ← Toujours du backend
                            createdAt: new Date().toISOString(),
                        },
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success(`Welcome back, ${response.firstName}! 👋`);
                } catch (error: any) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            signUp: async (data: SignUpRequest) => {
                set({ isLoading: true });
                try {
                    const response = await authAPI.signUp(data);

                    // Store token
                    localStorage.setItem('token', response.token);

                    // CORRECTION : Toujours utiliser la valeur du backend
                    set({
                        user: {
                            id: response.userId,
                            firstName: response.firstName,
                            lastName: response.lastName,
                            email: response.email,
                            role: response.role,
                            isProfileComplete: response.isProfileComplete,
                            isActive: response.isActive, // ← false pour nouveau compte
                            createdAt: new Date().toISOString(),
                        },
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success(`Account created successfully! Please verify your email. 📧`);
                } catch (error: any) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // 🆕 METTRE À JOUR l'utilisateur avec les données du backend
            refreshUser: async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    const response = await fetch('http://localhost:8081/api/users/me', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        set({
                            user: {
                                id: userData.id,
                                firstName: userData.firstName,
                                lastName: userData.lastName,
                                email: userData.email,
                                role: userData.role,
                                isProfileComplete: userData.isProfileComplete,
                                isActive: userData.isActive,
                                createdAt: userData.createdAt,
                            }
                        });
                    }
                } catch (error) {
                    console.error('Failed to refresh user data:', error);
                }
            },

            verifyEmail: () => {
                set((state) => ({
                    user: state.user ? { ...state.user, isActive: true } : null
                }));
                toast.success('Email verified successfully! 🎉');
            },

            signOut: () => {
                localStorage.removeItem('token');
                // 🆕 SUPPRIMER TOUTES les données d'authentification
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
                toast.success('Logged out successfully');
            },

            logout: () => {
                localStorage.removeItem('token');
                // 🆕 SUPPRIMER TOUTES les données d'authentification
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
                toast.success('Logged out successfully');
            },

            setUser: (user: User) => {
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);