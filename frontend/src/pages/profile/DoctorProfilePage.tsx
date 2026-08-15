import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { DoctorProfileEditModal } from '@/components/profile/DoctorProfileEditModal';
import { userAPI } from '@/api/user.api';
import toast from 'react-hot-toast';
import {
    User,
    Mail,
    Calendar,
    MapPin,
    Phone,
    Edit,
    Shield,
    Stethoscope,
    Award,
    DollarSign,
    FileText,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { motion } from 'framer-motion';

export const DoctorProfilePage: React.FC = () => {
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
        navigate('/forgot-password');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-card p-8 mb-6"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {user?.firstName[0]}{user?.lastName[0]}
                            </div>

                            {/* Info */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Dr. {user?.firstName} {user?.lastName}
                                </h1>
                                <p className="text-gray-600 mt-1">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        Healthcare Professional
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
                                ⚠️ Your profile is incomplete. Complete your professional information to help patients find and trust you.
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
                        <User className="w-5 h-5 text-blue-500" />
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
                            label="Clinic Address"
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

                {/* Professional Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-card p-6 mb-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-cyan-500" />
                        Professional Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            icon={<Stethoscope className="w-5 h-5 text-gray-500" />}
                            label="Specialty"
                            value={(user as any)?.specialty}
                            isEmpty={!(user as any)?.specialty}
                        />
                        <InfoCard
                            icon={<FileText className="w-5 h-5 text-gray-500" />}
                            label="License Number"
                            value={(user as any)?.licenseNumber}
                            isEmpty={!(user as any)?.licenseNumber}
                        />
                        <InfoCard
                            icon={<DollarSign className="w-5 h-5 text-gray-500" />}
                            label="Consultation Fee"
                            value={(user as any)?.consultationFee ? `${(user as any).consultationFee} TND` : undefined}
                            isEmpty={!(user as any)?.consultationFee}
                        />
                        <InfoCard
                            icon={<Award className="w-5 h-5 text-gray-500" />}
                            label="Years of Experience"
                            value={(user as any)?.yearsOfExperience ? `${(user as any).yearsOfExperience} years` : undefined}
                            isEmpty={!(user as any)?.yearsOfExperience}
                        />
                    </div>

                    {/* Professional Bio */}
                    {(user as any)?.bio && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Professional Bio
                            </p>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700 leading-relaxed">{(user as any).bio}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Professional Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-card p-6 mb-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
                            <div className="text-sm text-gray-700">Total Patients</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                            <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                            <div className="text-sm text-gray-700">Appointments</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                            <div className="text-2xl font-bold text-purple-600 mb-1">5.0</div>
                            <div className="text-sm text-gray-700">Rating</div>
                        </div>
                    </div>
                </motion.div>

                {/* Account Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
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
            <DoctorProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </div>
    );
};