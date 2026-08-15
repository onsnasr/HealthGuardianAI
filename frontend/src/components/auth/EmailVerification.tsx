import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface EmailVerificationProps {
    children: React.ReactNode;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuthStore();

    // Si l'utilisateur n'est pas authentifié, rediriger vers login
    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // Si l'utilisateur est authentifié mais n'a pas vérifié son email
    // Rediriger vers la page de vérification d'email
    if (user && !user.isActive) {
        return <Navigate to="/verify-email-pending" replace />;
    }

    // Si l'utilisateur est authentifié ET vérifié, afficher le contenu
    return <>{children}</>;
};

export default EmailVerification;