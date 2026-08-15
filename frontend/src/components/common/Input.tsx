import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, leftIcon, rightIcon, type, className, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPasswordType = type === 'password';
        const inputType = isPasswordType && showPassword ? 'text' : type;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={inputType}
                        className={clsx(
                            'w-full px-4 py-2.5 border rounded-lg transition-all duration-200',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                            'placeholder:text-gray-400',
                            leftIcon && 'pl-10',
                            (rightIcon || isPasswordType) && 'pr-10',
                            error
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 hover:border-gray-400',
                            className
                        )}
                        {...props}
                    />

                    {isPasswordType && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    )}

                    {rightIcon && !isPasswordType && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-1.5 text-sm text-red-500 animate-shake">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';