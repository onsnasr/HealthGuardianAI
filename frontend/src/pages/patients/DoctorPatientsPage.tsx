import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    Phone,
    Mail,
    Search,
    CheckCircle,
    Clock,
    TrendingUp,
    Activity,
    Heart,
    Apple,
    Dumbbell,
    Droplet,
    Sparkles,
    X,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

// ##########################################################################################################
import { aiAPI } from '@/api/ai.api';
import {
    PatientHealthDashboardData,
    FullPlanResponse,
    CombinedHealthData
} from '@/types/health.types';
// ##########################################################################################################
const API_BASE_URL = 'http://localhost:8081/api';

interface DoctorPatient {
    id: number;
    patientId: number;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    firstAppointmentDate: string;
    lastAppointmentDate: string;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    notes?: string;
    isActive: boolean;
}


export const DoctorPatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<DoctorPatient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<DoctorPatient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(null);
    const [showHealthDashboard, setShowHealthDashboard] = useState(false);
    // ##########################################################################################################
    //const [patientHealthData, setPatientHealthData] = useState<PatientHealthData | null>(null);
    const [healthPlanData, setHealthPlanData] = useState<FullPlanResponse | null>(null);
    // ##########################################################################################################
    const [loadingHealthData, setLoadingHealthData] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        filterPatients();
    }, [searchQuery, patients]);

    const fetchPatients = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error('Please login to view patients');
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/doctor-patients`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Patients received:', response.data);
            setPatients(response.data);

        } catch (error: any) {
            console.error('❌ Error fetching patients:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/signin';
            } else {
                toast.error('Failed to fetch patients');
            }
            setPatients([]);
        } finally {
            setIsLoading(false);
        }
    };
    // ##########################################################################################################
    const fetchPatientHealthData = async (patientId: number) => {
        setLoadingHealthData(true);
        setShowHealthDashboard(true);
        setHealthPlanData(null);

        try {
            const token = localStorage.getItem('token');

            // ===== ÉTAPE 1 : Récupérer les données du patient depuis Spring Boot =====
            console.log('🔍 Step 1: Fetching patient data from Spring Boot...');
            const response = await axios.get<PatientHealthDashboardData>(
                `${API_BASE_URL}/doctor-patients/patients/${patientId}/health-dashboard`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const patientData = response.data;
            console.log('✅ Patient data received:', patientData);

            // ===== VÉRIFICATION : Le patient a-t-il des données complètes ? =====
            if (!patientData.hasHealthHabits) {
                toast.error('This patient has not completed their health habits form yet');
                setLoadingHealthData(false);
                return;
            }

            // ===== ÉTAPE 2 : Préparer les données pour l'API Python =====
            console.log('📦 Step 2: Preparing data for AI API...');
            const aiRequestData: CombinedHealthData = {
                userId: String(patientData.userId),
                age: patientData.age || 30,
                gender: 0, // TODO: Add gender field to patient data
                height: patientData.height || 1.75,
                weight: patientData.weight || 70,
                hours_of_sleep: Number(patientData.hoursOfSleep),
                exercise_hours_per_week: Number(patientData.exerciseHoursPerWeek),
                daily_steps: patientData.dailySteps,
                litres_eau_jour: Number(patientData.litresEauJour),
                cafe_jour: patientData.cafeJour,
                heures_travail_jour: Number(patientData.heuresTravailJour),
                bedtime_hour: patientData.bedtimeHour,
                bp_systolic: patientData.bpSystolic,
                bp_diastolic: patientData.bpDiastolic,
                job_type: patientData.jobType,
                activity_status: patientData.activityStatus,
                goal: 'health',
            };

            console.log('📊 Data prepared for AI:', aiRequestData);

            // ===== ÉTAPE 3 : Appeler l'API Python pour les prédictions =====
            console.log('🚀 Step 3: Calling AI API...');
            const aiResponse = await aiAPI.generateFullPlan(aiRequestData);
            console.log('✅ AI predictions received:', aiResponse);

            setHealthPlanData(aiResponse);
            toast.success('Health analysis completed!');

        } catch (error: any) {
            console.error('❌ Error:', error);

            if (error.response?.status === 403) {
                toast.error("You don't have access to this patient's data");
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Failed to load patient health data');
            }
        } finally {
            setLoadingHealthData(false);
        }
    };


    /*const fetchPatientHealthData = async (patientId: number) => {
        try {
            setLoadingHealthData(true);
            const token = localStorage.getItem('token');

            const response = await axios.get(`${API_BASE_URL}/patients/${patientId}/health-dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setPatientHealthData(response.data);
            setShowHealthDashboard(true);
        } catch (error: any) {
            console.error('❌ Error fetching health data:', error);
            toast.error('Failed to load patient health data');
        } finally {
            setLoadingHealthData(false);
        }
    };*/
    // ##########################################################################################################

    const filterPatients = () => {
        if (!searchQuery.trim()) {
            setFilteredPatients(patients);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = patients.filter(patient =>
            patient.patientName.toLowerCase().includes(query) ||
            patient.patientEmail.toLowerCase().includes(query) ||
            (patient.patientPhone && patient.patientPhone.includes(query))
        );

        setFilteredPatients(filtered);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRiskColor = (percentage: number) => {
        if (percentage < 30) return 'bg-green-500';
        if (percentage < 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getRiskTextColor = (percentage: number) => {
        if (percentage < 30) return 'text-green-600';
        if (percentage < 60) return 'text-orange-600';
        return 'text-red-600';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
                <p className="text-gray-600 mt-1">Manage your patient list and view their health data</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Patients</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {patients.length}
                            </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Total Appointments</p>
                            <p className="text-2xl font-bold text-green-700">
                                {patients.reduce((sum, p) => sum + p.totalAppointments, 0)}
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {patients.reduce((sum, p) => sum + p.completedAppointments, 0)}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search patients by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-2xl shadow-card p-6">
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No patients found' : 'No patients yet'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : 'Patients will appear here after you complete their first appointment'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPatients.map((patient) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold text-lg">
                                                {patient.patientName.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {patient.patientName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Patient since {formatDate(patient.firstAppointmentDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                            {patient.totalAppointments} appointment{patient.totalAppointments !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm truncate">{patient.patientEmail}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm">
                                            {patient.patientPhone && patient.patientPhone !== 'Not provided'
                                                ? patient.patientPhone
                                                : <span className="text-gray-400 italic">No phone provided</span>
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700 mb-4">
                                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm">
                                        Last visit: {formatDate(patient.lastAppointmentDate)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-gray-600">
                                                {patient.completedAppointments} completed
                                            </span>
                                        </div>
                                        {patient.cancelledAppointments > 0 && (
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-orange-600" />
                                                <span className="text-sm text-gray-600">
                                                    {patient.cancelledAppointments} cancelled
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedPatient(patient)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => fetchPatientHealthData(patient.patientId)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <Activity className="w-4 h-4" />
                                            Health Dashboard
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Patient Detail Modal */}
            <AnimatePresence>
                {selectedPatient && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedPatient(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl">
                                        {selectedPatient.patientName.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {selectedPatient.patientName}
                                    </h2>
                                    <p className="text-gray-600">
                                        Patient since {formatDate(selectedPatient.firstAppointmentDate)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">Email</p>
                                    </div>
                                    <p className="font-medium break-all">{selectedPatient.patientEmail}</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <p className="text-sm text-gray-600">Phone</p>
                                    </div>
                                    <p className="font-medium">
                                        {selectedPatient.patientPhone && selectedPatient.patientPhone !== 'Not provided'
                                            ? selectedPatient.patientPhone
                                            : <span className="text-gray-400 italic">No phone provided</span>
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600 mb-1">Total Appointments</p>
                                    <p className="font-bold text-2xl text-blue-700">
                                        {selectedPatient.totalAppointments}
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-600 mb-1">Completed</p>
                                    <p className="font-bold text-2xl text-green-700">
                                        {selectedPatient.completedAppointments}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">First Visit</p>
                                    <p className="font-medium">{formatDate(selectedPatient.firstAppointmentDate)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Last Visit</p>
                                    <p className="font-medium">{formatDate(selectedPatient.lastAppointmentDate)}</p>
                                </div>
                            </div>

                            {selectedPatient.cancelledAppointments > 0 && (
                                <div className="p-4 bg-orange-50 rounded-lg mb-6">
                                    <p className="text-sm text-orange-600 mb-1">Cancelled Appointments</p>
                                    <p className="font-bold text-xl text-orange-700">
                                        {selectedPatient.cancelledAppointments}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setSelectedPatient(null);
                                    fetchPatientHealthData(selectedPatient.patientId);
                                }}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 mb-3"
                            >
                                <Activity className="w-5 h-5" />
                                View Health Dashboard
                            </button>

                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Health Dashboard Modal */}
            {/* Health Dashboard Modal */}
            <AnimatePresence>
                {showHealthDashboard && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowHealthDashboard(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {loadingHealthData ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600 font-medium">Analyzing patient health data...</p>
                                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                                </div>
                            ) : healthPlanData ? (
                                <>
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Patient Health Dashboard</h2>
                                            <p className="text-gray-600">AI-generated health insights and analysis</p>
                                        </div>
                                        <button
                                            onClick={() => setShowHealthDashboard(false)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* AI Coach Message */}
                                    {healthPlanData.ai_coach_message && (
                                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-white/20 rounded-xl">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg mb-2">AI Health Coach</h3>
                                                    <p className="text-white/90 leading-relaxed">
                                                        {healthPlanData.ai_coach_message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Health Metrics Overview */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        {/* BMI Card */}
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/20 rounded-xl">
                                                    <Activity className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-medium mb-1">BMI</h3>
                                            <p className="text-3xl font-bold">{healthPlanData.health_analysis.bmi.toFixed(1)}</p>
                                            <p className="text-sm text-white/80 mt-1">Body Mass Index</p>
                                        </div>

                                        {/* Health Score Card */}
                                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/20 rounded-xl">
                                                    <Heart className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-medium mb-1">Health Score</h3>
                                            <p className="text-3xl font-bold">{healthPlanData.health_analysis.health_score.toFixed(0)}/100</p>
                                            <p className="text-sm text-white/80 mt-1">Overall health</p>
                                        </div>

                                        {/* Nutrition Card */}
                                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/20 rounded-xl">
                                                    <Apple className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-medium mb-1">Daily Calories</h3>
                                            <p className="text-3xl font-bold">{healthPlanData.nutrition_schedule.daily_calories}</p>
                                            <p className="text-sm text-white/80 mt-1">Recommended</p>
                                        </div>

                                        {/* Exercise Card */}
                                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/20 rounded-xl">
                                                    <Dumbbell className="w-6 h-6" />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-medium mb-1">Weekly Burn</h3>
                                            <p className="text-3xl font-bold">{healthPlanData.workout_schedule.total_weekly_calories}</p>
                                            <p className="text-sm text-white/80 mt-1">calories</p>
                                        </div>
                                    </div>

                                    {/* Risk Analysis */}
                                    <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <TrendingUp className="w-6 h-6 text-orange-600" />
                                            <h3 className="text-xl font-bold text-gray-900">Health Risk Analysis</h3>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Diabetes Risk */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Droplet className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">Diabetes Risk</span>
                                                    </div>
                                                    <span className={`font-bold ${getRiskTextColor(healthPlanData.health_analysis.risk_diabetes * 100)}`}>
                                            {(healthPlanData.health_analysis.risk_diabetes * 100).toFixed(0)}%
                                        </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`${getRiskColor(healthPlanData.health_analysis.risk_diabetes * 100)} h-2 rounded-full transition-all`}
                                                        style={{ width: `${(healthPlanData.health_analysis.risk_diabetes * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Hypertension Risk */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-red-100 rounded-lg">
                                                            <Activity className="w-5 h-5 text-red-600" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">Hypertension Risk</span>
                                                    </div>
                                                    <span className={`font-bold ${getRiskTextColor(healthPlanData.health_analysis.risk_hypertension * 100)}`}>
                                            {(healthPlanData.health_analysis.risk_hypertension * 100).toFixed(0)}%
                                        </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`${getRiskColor(healthPlanData.health_analysis.risk_hypertension * 100)} h-2 rounded-full transition-all`}
                                                        style={{ width: `${(healthPlanData.health_analysis.risk_hypertension * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Obesity Risk */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-orange-100 rounded-lg">
                                                            <TrendingUp className="w-5 h-5 text-orange-600" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">Obesity Risk</span>
                                                    </div>
                                                    <span className={`font-bold ${getRiskTextColor(healthPlanData.health_analysis.risk_obesity * 100)}`}>
                                            {(healthPlanData.health_analysis.risk_obesity * 100).toFixed(0)}%
                                        </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`${getRiskColor(healthPlanData.health_analysis.risk_obesity * 100)} h-2 rounded-full transition-all`}
                                                        style={{ width: `${(healthPlanData.health_analysis.risk_obesity * 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Heart Disease Risk */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-pink-100 rounded-lg">
                                                            <Heart className="w-5 h-5 text-pink-600" />
                                                        </div>
                                                        <span className="font-medium text-gray-900">Heart Disease Risk</span>
                                                    </div>
                                                    <span className={`font-bold ${getRiskTextColor(healthPlanData.health_analysis.risk_heart_disease * 100)}`}>
                                            {(healthPlanData.health_analysis.risk_heart_disease * 100).toFixed(0)}%
                                        </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`${getRiskColor(healthPlanData.health_analysis.risk_heart_disease * 100)} h-2 rounded-full transition-all`}
                                                        style={{ width: `${(healthPlanData.health_analysis.risk_heart_disease * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        {healthPlanData.health_analysis.recommendations.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <h4 className="font-bold text-gray-900 mb-3">Medical Recommendations</h4>
                                                <div className="space-y-2">
                                                    {healthPlanData.health_analysis.recommendations.map((rec, index) => (
                                                        <div key={index} className="flex items-start gap-3">
                                                            <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                            <p className="text-gray-700">{rec}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowHealthDashboard(false)}
                                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                toast.success('Generating detailed PDF report...');
                                            }}
                                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                            Download Report
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No health data available</p>
                                    <button
                                        onClick={() => setShowHealthDashboard(false)}
                                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};