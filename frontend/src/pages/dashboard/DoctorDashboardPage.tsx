import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    MessageCircle,
    Activity,
    Clock,
    UserCheck,
    AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8081/api';

interface Appointment {
    id: number;
    patientName: string;
    appointmentTime: string;
    appointmentDate: string;
    appointmentType: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    patientPhone: string;
    reason?: string;
}

export const DoctorDashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'appointments'>('overview');
    const [isLoading, setIsLoading] = useState(true);

    // States for data
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [stats, setStats] = useState({
        totalAppointments: 0,
        todayAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        totalPatients: 0 // ✅ NOUVEAU
    });

    // Fetch Dashboard Data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.log('⚠️ No token found');
                toast.error('Please login to view dashboard');
                return;
            }

            console.log('🔍 Fetching doctor dashboard data...');

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Récupérer tous les rendez-vous
            let allAppointments: Appointment[] = [];

            try {
                const allAppointmentsResponse = await axios.get(
                    `${API_BASE_URL}/appointments/doctor/all`,
                    { headers }
                );
                allAppointments = allAppointmentsResponse.data;
                console.log('✅ All appointments received:', allAppointments.length);
                setAppointments(allAppointments);

                // Calculer les statistiques
                const pending = allAppointments.filter((a: Appointment) => a.status === 'PENDING').length;
                const confirmed = allAppointments.filter((a: Appointment) => a.status === 'CONFIRMED').length;

                setStats(prev => ({
                    ...prev,
                    totalAppointments: allAppointments.length,
                    pendingAppointments: pending,
                    confirmedAppointments: confirmed
                }));
            } catch (error: any) {
                console.error('❌ Error fetching all appointments:', error);
                setAppointments([]);
                allAppointments = [];
            }

            // Récupérer les rendez-vous d'aujourd'hui
            try {
                const todayResponse = await axios.get(
                    `${API_BASE_URL}/appointments/doctor/today`,
                    { headers }
                );
                const todayAppts = todayResponse.data;
                console.log('✅ Today appointments received:', todayAppts.length);
                setTodayAppointments(todayAppts);

                setStats(prev => ({
                    ...prev,
                    todayAppointments: todayAppts.length
                }));
            } catch (error: any) {
                console.error('❌ Error fetching today appointments:', error);

                // Filtrer manuellement
                console.log('ℹ️ Filtering today appointments manually...');
                const today = new Date().toISOString().split('T')[0];

                const todayAppts = allAppointments.filter(apt => {
                    const aptDate = typeof apt.appointmentDate === 'string'
                        ? apt.appointmentDate.split('T')[0]
                        : apt.appointmentDate;
                    return aptDate === today;
                });

                console.log('✅ Manual filter: Today appointments:', todayAppts.length);
                setTodayAppointments(todayAppts);
                setStats(prev => ({
                    ...prev,
                    todayAppointments: todayAppts.length
                }));
            }

            // ✅ NOUVEAU: Récupérer le nombre de patients
            try {
                const patientsResponse = await axios.get(
                    `${API_BASE_URL}/doctor-patients/count`,
                    { headers }
                );
                console.log('✅ Patients count:', patientsResponse.data.count);

                setStats(prev => ({
                    ...prev,
                    totalPatients: patientsResponse.data.count
                }));
            } catch (error: any) {
                console.error('❌ Error fetching patients count:', error);
            }

            console.log('✅ Dashboard data loaded successfully');

        } catch (error: any) {
            console.error('❌ Fatal error in fetchDashboardData:', error);

            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/signin';
            } else if (error.response?.status === 403) {
                if (error.response.data?.error === 'EMAIL_NOT_VERIFIED') {
                    toast.error('Please verify your email first');
                    window.location.href = '/verify-email-pending';
                } else {
                    toast.error('Access denied');
                }
            } else {
                console.error('Dashboard data error (silent):', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const StatsCard: React.FC<{
        title: string;
        value: string | number;
        icon: React.ReactNode;
        color: string;
        change?: string;
        onClick?: () => void;
    }> = ({ title, value, icon, color, change, onClick }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`${color} rounded-2xl p-6 text-white shadow-lg ${onClick ? 'cursor-pointer hover:shadow-xl transition-all' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">{icon}</div>
                {change && <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">{change}</span>}
            </div>
            <h3 className="text-lg font-medium opacity-90 mb-1">{title}</h3>
            <p className="text-3xl font-bold">{value}</p>
        </motion.div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white mb-6"
            >
                <h1 className="text-3xl font-bold">Welcome back, Dr. {user?.lastName}! 👨‍⚕️</h1>
                <p className="text-white/90 mt-2">
                    {stats.todayAppointments > 0
                        ? `You have ${stats.todayAppointments} appointment${stats.todayAppointments > 1 ? 's' : ''} today`
                        : 'No appointments scheduled for today'
                    }
                </p>
            </motion.div>

            {/* Stats Cards - ✅ AJOUT DE LA 5ÈME CARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatsCard
                    title="Total Appointments"
                    value={stats.totalAppointments}
                    icon={<Calendar className="w-6 h-6" />}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    onClick={() => navigate('/appointments')}
                />
                <StatsCard
                    title="Today's Appointments"
                    value={stats.todayAppointments}
                    icon={<Clock className="w-6 h-6" />}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                    onClick={() => navigate('/appointments')}
                />
                <StatsCard
                    title="Pending"
                    value={stats.pendingAppointments}
                    icon={<AlertCircle className="w-6 h-6" />}
                    color="bg-gradient-to-br from-yellow-500 to-orange-600"
                    onClick={() => navigate('/appointments')}
                />
                <StatsCard
                    title="Confirmed"
                    value={stats.confirmedAppointments}
                    icon={<UserCheck className="w-6 h-6" />}
                    color="bg-gradient-to-br from-purple-500 to-pink-600"
                    onClick={() => navigate('/appointments')}
                />
                {/* ✅ NOUVELLE CARD: My Patients */}
                <StatsCard
                    title="My Patients"
                    value={stats.totalPatients}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-gradient-to-br from-indigo-500 to-blue-600"
                    onClick={() => navigate('/patients')}
                />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-card mb-6">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: <Activity className="w-5 h-5" /> },
                        { id: 'appointments', label: 'Today\'s Appointments', icon: <Calendar className="w-5 h-5" /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Quick Stats */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                                <span className="font-medium text-gray-900">Pending Appointments</span>
                                            </div>
                                            <span className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <UserCheck className="w-5 h-5 text-green-600" />
                                                <span className="font-medium text-gray-900">Confirmed Appointments</span>
                                            </div>
                                            <span className="text-2xl font-bold text-green-600">{stats.confirmedAppointments}</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                                <span className="font-medium text-gray-900">Total Appointments</span>
                                            </div>
                                            <span className="text-2xl font-bold text-blue-600">{stats.totalAppointments}</span>
                                        </div>

                                        {/* ✅ NOUVEAU: Patients Stats */}
                                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Users className="w-5 h-5 text-indigo-600" />
                                                <span className="font-medium text-gray-900">My Patients</span>
                                            </div>
                                            <span className="text-2xl font-bold text-indigo-600">{stats.totalPatients}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Today's Schedule Preview */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                                    <div className="space-y-3">
                                        {todayAppointments.length > 0 ? (
                                            todayAppointments.slice(0, 5).map((apt) => (
                                                <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <Clock className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{apt.patientName}</p>
                                                            <p className="text-sm text-gray-600">{apt.appointmentType}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{formatTime(apt.appointmentTime)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500">No appointments scheduled for today</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => navigate('/appointments')}
                                        className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-left"
                                    >
                                        <Calendar className="w-6 h-6 mb-2" />
                                        <p className="font-semibold">View All Appointments</p>
                                        <p className="text-sm text-blue-100 mt-1">Manage your schedule</p>
                                    </button>

                                    {/* ✅ NOUVEAU: Bouton My Patients */}
                                    <button
                                        onClick={() => navigate('/patients')}
                                        className="p-4 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-left"
                                    >
                                        <Users className="w-6 h-6 mb-2" />
                                        <p className="font-semibold">My Patients</p>
                                        <p className="text-sm text-indigo-100 mt-1">View patient list</p>
                                    </button>

                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="p-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors text-left"
                                    >
                                        <UserCheck className="w-6 h-6 mb-2" />
                                        <p className="font-semibold">Update Profile</p>
                                        <p className="text-sm text-purple-100 mt-1">Manage your information</p>
                                    </button>

                                    <button
                                        onClick={() => navigate('/chat')}
                                        className="p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-left"
                                    >
                                        <MessageCircle className="w-6 h-6 mb-2" />
                                        <p className="font-semibold">Patient Messages</p>
                                        <p className="text-sm text-green-100 mt-1">Chat with patients</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Today's Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Today's Appointments ({todayAppointments.length})
                                </h3>
                                <button
                                    onClick={() => navigate('/appointments')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    View All
                                </button>
                            </div>

                            {todayAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {todayAppointments.map((apt) => (
                                        <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{apt.patientName}</p>
                                                    <p className="text-sm text-gray-600">{apt.appointmentType} • {formatTime(apt.appointmentTime)}</p>
                                                    {apt.reason && (
                                                        <p className="text-sm text-gray-500 mt-1">Reason: {apt.reason}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                        apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {apt.status}
                                                </span>
                                                <button
                                                    onClick={() => navigate('/appointments')}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-center">No appointments scheduled for today</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};