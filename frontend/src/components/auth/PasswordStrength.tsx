import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
    password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    const requirements = [
        { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
        { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
        { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
        { label: 'One number', test: (pwd: string) => /[0-9]/.test(pwd) },
        { label: 'One special character', test: (pwd: string) => /[@#$%^&+=!]/.test(pwd) },
    ];

    const passedRequirements = requirements.filter(req => req.test(password)).length;
    const strength = (passedRequirements / requirements.length) * 100;

    const getStrengthColor = () => {
        if (strength < 40) return 'bg-red-500';
        if (strength < 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (strength < 40) return 'Weak';
        if (strength < 80) return 'Medium';
        return 'Strong';
    };

    if (!password) return null;

    return (
        <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Password strength:</span>
                <span className={`font-medium ${
                    strength < 40 ? 'text-red-500' :
                        strength < 80 ? 'text-yellow-500' :
                            'text-green-500'
                }`}>
          {getStrengthText()}
        </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strength}%` }}
                />
            </div>

            <ul className="space-y-1">
                {requirements.map((req, index) => {
                    const passed = req.test(password);
                    return (
                        <li
                            key={index}
                            className={`flex items-center text-xs ${
                                passed ? 'text-green-600' : 'text-gray-400'
                            }`}
                        >
                            {passed ? (
                                <Check className="w-3 h-3 mr-1.5" />
                            ) : (
                                <X className="w-3 h-3 mr-1.5" />
                            )}
                            {req.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};