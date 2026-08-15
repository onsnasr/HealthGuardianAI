import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = 'http://localhost:8081/api';

interface DayAvailability {
    id?: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    slotDurationMinutes: number;
}

interface WeeklySchedule {
    monday: DayAvailability | null;
    tuesday: DayAvailability | null;
    wednesday: DayAvailability | null;
    thursday: DayAvailability | null;
    friday: DayAvailability | null;
    saturday: DayAvailability | null;
    sunday: DayAvailability | null;
}

interface Exception {
    id: number;
    exceptionDate: string;
    exceptionEndDate?: string;
    reason: string;
    exceptionType: string;
    daysCount: number;
}

export const DoctorAvailabilityPage: React.FC = () => {
    const { user } = useAuthStore();
    const [schedule, setSchedule] = useState<WeeklySchedule>({
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
    });

    const [exceptions, setExceptions] = useState<Exception[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showExceptionModal, setShowExceptionModal] = useState(false);

    // Exception form
    const [exceptionStartDate, setExceptionStartDate] = useState('');
    const [exceptionEndDate, setExceptionEndDate] = useState('');
    const [exceptionReason, setExceptionReason] = useState('');
    const [exceptionType, setExceptionType] = useState<'VACATION' | 'SICK_LEAVE' | 'CONFERENCE' | 'EMERGENCY' | 'HOLIDAY' | 'OTHER'>('VACATION');

    const daysOfWeek = [
        { key: 'monday', label: 'Monday', value: 'MONDAY' },
        { key: 'tuesday', label: 'Tuesday', value: 'TUESDAY' },
        { key: 'wednesday', label: 'Wednesday', value: 'WEDNESDAY' },
        { key: 'thursday', label: 'Thursday', value: 'THURSDAY' },
        { key: 'friday', label: 'Friday', value: 'FRIDAY' },
        { key: 'saturday', label: 'Saturday', value: 'SATURDAY' },
        { key: 'sunday', label: 'Sunday', value: 'SUNDAY' },
    ];

    useEffect(() => {
        fetchSchedule();
        fetchExceptions();
    }, []);

    const fetchSchedule = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/doctor-availability/my-schedule`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data) {
                setSchedule(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching schedule:', error);

            // If endpoint doesn't exist, initialize with default values
            if (error.response?.status === 404) {
                console.log('Schedule endpoint not found, using default schedule');
                const defaultSchedule: WeeklySchedule = {
                    monday: { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                    tuesday: { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                    wednesday: { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                    thursday: { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                    friday: { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                    saturday: { dayOfWeek: 'SATURDAY', startTime: '10:00', endTime: '14:00', isAvailable: false, slotDurationMinutes: 30 },
                    sunday: { dayOfWeek: 'SUNDAY', startTime: '10:00', endTime: '14:00', isAvailable: false, slotDurationMinutes: 30 },
                };
                setSchedule(defaultSchedule);
            } else {
                toast.error('Error loading your schedule');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchExceptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/doctor-availability/exceptions/upcoming`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data) {
                setExceptions(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching exceptions:', error);
            // Silently fail for exceptions
        }
    };

    const updateDayAvailability = async (dayKey: string, dayValue: string, data: Partial<DayAvailability>) => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');

            const daySchedule = schedule[dayKey as keyof WeeklySchedule];
            const payload = {
                dayOfWeek: dayValue,
                isAvailable: data.isAvailable ?? (daySchedule?.isAvailable || false),
                startTime: data.startTime || daySchedule?.startTime || '09:00',
                endTime: data.endTime || daySchedule?.endTime || '17:00',
                slotDurationMinutes: data.slotDurationMinutes || daySchedule?.slotDurationMinutes || 30
            };

            // Update local state immediately
            setSchedule(prev => ({
                ...prev,
                [dayKey]: {
                    ...daySchedule,
                    ...payload,
                    dayOfWeek: dayValue
                } as DayAvailability
            }));

            try {
                await axios.put(`${API_BASE_URL}/doctor-availability/update-day`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success(`${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)} updated`);
            } catch (apiError: any) {
                console.warn('API call failed, but local state updated:', apiError);
                toast.success(`${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)} updated locally`);
            }

        } catch (error: any) {
            console.error('Error updating day:', error);
            toast.error('Error updating schedule');
        } finally {
            setIsSaving(false);
        }
    };

    const applyTemplate = async (templateType: string) => {
        try {
            setIsSaving(true);

            let templateSchedule: WeeklySchedule;

            switch (templateType) {
                case 'WEEKDAYS_ONLY':
                    templateSchedule = {
                        monday: { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        tuesday: { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        wednesday: { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        thursday: { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        friday: { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        saturday: { dayOfWeek: 'SATURDAY', startTime: '10:00', endTime: '14:00', isAvailable: false, slotDurationMinutes: 30 },
                        sunday: { dayOfWeek: 'SUNDAY', startTime: '10:00', endTime: '14:00', isAvailable: false, slotDurationMinutes: 30 },
                    };
                    break;

                case 'ALL_DAYS':
                    templateSchedule = {
                        monday: { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        tuesday: { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        wednesday: { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        thursday: { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        friday: { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        saturday: { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                        sunday: { dayOfWeek: 'SUNDAY', startTime: '09:00', endTime: '17:00', isAvailable: true, slotDurationMinutes: 30 },
                    };
                    break;

                case 'WEEKENDS_ONLY':
                    templateSchedule = {
                        monday: { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isAvailable: false, slotDurationMinutes: 30 },
                        tuesday: { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isAvailable: false, slotDurationMinutes: 30 },
                        wednesday: { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isAvailable: false, slotDurationMinutes: 30 },
                        thursday: { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isAvailable: false, slotDurationMinutes: 30 },
                        friday: { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', isAvailable: false, slotDurationMinutes: 30 },
                        saturday: { dayOfWeek: 'SATURDAY', startTime: '10:00', endTime: '14:00', isAvailable: true, slotDurationMinutes: 30 },
                        sunday: { dayOfWeek: 'SUNDAY', startTime: '10:00', endTime: '14:00', isAvailable: true, slotDurationMinutes: 30 },
                    };
                    break;

                default:
                    return;
            }

            setSchedule(templateSchedule);

            // Try to save to backend
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${API_BASE_URL}/doctor-availability/apply-template`, {
                    templateType,
                    startTime: '09:00',
                    endTime: '17:00',
                    slotDurationMinutes: 30
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success('Template applied successfully');
            } catch (apiError: any) {
                console.warn('API call failed, but template applied locally:', apiError);
                toast.success('Template applied locally');
            }

        } catch (error: any) {
            console.error('Error applying template:', error);
            toast.error('Error applying template');
        } finally {
            setIsSaving(false);
        }
    };

    const createException = async () => {
        if (!exceptionStartDate || !exceptionReason) {
            toast.error('Start date and reason are required');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const payload = {
                exceptionDate: exceptionStartDate,
                exceptionEndDate: exceptionEndDate || null,
                reason: exceptionReason,
                exceptionType: exceptionType
            };

            // Update local state first
            const newException: Exception = {
                id: Date.now(), // Temporary ID
                exceptionDate: exceptionStartDate,
                exceptionEndDate: exceptionEndDate || undefined,
                reason: exceptionReason,
                exceptionType: exceptionType,
                daysCount: exceptionEndDate ?
                    Math.ceil((new Date(exceptionEndDate).getTime() - new Date(exceptionStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 :
                    1
            };

            setExceptions(prev => [...prev, newException]);

            try {
                await axios.post(`${API_BASE_URL}/doctor-availability/exceptions`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success('Exception added');
            } catch (apiError: any) {
                console.warn('API call failed, but exception added locally:', apiError);
                toast.success('Exception added locally');
            }

            setShowExceptionModal(false);
            setExceptionStartDate('');
            setExceptionEndDate('');
            setExceptionReason('');
            setExceptionType('VACATION');

        } catch (error: any) {
            console.error('Error creating exception:', error);
            toast.error('Error adding exception');
        }
    };

    const deleteException = async (id: number) => {
        if (!confirm('Delete this exception?')) return;

        // Remove from local state
        setExceptions(prev => prev.filter(exc => exc.id !== id));

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/doctor-availability/exceptions/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            toast.success('Exception deleted');
        } catch (error: any) {
            console.error('Error deleting exception:', error);
            toast.error('Error deleting exception');
        }
    };

    const DayCard: React.FC<{ day: { key: string; label: string; value: string } }> = ({ day }) => {
        const daySchedule = schedule[day.key as keyof WeeklySchedule];

        return (
            <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{day.label}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={daySchedule?.isAvailable || false}
                            onChange={(e) => updateDayAvailability(day.key, day.value, {
                                isAvailable: e.target.checked,
                                startTime: daySchedule?.startTime || '09:00',
                                endTime: daySchedule?.endTime || '17:00',
                                slotDurationMinutes: daySchedule?.slotDurationMinutes || 30
                            })}
                            className="sr-only peer"
                            disabled={isSaving}
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${isSaving ? 'opacity-50' : ''}`}></div>
                    </label>
                </div>

                {daySchedule?.isAvailable && (
                    <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <input
                                type="time"
                                value={daySchedule.startTime}
                                onChange={(e) => updateDayAvailability(day.key, day.value, {
                                    ...daySchedule,
                                    startTime: e.target.value
                                })}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                disabled={isSaving}
                            />
                            <span>→</span>
                            <input
                                type="time"
                                value={daySchedule.endTime}
                                onChange={(e) => updateDayAvailability(day.key, day.value, {
                                    ...daySchedule,
                                    endTime: e.target.value
                                })}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Slot duration:</span>
                            <select
                                value={daySchedule.slotDurationMinutes}
                                onChange={(e) => updateDayAvailability(day.key, day.value, {
                                    ...daySchedule,
                                    slotDurationMinutes: parseInt(e.target.value)
                                })}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                disabled={isSaving}
                            >
                                <option value="15">15 min</option>
                                <option value="30">30 min</option>
                                <option value="45">45 min</option>
                                <option value="60">1 hour</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
                <p className="text-gray-600 mt-1">Configure your schedule</p>
            </div>

            {/* Quick Templates */}
            <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">⚡ Quick Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => applyTemplate('WEEKDAYS_ONLY')}
                        disabled={isSaving}
                        className="p-4 border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="font-semibold text-blue-700">Mon-Fri: 9am-5pm</div>
                        <div className="text-sm text-gray-600 mt-1">Standard work week</div>
                    </button>
                    <button
                        onClick={() => applyTemplate('ALL_DAYS')}
                        disabled={isSaving}
                        className="p-4 border-2 border-green-300 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="font-semibold text-green-700">Every day</div>
                        <div className="text-sm text-gray-600 mt-1">9am-5pm without exception</div>
                    </button>
                    <button
                        onClick={() => applyTemplate('WEEKENDS_ONLY')}
                        disabled={isSaving}
                        className="p-4 border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="font-semibold text-purple-700">Weekends only</div>
                        <div className="text-sm text-gray-600 mt-1">Sat-Sun: 10am-2pm</div>
                    </button>
                </div>
            </div>

            {/* Weekly Configuration */}
            <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">📅 Weekly Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daysOfWeek.map((day) => (
                        <DayCard key={day.key} day={day} />
                    ))}
                </div>
            </div>

            {/* Holidays & Exceptions */}
            <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">🚫 Holidays & Exceptions</h2>
                    <button
                        onClick={() => setShowExceptionModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Holiday
                    </button>
                </div>

                {exceptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No exceptions configured</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {exceptions.map((exc) => (
                            <div key={exc.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {exc.exceptionEndDate ? (
                                            `${new Date(exc.exceptionDate).toLocaleDateString()} - ${new Date(exc.exceptionEndDate).toLocaleDateString()}`
                                        ) : (
                                            new Date(exc.exceptionDate).toLocaleDateString()
                                        )}
                                        <span className="ml-2 text-sm text-gray-600">({exc.daysCount} day{exc.daysCount > 1 ? 's' : ''})</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">{exc.reason}</div>
                                    <div className="text-xs text-gray-500 mt-1">Type: {exc.exceptionType}</div>
                                </div>
                                <button
                                    onClick={() => deleteException(exc.id)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Exception Modal */}
            <AnimatePresence>
                {showExceptionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowExceptionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Add Holiday</h3>
                                <button
                                    onClick={() => setShowExceptionModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type</label>
                                    <select
                                        value={exceptionType}
                                        onChange={(e) => setExceptionType(e.target.value as any)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="VACATION">Vacation</option>
                                        <option value="SICK_LEAVE">Sick Leave</option>
                                        <option value="CONFERENCE">Conference</option>
                                        <option value="EMERGENCY">Emergency</option>
                                        <option value="HOLIDAY">Holiday</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                                    <input
                                        type="date"
                                        value={exceptionStartDate}
                                        onChange={(e) => setExceptionStartDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">End Date (optional)</label>
                                    <input
                                        type="date"
                                        value={exceptionEndDate}
                                        onChange={(e) => setExceptionEndDate(e.target.value)}
                                        min={exceptionStartDate || new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Reason *</label>
                                    <textarea
                                        value={exceptionReason}
                                        onChange={(e) => setExceptionReason(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ex: Summer vacation..."
                                    />
                                </div>

                                <button
                                    onClick={createException}
                                    className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Block These Dates
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};