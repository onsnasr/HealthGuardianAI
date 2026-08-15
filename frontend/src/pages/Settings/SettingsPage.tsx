import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Moon,
    Sun,
    Bell,
    Globe,
    Save,
    Volume2,
    Eye,
    LucideIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SelectOption {
    value: string;
    label: string;
}

interface SettingItem {
    id: string;
    label: string;
    description: string;
    type: 'toggle' | 'select';
    value: boolean | string;
    onChange: (value: any) => void;
    icon: LucideIcon;
    options?: SelectOption[];
}

interface SettingSection {
    title: string;
    icon: LucideIcon;
    items: SettingItem[];
}

export const SettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(false);

    // Theme Settings
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    // General Settings
    const [settings, setSettings] = useState({
        // Appearance
        language: 'en',
        fontSize: 'medium',
        // Notifications
        soundEnabled: true
    });

    // Apply Dark Mode to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        toast.success(darkMode ? 'Light mode enabled' : 'Dark mode enabled');
    };

    const handleSaveSettings = async () => {
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save to localStorage
        localStorage.setItem('userSettings', JSON.stringify(settings));
        localStorage.setItem('fontSize', settings.fontSize);

        // Apply font size immediately
        const root = document.documentElement;
        root.classList.remove('text-small', 'text-medium', 'text-large');
        root.classList.add(`text-${settings.fontSize}`);

        toast.success('Settings saved successfully!');
        setLoading(false);
    };

    const settingSections: SettingSection[] = [
        {
            title: 'Appearance',
            icon: Sun,
            items: [
                {
                    id: 'darkMode',
                    label: 'Dark Mode',
                    description: 'Switch between light and dark theme',
                    type: 'toggle',
                    value: darkMode,
                    onChange: toggleDarkMode,
                    icon: darkMode ? Moon : Sun
                },
                {
                    id: 'language',
                    label: 'Language',
                    description: 'Choose your preferred language',
                    type: 'select',
                    value: settings.language,
                    onChange: (value: string) => setSettings({ ...settings, language: value }),
                    options: [
                        { value: 'en', label: 'English' },
                        { value: 'fr', label: 'Français' },
                        { value: 'es', label: 'Español' },
                        { value: 'ar', label: 'العربية' }
                    ],
                    icon: Globe
                },
                {
                    id: 'fontSize',
                    label: 'Font Size',
                    description: 'Adjust text size for better readability',
                    type: 'select',
                    value: settings.fontSize,
                    onChange: (value: string) => setSettings({ ...settings, fontSize: value }),
                    options: [
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' }
                    ],
                    icon: Eye
                }
            ]
        },
        {
            title: 'Notifications',
            icon: Bell,
            items: [
                {
                    id: 'soundEnabled',
                    label: 'Sound Notifications',
                    description: 'Play sound for notifications',
                    type: 'toggle',
                    value: settings.soundEnabled,
                    onChange: (value: boolean) => setSettings({ ...settings, soundEnabled: value }),
                    icon: Volume2
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your preferences and account settings
                    </p>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {settingSections.map((section, index) => {
                        const SectionIcon = section.icon;
                        return (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                {/* Section Header */}
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <SectionIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {section.title}
                                        </h2>
                                    </div>
                                </div>

                                {/* Section Items */}
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {section.items.map((item) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div key={item.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                                            <ItemIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {item.label}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Control */}
                                                    <div className="flex-shrink-0">
                                                        {item.type === 'toggle' && (
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.value as boolean}
                                                                    onChange={(e) => item.onChange(e.target.checked)}
                                                                    className="sr-only peer"
                                                                />
                                                                <div className="w-14 h-7 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                                                            </label>
                                                        )}

                                                        {item.type === 'select' && (
                                                            <select
                                                                value={item.value as string}
                                                                onChange={(e) => item.onChange(e.target.value)}
                                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[180px]"
                                                            >
                                                                {item.options?.map((option) => (
                                                                    <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 flex justify-end"
                >
                    <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};