import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore.ts';
import apiClient from '@/api/axios.config.ts';
import toast from 'react-hot-toast';
import {
    Users,
    Stethoscope,
    Building2,
    TrendingUp,
    UserPlus,
    Activity,
    AlertCircle,
    CheckCircle,
    XCircle,
    ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStats {
    totalUsers: number;
    totalDoctors: number;
    totalPharmacies: number;
    activeUsers: number;
    inactiveUsers: number;
    recentSignups: number;
}

export const AdminDashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalDoctors: 0,
        totalPharmacies: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        recentSignups: 0
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);

            // Fetch all users
            const usersResponse = await apiClient.get('/admin/users');
            const allUsers = usersResponse.data;

            // ✅ FILTRE : Exclure l'utilisateur connecté (super admin)
            const nonSuperAdminUsers = allUsers.filter((u: any) =>
                u.id !== user?.id
            );

            // Fetch doctors
            const doctorsResponse = await apiClient.get('/doctors');
            const doctors = doctorsResponse.data;

            // Fetch pharmacies
            const pharmaciesResponse = await apiClient.get('/pharmacies');
            const pharmacies = pharmaciesResponse.data;

            // Calculate stats (utiliser nonSuperAdminUsers)
            const simpleUsers = nonSuperAdminUsers.filter((u: any) => u.role === 'SIMPLE_USER');
            const activeUsers = nonSuperAdminUsers.filter((u: any) => u.isActive).length;
            const inactiveUsers = nonSuperAdminUsers.filter((u: any) => !u.isActive).length;

            // Recent signups (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentSignups = nonSuperAdminUsers.filter((u: any) =>
                new Date(u.createdAt) > sevenDaysAgo
            ).length;

            setStats({
                totalUsers: simpleUsers.length,
                totalDoctors: doctors.length,
                totalPharmacies: pharmacies.length,
                activeUsers,
                inactiveUsers,
                recentSignups
            });

            // Get 5 most recent users (SANS les super admins)
            const sorted = [...nonSuperAdminUsers].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentUsers(sorted.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const StatsCard: React.FC<{
        title: string;
        value: number;
        icon: React.ReactNode;
        color: string;
        change?: string;
        onClick?: () => void;
    }> = ({ title, value, icon, color, change, onClick }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {icon}
                </div>
                {change && (
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {change}
                    </span>
                )}
            </div>
            <h3 className="text-lg font-medium opacity-90 mb-1">{title}</h3>
            <p className="text-4xl font-bold">{value}</p>
        </motion.div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-xl"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, {user?.firstName}! 👋
                        </h1>
                        <p className="text-purple-100">
                            Here's what's happening with your platform today.
                        </p>
                    </div>
                    <Activity className="w-16 h-16 opacity-20" />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    change={`+${stats.recentSignups} this week`}
                    onClick={() => navigate('/admin/users')}
                />

                <StatsCard
                    title="Doctors"
                    value={stats.totalDoctors}
                    icon={<Stethoscope className="w-6 h-6" />}
                    color="bg-gradient-to-br from-emerald-500 to-green-600"
                    onClick={() => navigate('/admin/doctors')}
                />

                <StatsCard
                    title="Pharmacies"
                    value={stats.totalPharmacies}
                    icon={<Building2 className="w-6 h-6" />}
                    color="bg-gradient-to-br from-orange-500 to-red-600"
                    onClick={() => navigate('/admin/pharmacies')}
                />

                <StatsCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={<CheckCircle className="w-6 h-6" />}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                />

                <StatsCard
                    title="Inactive Users"
                    value={stats.inactiveUsers}
                    icon={<XCircle className="w-6 h-6" />}
                    color="bg-gradient-to-br from-gray-500 to-gray-600"
                />

                <StatsCard
                    title="New Signups (7d)"
                    value={stats.recentSignups}
                    icon={<UserPlus className="w-6 h-6" />}
                    color="bg-gradient-to-br from-purple-500 to-pink-600"
                    change="+15%"
                />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full flex items-center justify-between p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Manage Users</h4>
                                    <p className="text-sm text-gray-600">View and manage all users</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </button>

                        <button
                            onClick={() => navigate('/admin/doctors')}
                            className="w-full flex items-center justify-between p-4 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <Stethoscope className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Manage Doctors</h4>
                                    <p className="text-sm text-gray-600">Add new doctor account</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </button>

                        <button
                            onClick={() => navigate('/admin/pharmacies')}
                            className="w-full flex items-center justify-between p-4 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                    <Building2 className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Manage Pharmacies</h4>
                                    <p className="text-sm text-gray-600">Browse all pharmacies</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                        </button>

                    </div>
                </motion.div>

                {/* Recent Users */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                        {recentUsers.length > 0 ? (
                            recentUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        user.role === 'DOCTOR' ? 'bg-green-100 text-green-800' :
                                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                'bg-blue-100 text-blue-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">No recent users</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* System Status */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
            >
                <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-sm text-gray-600">System Health</p>
                            <p className="font-semibold text-gray-900">All Systems Operational</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                        <Activity className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-sm text-gray-600">API Status</p>
                            <p className="font-semibold text-gray-900">Normal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                        <AlertCircle className="w-8 h-8 text-purple-500" />
                        <div>
                            <p className="text-sm text-gray-600">Alerts</p>
                            <p className="font-semibold text-gray-900">0 Active</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};