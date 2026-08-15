import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

// Auth Pages
import { SignInPage } from '@/pages/auth/SignInPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { EmailVerificationPage } from '@/pages/auth/EmailVerificationPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPendingPage } from '@/pages/auth/VerifyEmailPendingPage';
import { DoctorAvailabilityPage } from '@/pages/availability/DoctorAvailabilityPage';


// Layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// SimpleUser Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { ProfileCompletionPage } from '@/pages/profile/ProfileCompletionPage';

import { NutritionPage } from '@/pages/nutrition/NutritionPage';
import { ExercisePage } from '@/pages/exercise/ExercisePage';
import { DailyHabitsPage } from '@/pages/dashboard/DailyHabitsPage';
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage';
import { ChatPage } from '@/pages/chat/ChatPage';
import { HelpPage } from '@/pages/help/HelpPage';
import { AboutPage } from '@/pages/help/AboutPage';
import { DoctorAppointmentsPage } from '@/pages/appointments/DoctorAppointmentsPage';

// Doctor Pages
import { DoctorDashboardPage } from '@/pages/dashboard/DoctorDashboardPage';
import { DoctorProfilePage } from '@/pages/profile/DoctorProfilePage';
import { DoctorHelpPage } from '@/pages/help/DoctorHelpPage';
import { DoctorAboutPage } from '@/pages/help/DoctorAboutPage';
import { DoctorPatientsPage } from '@/pages/patients/DoctorPatientsPage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminDoctorsPage } from '@/pages/admin/AdminDoctorsPage';
import { AdminPharmaciesPage } from '@/pages/admin/AdminPharmaciesPage';
import { AdminProfilePage } from '@/pages/admin/AdminProfilePage';
import { AdminRolesPage } from '@/pages/admin/AdminRolesPage';

//shared
import { SettingsPage } from '@/pages/Settings/SettingsPage';

// Components
import { EmailVerification } from '@/components/auth/EmailVerification';
import { PharmacySearchPage } from '@/pages/pharmacy/PharmacySearchPage';

// Add this route in your Routes section (after the tracking route, before appointments)

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <>{children}</> : <Navigate to="/signin" replace />;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Role-Based Layout Component
const RoleBasedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuthStore();

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    if (user.role === 'ADMIN') {
        return <AdminLayout>{children}</AdminLayout>;
    } else if (user.role === 'DOCTOR') {
        return <DoctorLayout>{children}</DoctorLayout>;
    } else {
        return <MainLayout>{children}</MainLayout>;
    }
};

// Role-Based Dashboard
const RoleBasedDashboard: React.FC = () => {
    const { user } = useAuthStore();

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    switch (user.role) {
        case 'ADMIN':
            return <AdminDashboardPage />;
        case 'DOCTOR':
            return <DoctorDashboardPage />;
        case 'PHARMACY':
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-card text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pharmacy Dashboard</h1>
                        <p className="text-gray-600">Pharmacy interface - Coming Soon</p>
                    </div>
                </div>
            );
        case 'SIMPLE_USER':
        default:
            return <DashboardPage />;
    }
};

// Role-Based Profile
const RoleBasedProfile: React.FC = () => {
    const { user } = useAuthStore();

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    if (user.role === 'ADMIN') {
        return <AdminProfilePage />;
    } else if (user.role === 'DOCTOR') {
        return <DoctorProfilePage />;
    } else {
        return <ProfilePage />;
    }
};

// Role-Based Appointments
const RoleBasedAppointments: React.FC = () => {
    const { user } = useAuthStore();

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    if (user.role === 'DOCTOR') {
        return <DoctorAppointmentsPage />;
    }

    return <AppointmentsPage />;
};

// Role-Based Help
const RoleBasedHelp: React.FC = () => {
    const { user } = useAuthStore();
    return user?.role === 'DOCTOR' ? <DoctorHelpPage /> : <HelpPage />;
};

// Role-Based About
const RoleBasedAbout: React.FC = () => {
    const { user } = useAuthStore();
    return user?.role === 'DOCTOR' ? <DoctorAboutPage /> : <AboutPage />;
};

function App() {
    // Apply font size on mount and when it changes
    useEffect(() => {
        const fontSize = localStorage.getItem('fontSize') || 'medium';
        const root = document.documentElement;

        // Remove all font size classes
        root.classList.remove('text-small', 'text-medium', 'text-large');

        // Add the current font size class
        root.classList.add(`text-${fontSize}`);
    }, []);

    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
                    <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
                    <Route path="/verify-email" element={<EmailVerificationPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Email Verification Pending */}
                    <Route
                        path="/verify-email-pending"
                        element={
                            <ProtectedRoute>
                                <VerifyEmailPendingPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <RoleBasedDashboard />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    {/* Profile */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <RoleBasedProfile />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile/complete"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <ProfileCompletionPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <AdminUsersPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/doctors"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <AdminDoctorsPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/pharmacies"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <AdminPharmaciesPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/roles"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <AdminRolesPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <SettingsPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    {/* SimpleUser Routes */}
                    <Route
                        path="/nutrition"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <NutritionPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/exercise"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <ExercisePage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tracking"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <DailyHabitsPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pharmacy-search"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <PharmacySearchPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    {/* Appointments */}
                    <Route
                        path="/appointments"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <RoleBasedAppointments />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    {/* Patients du docteur */}
                    <Route
                        path="/patients"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <DoctorPatientsPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    {/* Chat */}
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <ChatPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    {/* Help & About */}
                    <Route
                        path="/help"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <RoleBasedHelp />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <RoleBasedAbout />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/availability"
                        element={
                            <ProtectedRoute>
                                <EmailVerification>
                                    <RoleBasedLayout>
                                        <DoctorAvailabilityPage />
                                    </RoleBasedLayout>
                                </EmailVerification>
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Routes */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 1000,
                    style: {
                        background: '#fff',
                        color: '#1f2937',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}

export default App;