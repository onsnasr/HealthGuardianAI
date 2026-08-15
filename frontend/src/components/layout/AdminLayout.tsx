import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Building2,
    Settings,
    Menu,
    X,
    User,
    LogOut,
    ChevronDown,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const menuItems = [
        {
            path: '/dashboard',
            icon: LayoutDashboard,
            label: 'Dashboard',
            color: 'from-purple-500 to-indigo-600'
        },
        {
            path: '/admin/users',
            icon: Users,
            label: 'Users',
            color: 'from-blue-500 to-blue-600'
        },
        {
            path: '/admin/doctors',
            icon: Stethoscope,
            label: 'Doctors',
            color: 'from-green-500 to-emerald-600'
        },
        {
            path: '/admin/pharmacies',
            icon: Building2,
            label: 'Pharmacies',
            color: 'from-orange-500 to-red-600'
        },
        {
            path: '/admin/roles',
            icon: Shield,
            label: 'Role Management',
            color: 'from-indigo-500 to-purple-600'
        },
        {
            path: '/settings',
            icon: Settings,
            label: 'Settings',
            color: 'from-gray-500 to-gray-600'
        }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Top Navigation Bar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - Logo and Mobile Menu */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {sidebarOpen ? (
                                    <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                )}
                            </button>

                            <Link to="/dashboard" className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">HG</span>
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">HealthGuardian</h1>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">Admin Panel</p>
                                </div>
                            </Link>
                        </div>

                        {/* Right side - User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.firstName[0]}{user?.lastName[0]}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>

                            {/* User Dropdown Menu */}
                            <AnimatePresence>
                                {showUserMenu && (
                                    <>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setShowUserMenu(false)}
                                            className="fixed inset-0 z-40"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                                        >
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user?.firstName} {user?.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span className="text-sm">My Profile</span>
                                                </Link>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="text-sm">Logout</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out z-40 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    active
                                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 min-h-screen">
                {children}
            </main>
        </div>
    );
};