import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Apple,
    Dumbbell,
    ClipboardList,
    Calendar,
    HelpCircle,
    Info,
    ChevronLeft,
    ChevronRight,
    Pill  // Changed from Building2 to Pill icon for medicines
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: string;
}

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [, setDarkMode] = useState(false);

    // Vérifier le dark mode au chargement
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        const isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;
        setDarkMode(isDarkMode);
    }, []);

    const menuItems: MenuItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            path: '/dashboard'
        },
        {
            id: 'nutrition',
            label: 'Nutrition',
            icon: <Apple className="w-5 h-5" />,
            path: '/nutrition'
        },
        {
            id: 'exercise',
            label: 'Exercise',
            icon: <Dumbbell className="w-5 h-5" />,
            path: '/exercise'
        },
        {
            id: 'tracking',
            label: 'Daily Habits',
            icon: <ClipboardList className="w-5 h-5" />,
            path: '/tracking'
        },
        {
            id: 'pharmacy',
            label: 'Search Medicaments',
            icon: <Pill className="w-5 h-5" />,
            path: '/pharmacy-search'
        },
        {
            id: 'appointments',
            label: 'Appointments',
            icon: <Calendar className="w-5 h-5" />,
            path: '/appointments',
            badge: '2'
        }
    ];

    const bottomMenuItems: MenuItem[] = [
        {
            id: 'help',
            label: 'Help & Support',
            icon: <HelpCircle className="w-5 h-5" />,
            path: '/help'
        },
        {
            id: 'about',
            label: 'About',
            icon: <Info className="w-5 h-5" />,
            path: '/about'
        }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 flex flex-col shadow-sm transition-colors duration-300`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all z-50 shadow-md"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                )}
            </button>

            {/* Main Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-3">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span className={isActive(item.path)
                                ? 'text-white'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'
                            }>
                                {item.icon}
                            </span>

                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex items-center justify-between flex-1"
                                    >
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {item.badge && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive(item.path)
                                                ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400'
                                                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                            }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isCollapsed && item.badge && (
                                <span className="absolute right-2 top-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Bottom Menu */}
            <div className="border-t border-gray-200 dark:border-gray-700 py-4 px-3">
                <nav className="space-y-1">
                    {bottomMenuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {item.icon}
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="font-medium text-sm"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </nav>
            </div>
        </motion.aside>
    );
};