import apiClient from './axios.config';

// Types
export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    age?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    medicalHistory?: string;
    lastVisit?: string;
    status: 'stable' | 'attention' | 'critical';
}

export interface Appointment {
    id: number;
    patientId: number;
    patientName: string;
    doctorId: number;
    date: string;
    time: string;
    type: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
}

export interface Message {
    id: number;
    senderId: number;
    senderName: string;
    receiverId: number;
    message: string;
    timestamp: string;
    unread: boolean;
}

export interface DoctorStats {
    totalPatients: number;
    todayAppointments: number;
    unreadMessages: number;
    alerts: number;
}

export const doctorAPI = {
    // Get doctor's patients
    getPatients: async (): Promise<Patient[]> => {
        const response = await apiClient.get('/doctor/patients');
        return response.data;
    },

    // Get single patient details
    getPatient: async (patientId: number): Promise<Patient> => {
        const response = await apiClient.get(`/doctor/patients/${patientId}`);
        return response.data;
    },

    // Get doctor's appointments
    getAppointments: async (): Promise<Appointment[]> => {
        const response = await apiClient.get('/doctor/appointments');
        return response.data;
    },

    // Get today's appointments
    getTodayAppointments: async (): Promise<Appointment[]> => {
        const response = await apiClient.get('/doctor/appointments/today');
        return response.data;
    },

    // Confirm appointment
    confirmAppointment: async (appointmentId: number): Promise<Appointment> => {
        const response = await apiClient.patch(`/doctor/appointments/${appointmentId}/confirm`);
        return response.data;
    },

    // Reschedule appointment
    rescheduleAppointment: async (
        appointmentId: number,
        newDate: string,
        newTime: string
    ): Promise<Appointment> => {
        const response = await apiClient.patch(`/doctor/appointments/${appointmentId}/reschedule`, {
            date: newDate,
            time: newTime
        });
        return response.data;
    },

    // Cancel appointment
    cancelAppointment: async (appointmentId: number): Promise<void> => {
        await apiClient.delete(`/doctor/appointments/${appointmentId}`);
    },

    // Get messages
    getMessages: async (): Promise<Message[]> => {
        const response = await apiClient.get('/doctor/messages');
        return response.data;
    },

    // Get unread messages count
    getUnreadMessagesCount: async (): Promise<number> => {
        const response = await apiClient.get('/doctor/messages/unread/count');
        return response.data.count;
    },

    // Send message to patient
    sendMessage: async (patientId: number, message: string): Promise<Message> => {
        const response = await apiClient.post('/doctor/messages', {
            receiverId: patientId,
            message
        });
        return response.data;
    },

    // Mark message as read
    markMessageAsRead: async (messageId: number): Promise<void> => {
        await apiClient.patch(`/doctor/messages/${messageId}/read`);
    },

    // Get dashboard stats
    getDashboardStats: async (): Promise<DoctorStats> => {
        const response = await apiClient.get('/doctor/stats');
        return response.data;
    },

    // Update patient status
    updatePatientStatus: async (
        patientId: number,
        status: 'stable' | 'attention' | 'critical'
    ): Promise<Patient> => {
        const response = await apiClient.patch(`/doctor/patients/${patientId}/status`, {
            status
        });
        return response.data;
    },

    // Add notes to patient
    addPatientNotes: async (patientId: number, notes: string): Promise<Patient> => {
        const response = await apiClient.post(`/doctor/patients/${patientId}/notes`, {
            notes
        });
        return response.data;
    },

    // Search patients
    searchPatients: async (query: string): Promise<Patient[]> => {
        const response = await apiClient.get(`/doctor/patients/search?q=${query}`);
        return response.data;
    }
};