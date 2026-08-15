import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useClickOutside } from '@/hooks/useClickOutside'; // ✅ Import du hook
import {
    Search,
    Bell,
    MessageCircle,
    Settings,
    User,
    LogOut,
    ChevronDown,
    Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuthStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [, setDarkMode] = useState(false);

    // ✅ Créer les références pour les dropdowns
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Vérifier le dark mode au chargement
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        const isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;
        setDarkMode(isDarkMode);
    }, []);

    // ✅ Fermer les menus quand on clique ailleurs
    useClickOutside(profileMenuRef, () => {
        setShowProfileMenu(false);
    });

    useClickOutside(notificationsRef, () => {
        setShowNotifications(false);
    });

    const handleSignOut = () => {
        signOut();
        navigate('/signin');
    };

    // Get user initials
    const getUserInitials = () => {
        if (!user) return 'U';
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">HealthGuardian</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">AI Health Companion</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search doctors, services, appointments..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                            />
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        {/* ✅ Ajouter ref={notificationsRef} ici */}
                        <div className="relative" ref={notificationsRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                                    >
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">New appointment confirmed</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2 hours ago</p>
                                            </div>
                                            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Daily survey reminder</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">5 hours ago</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
                                            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                                                View all notifications
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Messages */}
                        <button
                            onClick={() => navigate('/chat')}
                            className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
                        </button>

                        {/* Profile Dropdown */}
                        {/* ✅ Ajouter ref={profileMenuRef} ici */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {getUserInitials()}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role.toLowerCase().replace('_', ' ')}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                                    >
                                        {/* Profile Info */}
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {getUserInitials()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                                </div>
                                            </div>
                                            {!user?.isProfileComplete && (
                                                <div className="mt-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
                                                    ⚠️ Profile incomplete
                                                </div>
                                            )}
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <button
                                                onClick={() => {
                                                    navigate('/profile');
                                                    setShowProfileMenu(false);
                                                }}
                                                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">My Profile</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    navigate('/settings');
                                                    setShowProfileMenu(false);
                                                }}
                                                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
                                            </button>
                                        </div>

                                        {/* Sign Out */}
                                        <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span className="text-sm font-medium">Sign Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};