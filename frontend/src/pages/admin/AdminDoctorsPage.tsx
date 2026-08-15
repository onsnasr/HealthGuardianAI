import React, { useState, useEffect } from 'react';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';
import {
    Stethoscope,
    Plus,
    Search,
    X,
    Award,
    DollarSign,
    Phone,
    MapPin,
    Eye,
    Mail,
    Calendar,
    Briefcase, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Doctor {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    specialty?: string;
    licenseNumber?: string;
    consultationFee?: number;
    yearsOfExperience?: number;
    phoneNumber?: string;
    address?: string;
    isActive: boolean;
    createdAt?: string;
}

export const AdminDoctorsPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        specialty: '',
        licenseNumber: '',
        phoneNumber: '',
        clinicAddress: ''
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        filterDoctors();
    }, [searchQuery, doctors]);

    const fetchDoctors = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/doctors');
            setDoctors(response.data);
        } catch (error) {
            toast.error('Failed to load doctors');
        } finally {
            setIsLoading(false);
        }
    };

    const filterDoctors = () => {
        if (searchQuery) {
            const filtered = doctors.filter(doctor =>
                doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doctor.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredDoctors(filtered);
        } else {
            setFilteredDoctors(doctors);
        }
    };

    const handleCreateDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/admin/doctors', formData);
            toast.success('Doctor created successfully!');
            setShowCreateModal(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                specialty: '',
                licenseNumber: '',
                phoneNumber: '',
                clinicAddress: ''
            });
            fetchDoctors();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create doctor');
        }
    };

    const handleDeleteDoctor = async (doctorId: number) => {
        if (window.confirm('Are you sure you want to permanently delete this doctor?')) {
            try {
                // Correct endpoint matching the backend controller
                await apiClient.delete(`/doctors/admin/${doctorId}`);
                toast.success('Doctor deleted successfully!');
                fetchDoctors();
            } catch (error: any) {
                console.error('Delete error:', error);
                console.error('Error response:', error.response?.data);
                toast.error(error.response?.data?.message || 'Failed to delete doctor');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Management</h1>
                    <p className="text-gray-600">Manage healthcare professionals</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Doctor
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <p className="text-sm text-gray-600">Total Doctors</p>
                    <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-green-700">Active Doctors</p>
                    <p className="text-2xl font-bold text-green-900">
                        {doctors.filter(d => d.isActive).length}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-blue-700">Specialties</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {new Set(doctors.map(d => d.specialty).filter(Boolean)).size}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search doctors by name, specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                        <motion.div
                            key={doctor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                    {doctor.firstName[0]}{doctor.lastName[0]}
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        doctor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {doctor.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <button
                                        onClick={() => setSelectedDoctor(doctor)}
                                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="View details"
                                    >
                                        <Eye className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDoctor(doctor.id)}
                                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Delete doctor"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Dr. {doctor.firstName} {doctor.lastName}
                            </h3>

                            {doctor.specialty && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Stethoscope className="w-4 h-4" />
                                    {doctor.specialty}
                                </div>
                            )}

                            {doctor.licenseNumber && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Award className="w-4 h-4" />
                                    {doctor.licenseNumber}
                                </div>
                            )}

                            {doctor.consultationFee && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    {doctor.consultationFee} TND
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">{doctor.email}</p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-12">
                        <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No doctors found</p>
                    </div>
                )}
            </div>

            {/* Create Doctor Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-900">Create Doctor Account</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="Min. 8 characters"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.specialty}
                                                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                placeholder="Cardiology"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.licenseNumber}
                                                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                placeholder="TN-DOC-12345"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="+216 20 123 456"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                                        <textarea
                                            rows={2}
                                            value={formData.clinicAddress}
                                            onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                            placeholder="123 Medical Center, Tunis"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Create Doctor
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Doctor Details Modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDoctor(null)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                                    <h2 className="text-2xl font-bold text-gray-900">Doctor Details</h2>
                                    <button
                                        onClick={() => setSelectedDoctor(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Avatar and Status */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {selectedDoctor.firstName[0]}{selectedDoctor.lastName[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">
                                                Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                                            </h3>
                                            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full mt-2 ${
                                                selectedDoctor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {selectedDoctor.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Email</p>
                                                    <p className="font-medium text-gray-900">{selectedDoctor.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedDoctor.phoneNumber && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Phone Number</p>
                                                        <p className="font-medium text-gray-900">{selectedDoctor.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.specialty && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <Stethoscope className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Specialty</p>
                                                        <p className="font-medium text-gray-900">{selectedDoctor.specialty}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.licenseNumber && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <Award className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">License Number</p>
                                                        <p className="font-medium text-gray-900">{selectedDoctor.licenseNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.consultationFee && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Consultation Fee</p>
                                                        <p className="font-medium text-gray-900">{selectedDoctor.consultationFee} TND</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.yearsOfExperience && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <Briefcase className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Years of Experience</p>
                                                        <p className="font-medium text-gray-900">{selectedDoctor.yearsOfExperience} years</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.address && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Clinic Address</p>
                                                        <p className="font-medium text-gray-900">{selectedDoctor.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedDoctor.createdAt && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Member Since</p>
                                                        <p className="font-medium text-gray-900">
                                                            {new Date(selectedDoctor.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setSelectedDoctor(null)}
                                        className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};