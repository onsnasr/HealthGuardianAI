import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useClickOutside } from '@/hooks/useClickOutside';
import {
    LayoutDashboard,
    Users,
    Calendar,
    MessageCircle,
    HelpCircle,
    Info,
    LogOut,
    User,
    Settings
} from 'lucide-react';

interface DoctorLayoutProps {
    children: React.ReactNode;
}

export const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => {
        setIsProfileDropdownOpen(false);
    });

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Patients', href: '/patients', icon: Users },
        { name: 'My Availability', href: '/availability', icon: Calendar },
        { name: 'Appointments', href: '/appointments', icon: Calendar },
        { name: 'Messages', href: '/chat', icon: MessageCircle },
    ];

    const bottomNavigation = [
        { name: 'Help', href: '/help', icon: HelpCircle },
        { name: 'About', href: '/about', icon: Info },
    ];

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-colors duration-300">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">HG</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">HealthGuardian</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Doctor Portal</p>
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom Navigation (Help & About) */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    {bottomNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                    isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Dr. {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                </div>
                            </button>

                            {/* Profile Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Dr. {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            navigate('/profile');
                                            setIsProfileDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>My Profile</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigate('/settings');
                                            setIsProfileDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </button>

                                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
};