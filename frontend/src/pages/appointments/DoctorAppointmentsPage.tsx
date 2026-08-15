import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:8081/api';

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

export const DoctorAppointmentsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'all'>('pending');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'confirm' | 'reject' | 'complete' | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [completionNotes, setCompletionNotes] = useState('');

    // Fetch appointments on mount and when tab changes
    useEffect(() => {
        fetchAppointments();
    }, []);

    // Filter appointments when data or tab changes
    useEffect(() => {
        filterAppointments();
    }, [appointments, activeTab]);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login to view appointments');
                return;
            }

            console.log('🔍 Fetching doctor appointments...');

            // Récupérer TOUS les rendez-vous du docteur
            const response = await axios.get(`${API_BASE_URL}/appointments/doctor/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Appointments received:', response.data);
            setAppointments(response.data);

        } catch (error: any) {
            console.error('❌ Error fetching appointments:', error);

            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/signin';
            } else if (error.response?.status === 403) {
                if (error.response.data?.error === 'EMAIL_NOT_VERIFIED') {
                    toast.error('Please verify your email first');
                    window.location.href = '/verify-email-pending';
                } else {
                    toast.error('You do not have permission to view these appointments');
                }
            } else {
                toast.error('Failed to fetch appointments');
            }
            setAppointments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAppointments = () => {
        let filtered = [...appointments];

        switch (activeTab) {
            case 'pending':
                filtered = appointments.filter(apt => apt.status === 'PENDING');
                break;
            case 'confirmed':
                filtered = appointments.filter(apt => apt.status === 'CONFIRMED');
                break;
            case 'completed':
                filtered = appointments.filter(apt => apt.status === 'COMPLETED');
                break;
            case 'all':
                // Tous les rendez-vous
                break;
        }

        // Trier par date (plus récent en premier)
        filtered.sort((a, b) => {
            const dateA = new Date(a.appointmentDate + ' ' + a.appointmentTime);
            const dateB = new Date(b.appointmentDate + ' ' + b.appointmentTime);
            return dateB.getTime() - dateA.getTime();
        });

        setFilteredAppointments(filtered);
    };

    const handleConfirm = async () => {
        if (!selectedAppointment) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/appointments/${selectedAppointment.id}/confirm`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Appointment confirmed!');
            setShowActionModal(false);
            setSelectedAppointment(null);
            fetchAppointments(); // Rafraîchir la liste
        } catch (error: any) {
            console.error('❌ Error confirming appointment:', error);
            if (error.response?.status === 403 && error.response.data?.error === 'EMAIL_NOT_VERIFIED') {
                toast.error('Please verify your email first');
                window.location.href = '/verify-email-pending';
            } else {
                toast.error(error.response?.data?.message || 'Failed to confirm appointment');
            }
        }
    };

    const handleReject = async () => {
        if (!selectedAppointment || !rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/appointments/${selectedAppointment.id}/reject`,
                { reason: rejectionReason },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Appointment rejected');
            setShowActionModal(false);
            setSelectedAppointment(null);
            setRejectionReason('');
            fetchAppointments(); // Rafraîchir la liste
        } catch (error: any) {
            console.error('❌ Error rejecting appointment:', error);
            if (error.response?.status === 403 && error.response.data?.error === 'EMAIL_NOT_VERIFIED') {
                toast.error('Please verify your email first');
                window.location.href = '/verify-email-pending';
            } else {
                toast.error(error.response?.data?.message || 'Failed to reject appointment');
            }
        }
    };

    const handleComplete = async () => {
        if (!selectedAppointment) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/appointments/${selectedAppointment.id}/complete`,
                { notes: completionNotes },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Appointment marked as completed!');
            setShowActionModal(false);
            setSelectedAppointment(null);
            setCompletionNotes('');
            fetchAppointments(); // Rafraîchir la liste
        } catch (error: any) {
            console.error('❌ Error completing appointment:', error);
            if (error.response?.status === 403 && error.response.data?.error === 'EMAIL_NOT_VERIFIED') {
                toast.error('Please verify your email first');
                window.location.href = '/verify-email-pending';
            } else {
                toast.error(error.response?.data?.message || 'Failed to complete appointment');
            }
        }
    };

    const openActionModal = (appointment: Appointment, action: 'confirm' | 'reject' | 'complete') => {
        setSelectedAppointment(appointment);
        setActionType(action);
        setShowActionModal(true);
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
            case 'COMPLETED': return <CheckCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        // timeString est au format "HH:mm:ss"
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-gray-600 mt-1">Manage your patient appointments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Pending</p>
                            <p className="text-2xl font-bold text-yellow-700">
                                {appointments.filter(a => a.status === 'PENDING').length}
                            </p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Confirmed</p>
                            <p className="text-2xl font-bold text-green-700">
                                {appointments.filter(a => a.status === 'CONFIRMED').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {appointments.filter(a => a.status === 'COMPLETED').length}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total</p>
                            <p className="text-2xl font-bold text-gray-700">
                                {appointments.length}
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 text-gray-600" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-card mb-6">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {[
                        { id: 'pending', label: 'Pending', icon: <AlertCircle className="w-5 h-5" />, count: appointments.filter(a => a.status === 'PENDING').length },
                        { id: 'confirmed', label: 'Confirmed', icon: <CheckCircle className="w-5 h-5" />, count: appointments.filter(a => a.status === 'CONFIRMED').length },
                        { id: 'completed', label: 'Completed', icon: <Clock className="w-5 h-5" />, count: appointments.filter(a => a.status === 'COMPLETED').length },
                        { id: 'all', label: 'All', icon: <Calendar className="w-5 h-5" />, count: appointments.length },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                activeTab === tab.id
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Appointments List */}
                <div className="p-6">
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments</h3>
                            <p className="text-gray-600">
                                {activeTab === 'all'
                                    ? "You don't have any appointments yet"
                                    : `You don't have any ${activeTab} appointments`
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAppointments.map((apt) => (
                                <div key={apt.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{apt.patientName}</h3>
                                                <p className="text-sm text-gray-600">{apt.appointmentType}</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                                            {getStatusIcon(apt.status)}
                                            <span className="text-sm font-medium">{apt.status}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                            <span>{formatDate(apt.appointmentDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock className="w-5 h-5 text-gray-400" />
                                            <span>{formatTime(apt.appointmentTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <span>{apt.patientPhone}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span>{apt.patientEmail}</span>
                                    </div>

                                    {apt.reason && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Reason for Visit:</p>
                                                    <p className="text-sm text-gray-600">{apt.reason}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {apt.notes && (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-900 mb-1">Consultation Notes:</p>
                                                    <p className="text-sm text-blue-700">{apt.notes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {apt.rejectionReason && (
                                        <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                            <div className="flex items-start gap-2">
                                                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                                                    <p className="text-sm text-red-700">{apt.rejectionReason}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {apt.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => openActionModal(apt, 'confirm')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => openActionModal(apt, 'reject')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {apt.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => openActionModal(apt, 'complete')}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Modal */}
            <AnimatePresence>
                {showActionModal && selectedAppointment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowActionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {actionType === 'confirm' && 'Confirm Appointment'}
                                {actionType === 'reject' && 'Reject Appointment'}
                                {actionType === 'complete' && 'Complete Appointment'}
                            </h2>

                            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
                                <p className="text-gray-700"><strong>Patient:</strong> {selectedAppointment.patientName}</p>
                                <p className="text-gray-700"><strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}</p>
                                <p className="text-gray-700"><strong>Time:</strong> {formatTime(selectedAppointment.appointmentTime)}</p>
                                <p className="text-gray-700"><strong>Type:</strong> {selectedAppointment.appointmentType}</p>
                            </div>

                            {actionType === 'reject' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason for Rejection *
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Please provide a reason..."
                                    />
                                </div>
                            )}

                            {actionType === 'complete' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Consultation Notes (Optional)
                                    </label>
                                    <textarea
                                        value={completionNotes}
                                        onChange={(e) => setCompletionNotes(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Add any notes from the consultation..."
                                    />
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowActionModal(false);
                                        setRejectionReason('');
                                        setCompletionNotes('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (actionType === 'confirm') handleConfirm();
                                        else if (actionType === 'reject') handleReject();
                                        else if (actionType === 'complete') handleComplete();
                                    }}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                                        actionType === 'confirm' ? 'bg-green-500 hover:bg-green-600' :
                                            actionType === 'reject' ? 'bg-red-500 hover:bg-red-600' :
                                                'bg-blue-500 hover:bg-blue-600'
                                    }`}
                                >
                                    {actionType === 'confirm' && 'Confirm'}
                                    {actionType === 'reject' && 'Reject'}
                                    {actionType === 'complete' && 'Complete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};