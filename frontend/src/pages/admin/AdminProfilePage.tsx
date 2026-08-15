import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Calendar,
    Shield,
    Edit,
    Save,
    X,
    Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/common/Button';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';

// Déplacer InfoCard EN DEHORS du composant principal
const InfoCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string;
    editable?: boolean;
    field?: string;
    isEditing: boolean;
    formData: any;
    onFormChange: (field: string, value: string) => void;
}> = ({ icon, label, value, editable, field, isEditing, formData, onFormChange }) => (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
        <div className="p-2 bg-white rounded-lg shadow-sm">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-sm text-gray-600">{label}</p>
            {isEditing && editable && field ? (
                <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => onFormChange(field, e.target.value)}
                    className="mt-1 w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
            ) : (
                <p className="font-medium text-gray-900">{value || 'Not provided'}</p>
            )}
        </div>
    </div>
);

export const AdminProfilePage: React.FC = () => {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phoneNumber: user?.phoneNumber || '',
        department: (user as any)?.department || ''
    });

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            await apiClient.put(`/admin/profile/${user?.id}`, formData);

            if (user) {
                setUser({
                    ...user,
                    ...formData
                });
            }

            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            phoneNumber: user?.phoneNumber || '',
            department: (user as any)?.department || ''
        });
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-6 text-white"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {user?.firstName[0]}{user?.lastName[0]}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-1">
                                    {user?.firstName} {user?.lastName}
                                </h1>
                                <p className="text-purple-100">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                        System Administrator
                                    </span>
                                    <span className="px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isEditing ? (
                            <Button
                                variant="primary"
                                onClick={() => setIsEditing(true)}
                                leftIcon={<Edit className="w-4 h-4" />}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-0"
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    leftIcon={<X className="w-4 h-4" />}
                                    className="bg-red-500 hover:bg-red-600 text-white border-0"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    leftIcon={<Save className="w-4 h-4" />}
                                    className="bg-green-500 hover:bg-green-600 text-white border-0"
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Personal Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-500" />
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            icon={<User className="w-5 h-5 text-gray-500" />}
                            label="First Name"
                            value={formData.firstName}
                            editable
                            field="firstName"
                            isEditing={isEditing}
                            formData={formData}
                            onFormChange={handleFormChange}
                        />
                        <InfoCard
                            icon={<User className="w-5 h-5 text-gray-500" />}
                            label="Last Name"
                            value={formData.lastName}
                            editable
                            field="lastName"
                            isEditing={isEditing}
                            formData={formData}
                            onFormChange={handleFormChange}
                        />
                        <InfoCard
                            icon={<Mail className="w-5 h-5 text-gray-500" />}
                            label="Email Address"
                            value={user?.email}
                            isEditing={isEditing}
                            formData={formData}
                            onFormChange={handleFormChange}
                        />
                        <InfoCard
                            icon={<Calendar className="w-5 h-5 text-gray-500" />}
                            label="Member Since"
                            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) : 'N/A'}
                            isEditing={isEditing}
                            formData={formData}
                            onFormChange={handleFormChange}
                        />
                    </div>
                </motion.div>

                {/* Admin Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        Administrator Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            icon={<Building className="w-5 h-5 text-gray-500" />}
                            label="Department"
                            value={formData.department}
                            editable
                            field="department"
                            isEditing={isEditing}
                            formData={formData}
                            onFormChange={handleFormChange}
                        />
                        <InfoCard
                            icon={<Shield className="w-5 h-5 text-gray-500" />}
                            label="Access Level"
                            value={(user as any)?.accessLevel === 2 ? 'Super Admin' : 'Standard Admin'}
                            isEditing={isEditing}
                            formData={formData}
                            onFormChange={handleFormChange}
                        />
                    </div>

                    {/* Permissions */}
                    <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                        <h3 className="font-semibold text-gray-900 mb-3">Permissions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Manage Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Manage Roles</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Manage Doctors</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Manage Pharmacies</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Account Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        Account Security
                    </h2>
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={() => navigate('/forgot-password')}
                        >
                            Change Password
                        </Button>
                        <Button variant="outline" fullWidth>
                            Enable Two-Factor Authentication
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};