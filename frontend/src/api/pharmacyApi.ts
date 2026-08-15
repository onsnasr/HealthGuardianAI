import apiClient from '@/api/axios.config';

export interface Medicine {
    id: number;
    name: string;
    price: number;
    stock: number;
    available: boolean;
    pharmacy: Pharmacy;
    createdAt: string;
    updatedAt: string;
}

export interface Pharmacy {
    id: number;
    pharmacyName: string;
    address: string;
    latitude: number;
    longitude: number;
    phoneNumber: string;
    email: string;
    openingHours: string;
    licenseNumber: string;
    is24Hours: boolean;
    isActive: boolean;
    medicines?: Medicine[];
    createdAt: string;
    updatedAt: string;
}

export interface PharmacyWithDistance extends Pharmacy {
    distance: number;
    availableMedicine?: Medicine;
}

export const pharmacyApi = {
    // Get all pharmacies
    getAllPharmacies: async (): Promise<Pharmacy[]> => {
        const response = await apiClient.get('/pharmacies');
        return response.data;
    },

    // Get pharmacy by ID
    getPharmacyById: async (id: number): Promise<Pharmacy> => {
        const response = await apiClient.get(`/pharmacies/${id}`);
        return response.data;
    },

    // Get 24-hour pharmacies
    get24HourPharmacies: async (): Promise<Pharmacy[]> => {
        const response = await apiClient.get('/pharmacies/24hours');
        return response.data;
    },

    // Search pharmacies by name
    searchPharmacies: async (name: string): Promise<Pharmacy[]> => {
        const response = await apiClient.get(`/pharmacies/search`, {
            params: { name }
        });
        return response.data;
    },

    // Get all medicines
    getAllMedicines: async (): Promise<Medicine[]> => {
        const response = await apiClient.get('/medicines');
        return response.data;
    },

    // Search medicines by name
    searchMedicines: async (name: string): Promise<Medicine[]> => {
        const response = await apiClient.get('/medicines/search', {
            params: { name }
        });
        return response.data;
    },

    // Get medicines by pharmacy
    getMedicinesByPharmacy: async (pharmacyId: number): Promise<Medicine[]> => {
        const response = await apiClient.get(`/medicines/pharmacy/${pharmacyId}`);
        return response.data;
    },

    // Get available medicines by pharmacy
    getAvailableMedicinesByPharmacy: async (pharmacyId: number): Promise<Medicine[]> => {
        const response = await apiClient.get(`/medicines/pharmacy/${pharmacyId}/available`);
        return response.data;
    },

    // Get in-stock medicines by pharmacy
    getInStockMedicinesByPharmacy: async (pharmacyId: number): Promise<Medicine[]> => {
        const response = await apiClient.get(`/medicines/pharmacy/${pharmacyId}/in-stock`);
        return response.data;
    }
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};