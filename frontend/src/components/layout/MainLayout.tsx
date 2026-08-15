import React, { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FloatingChatbot } from '@/components/chat/FloatingChatbot';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    // Vérifier le dark mode au chargement
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        const isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                    {children}
                </main>
            </div>

            {/* Floating Chatbot */}
            <FloatingChatbot />
        </div>
    );
};