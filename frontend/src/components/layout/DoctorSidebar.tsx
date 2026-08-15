import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    MessageCircle,
    HelpCircle,
    Info
} from 'lucide-react';

export const DoctorSidebar: React.FC = () => {
    const doctorNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/patients', label: 'My Patients', icon: <Users className="w-5 h-5" /> },
        { path: '/appointments', label: 'Appointments', icon: <Calendar className="w-5 h-5" /> },
        { path: '/chat', label: 'Chat with Patients', icon: <MessageCircle className="w-5 h-5" /> },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-primary-600">HealthGuardian</h1>
                <p className="text-sm text-gray-600">Doctor Portal</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {doctorNavItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Action Buttons - Sans profil et sans logout */}
            <div className="p-4 border-t border-gray-200 space-y-2">
                <NavLink
                    to="/help"
                    className={({ isActive }) =>
                        `flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                            isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Help</span>
                </NavLink>

                <NavLink
                    to="/about"
                    className={({ isActive }) =>
                        `flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                            isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`
                    }
                >
                    <Info className="w-5 h-5" />
                    <span className="font-medium">About</span>
                </NavLink>
            </div>
        </div>
    );
};