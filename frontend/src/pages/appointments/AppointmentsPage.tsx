import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
    Calendar,
    Clock,
    Search,
    Phone,
    Mail,
    Stethoscope,
    Plus,
    X,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:8081/api';

// Types
interface Appointment {
    id: number;
    patientId: number;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    doctorId: number;
    doctorName: string;
    doctorSpecialty: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
    reason?: string;
    notes?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt?: string;
}

interface Doctor {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    specialty: string;
    consultationFee: number;
    yearsOfExperience: number;
    bio: string;
    isAvailable: boolean;
}

interface TimeSlot {
    time: string;
    isAvailable: boolean;
    displayTime: string;
}

export const AppointmentsPage: React.FC = () => {
    useAuthStore();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

    // New appointment form
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Doctor[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);
    const [selectedTime, setSelectedTime] = useState('');
    const [appointmentType, setAppointmentType] = useState('Consultation');
    const [reason, setReason] = useState('');

    // Fetch appointments
    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login to view appointments');
                return;
            }

            // Vérifier le rôle de l'utilisateur
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                console.log('👤 User role:', user.role);

                // Vérifier si l'utilisateur a le bon rôle
                if (user.role !== 'SIMPLE_USER') {
                    toast.error('Only patients can view their appointments');
                    setAppointments([]);
                    return;
                }
            }

            console.log('🔍 Fetching appointments...');
            const response = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Appointments received:', response.data);
            setAppointments(response.data);
        } catch (error: any) {
            console.error('❌ Error fetching appointments:', error);

            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);

                if (error.response.status === 401) {
                    toast.error('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/signin';
                } else if (error.response.status === 403) {
                    if (error.response.data?.error === 'EMAIL_NOT_VERIFIED') {
                        toast.error('Please verify your email first');
                        window.location.href = '/verify-email-pending';
                    } else {
                        toast.error('Access denied. You do not have permission to view appointments.');
                    }
                } else if (error.response.status === 500) {
                    toast.error('Server error. Please try again later.');
                } else {
                    toast.error(error.response?.data?.message || 'Failed to fetch appointments');
                }
            } else if (error.request) {
                console.error('No response received:', error.request);
                toast.error('Cannot connect to server. Please check your connection.');
            } else {
                console.error('Error:', error.message);
                toast.error('An unexpected error occurred');
            }

            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Search doctors
    const searchDoctors = async () => {
        if (!searchQuery.trim()) {
            toast.error('Please enter a search term');
            return;
        }

        try {
            setIsSearching(true);
            console.log('🔍 Searching doctors with query:', searchQuery);

            // La recherche de docteurs est publique, pas besoin de token
            const response = await axios.get(
                `${API_BASE_URL}/appointments/search-doctors?query=${encodeURIComponent(searchQuery)}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Search results:', response.data);

            if (response.data.length === 0) {
                toast.error('No doctors found matching your search');
            } else {
                toast.success(`Found ${response.data.length} doctor(s)`);
            }

            setSearchResults(response.data);
        } catch (error: any) {
            console.error('❌ Error searching doctors:', error);

            if (error.response) {
                console.error('Error status:', error.response.status);
                toast.error(error.response?.data?.message || 'Failed to search doctors');
            } else {
                toast.error('Cannot connect to server');
            }
        } finally {
            setIsSearching(false);
        }
    };

    // Fetch available slots
    const fetchAvailableSlots = async (doctorId: number, date: string) => {
        try {
            setIsFetchingSlots(true);
            console.log('🔍 Fetching slots for doctor:', doctorId, 'date:', date);

            // Les créneaux disponibles sont publics
            const response = await axios.get(
                `${API_BASE_URL}/appointments/available-slots/${doctorId}?date=${date}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Available slots:', response.data);

            if (response.data.length === 0) {
                toast.error('No available slots for this date');
            }

            setAvailableSlots(response.data);
        } catch (error: any) {
            console.error('❌ Error fetching slots:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch available slots');
        } finally {
            setIsFetchingSlots(false);
        }
    };

    // REMPLACER LA FONCTION createAppointment dans AppointmentsPage.tsx

    const createAppointment = async () => {
        // Validation détaillée
        if (!selectedDoctor) {
            toast.error('Please select a doctor');
            return;
        }

        if (!appointmentDate) {
            toast.error('Please select an appointment date');
            return;
        }

        if (!selectedTime) {
            toast.error('Please select a time slot');
            return;
        }

        if (!appointmentType || appointmentType.trim() === '') {
            toast.error('Please select an appointment type');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login to create an appointment');
                return;
            }

            // Formatter le temps correctement (HH:mm:ss)
            const formattedTime = selectedTime.length === 5
                ? `${selectedTime}:00` // Ajouter les secondes si manquantes
                : selectedTime;

            const appointmentData = {
                doctorId: selectedDoctor.id,
                appointmentDate: appointmentDate, // Format: YYYY-MM-DD
                appointmentTime: formattedTime,   // Format: HH:mm:ss
                appointmentType: appointmentType.trim(),
                reason: reason.trim() || null  // Null si vide
            };

            console.log('📅 Creating appointment with data:', appointmentData);
            console.log('🔑 Token present:', !!token);

            const response = await axios.post(
                `${API_BASE_URL}/appointments`,
                appointmentData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ Appointment created successfully:', response.data);
            toast.success('Appointment created successfully!');

            setShowNewAppointmentModal(false);
            resetForm();
            fetchAppointments();

        } catch (error: any) {
            console.error('❌ Error creating appointment:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.response?.status === 403 && error.response.data?.error === 'EMAIL_NOT_VERIFIED') {
                toast.error('Please verify your email first');
                window.location.href = '/verify-email-pending';
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 400) {
                toast.error('Invalid appointment data. Please check all fields.');
            } else if (error.response?.status === 500) {
                toast.error('Server error. Please contact support.');
            } else {
                toast.error('Failed to create appointment. Please try again.');
            }
        }
    };

    // Cancel appointment
    const cancelAppointment = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login to cancel appointment');
                return;
            }

            await axios.put(
                `${API_BASE_URL}/appointments/${id}/cancel`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Appointment cancelled');
            fetchAppointments();
        } catch (error: any) {
            console.error('❌ Error cancelling appointment:', error);

            if (error.response?.status === 403 && error.response.data?.error === 'EMAIL_NOT_VERIFIED') {
                toast.error('Please verify your email first');
                window.location.href = '/verify-email-pending';
            } else {
                toast.error(error.response?.data?.message || 'Failed to cancel appointment');
            }
        }
    };

    const resetForm = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedDoctor(null);
        setAppointmentDate('');
        setAvailableSlots([]);
        setSelectedTime('');
        setAppointmentType('Consultation');
        setReason('');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return <CheckCircle className="w-5 h-5" />;
            case 'REJECTED': return <XCircle className="w-5 h-5" />;
            case 'PENDING': return <AlertCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                    <p className="text-gray-600 mt-1">Book and manage your medical appointments</p>
                </div>
                <button
                    onClick={() => setShowNewAppointmentModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Appointment
                </button>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-2xl shadow-card p-6">
                {appointments.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                        <p className="text-gray-600 mb-6">Book your first appointment with a doctor</p>
                        <button
                            onClick={() => setShowNewAppointmentModal(true)}
                            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                        >
                            Book Appointment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Stethoscope className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{apt.doctorName}</h3>
                                            <p className="text-sm text-gray-600">{apt.doctorSpecialty}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                                        {getStatusIcon(apt.status)}
                                        <span className="text-sm font-medium">{apt.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <span>{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        <span>{apt.appointmentTime}</span>
                                    </div>
                                </div>

                                {apt.reason && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600"><strong>Reason:</strong> {apt.reason}</p>
                                    </div>
                                )}

                                {apt.rejectionReason && (
                                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm text-red-800"><strong>Rejection Reason:</strong> {apt.rejectionReason}</p>
                                    </div>
                                )}

                                {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                                    <button
                                        onClick={() => cancelAppointment(apt.id)}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        Cancel Appointment
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Appointment Modal */}
            <AnimatePresence>
                {showNewAppointmentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowNewAppointmentModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Book New Appointment</h2>
                                <button
                                    onClick={() => {
                                        setShowNewAppointmentModal(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Step 1: Search Doctor */}
                            {!selectedDoctor && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search Doctor by Name, Phone, or Email
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Enter doctor name, phone, or email..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && searchDoctors()}
                                                disabled={isSearching}
                                            />
                                            <button
                                                onClick={searchDoctors}
                                                disabled={isSearching}
                                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isSearching ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Searching...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search className="w-5 h-5" />
                                                        Search
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {searchResults.map((doctor) => (
                                                <div
                                                    key={doctor.id}
                                                    onClick={() => setSelectedDoctor(doctor)}
                                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                                                >
                                                    <h3 className="font-semibold text-gray-900">{doctor.fullName}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">{doctor.specialty}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-4 h-4" />
                                                            {doctor.phoneNumber || 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-4 h-4" />
                                                            {doctor.email}
                                                        </span>
                                                    </div>
                                                    {doctor.consultationFee && (
                                                        <p className="text-sm text-green-600 mt-2 font-medium">
                                                            Consultation Fee: {doctor.consultationFee} TND
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Select Date & Time */}
                            {selectedDoctor && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{selectedDoctor.fullName}</h3>
                                                <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                                                {selectedDoctor.consultationFee && (
                                                    <p className="text-sm text-green-600 mt-1 font-medium">
                                                        Fee: {selectedDoctor.consultationFee} TND
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedDoctor(null);
                                                    setSearchResults([]);
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                Change Doctor
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Appointment Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={appointmentDate}
                                            onChange={(e) => {
                                                setAppointmentDate(e.target.value);
                                                setSelectedTime('');
                                                if (e.target.value) {
                                                    fetchAvailableSlots(selectedDoctor.id, e.target.value);
                                                }
                                            }}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {isFetchingSlots && (
                                        <div className="text-center py-4">
                                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-sm text-gray-600">Loading available slots...</p>
                                        </div>
                                    )}

                                    {!isFetchingSlots && availableSlots.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Available Time Slots *
                                            </label>
                                            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                                                {availableSlots.map((slot) => (
                                                    <button
                                                        key={slot.time}
                                                        onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                                                        disabled={!slot.isAvailable}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            selectedTime === slot.time
                                                                ? 'bg-blue-500 text-white'
                                                                : slot.isAvailable
                                                                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                                                        }`}
                                                    >
                                                        {slot.displayTime}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!isFetchingSlots && appointmentDate && availableSlots.length === 0 && (
                                        <div className="text-center py-4 text-gray-500">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            <p>No available slots for this date. Please choose another date.</p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Appointment Type *
                                        </label>
                                        <select
                                            value={appointmentType}
                                            onChange={(e) => setAppointmentType(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Consultation">Consultation</option>
                                            <option value="Follow-up">Follow-up</option>
                                            <option value="Check-up">Check-up</option>
                                            <option value="Emergency">Emergency</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reason for Visit (Optional)
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Describe your symptoms or reason for visit..."
                                        />
                                    </div>

                                    <button
                                        onClick={createAppointment}
                                        disabled={!appointmentDate || !selectedTime}
                                        className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};