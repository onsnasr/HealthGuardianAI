import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                                  size = 'md',
                                                                  fullScreen = false,
                                                                  message,
                                                              }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin`} />
            {message && (
                <p className="text-sm text-gray-600 animate-pulse">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};