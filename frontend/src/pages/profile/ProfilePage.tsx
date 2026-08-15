import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { userAPI } from '@/api/user.api';
import toast from 'react-hot-toast';
import {
    User,
    Mail,
    Calendar,
    Activity,
    MapPin,
    Phone,
    Edit,
    Shield
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.email) {
                try {
                    const profileData = await userAPI.getProfile(user.email);
                    setUser(profileData);
                } catch (error) {
                    toast.error('Failed to load profile');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchProfile();
    }, []);

    const handleChangePassword = () => {
        // Rediriger vers la page de forgot-password pour réinitialiser le mot de passe
        navigate('/forgot-password');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    const InfoCard: React.FC<{
        icon: React.ReactNode;
        label: string;
        value?: string | number;
        isEmpty?: boolean;
    }> = ({ icon, label, value, isEmpty }) => (
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-600">{label}</p>
                <p className={`font-medium ${isEmpty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                    {value || 'Not provided'}
                </p>
            </div>
        </div>
    );

    return (
        <>
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-card p-8 mb-6"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {user?.firstName[0]}{user?.lastName[0]}
                            </div>

                            {/* Info */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </h1>
                                <p className="text-gray-600 mt-1">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                    {user?.role.toLowerCase()}
                  </span>
                                    {user?.isActive && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <Button
                            variant="primary"
                            leftIcon={<Edit className="w-4 h-4" />}
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            Edit Profile
                        </Button>
                    </div>

                    {/* Profile Completion */}
                    {!user?.isProfileComplete && (
                        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Your profile is incomplete. Complete your health information to get personalized recommendations.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Personal Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-card p-6 mb-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" />
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            icon={<Mail className="w-5 h-5 text-gray-500" />}
                            label="Email Address"
                            value={user?.email}
                        />
                        <InfoCard
                            icon={<Phone className="w-5 h-5 text-gray-500" />}
                            label="Phone Number"
                            value={user?.phoneNumber}
                            isEmpty={!user?.phoneNumber}
                        />
                        <InfoCard
                            icon={<MapPin className="w-5 h-5 text-gray-500" />}
                            label="Address"
                            value={user?.address}
                            isEmpty={!user?.address}
                        />
                        <InfoCard
                            icon={<Calendar className="w-5 h-5 text-gray-500" />}
                            label="Member Since"
                            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'N/A'}
                        />
                    </div>
                </motion.div>

                {/* Health Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-card p-6 mb-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-secondary-500" />
                        Health Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoCard
                            icon={<Calendar className="w-5 h-5 text-gray-500" />}
                            label="Age"
                            value={user?.age ? `${user.age} years` : undefined}
                            isEmpty={!user?.age}
                        />
                        <InfoCard
                            icon={<Activity className="w-5 h-5 text-gray-500" />}
                            label="Weight"
                            value={user?.weight ? `${user.weight} kg` : undefined}
                            isEmpty={!user?.weight}
                        />
                        <InfoCard
                            icon={<Activity className="w-5 h-5 text-gray-500" />}
                            label="Height"
                            value={user?.height ? `${user.height} m` : undefined}
                            isEmpty={!user?.height}
                        />
                    </div>

                    {/* BMI Card */}
                    {user?.bmi && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Body Mass Index (BMI)</p>
                                    <p className="text-3xl font-bold text-primary-600 mt-1">{user.bmi.toFixed(1)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {user.bmi < 18.5 ? 'Underweight' :
                                            user.bmi < 25 ? 'Normal' :
                                                user.bmi < 30 ? 'Overweight' : 'Obese'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Medical History */}
                    {user?.medicalHistory && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Medical History</p>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{user.medicalHistory}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Account Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-card p-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        Account Security
                    </h2>
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={handleChangePassword}
                        >
                            Change Password
                        </Button>
                        <Button variant="outline" fullWidth>
                            Enable Two-Factor Authentication
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </>
    );
};