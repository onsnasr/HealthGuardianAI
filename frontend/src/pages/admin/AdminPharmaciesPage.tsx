import React, { useState, useEffect } from 'react';
import apiClient from '@/api/axios.config';
import toast from 'react-hot-toast';
import {
    Building2,
    Search,
    MapPin,
    Phone,
    Clock,
    CheckCircle,
    Award,
    Plus,
    X,
    Eye,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pharmacy {
    id: number;
    pharmacyName: string;
    address: string;
    email?: string;
    phoneNumber?: string;
    licenseNumber?: string;
    is24Hours: boolean;
    openingHours?: string;
    latitude?: number;
    longitude?: number;
}

export const AdminPharmaciesPage: React.FC = () => {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<string>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [formData, setFormData] = useState({
        pharmacyName: '',
        address: '',
        email: '',
        phoneNumber: '',
        licenseNumber: '',
        is24Hours: false,
        openingHours: ''
    });

    useEffect(() => {
        fetchPharmacies();
    }, []);

    useEffect(() => {
        filterPharmacies();
    }, [searchQuery, filter, pharmacies]);

    const fetchPharmacies = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/pharmacies');
            setPharmacies(response.data);
        } catch (error) {
            toast.error('Failed to load pharmacies');
        } finally {
            setIsLoading(false);
        }
    };

    const filterPharmacies = () => {
        let filtered = [...pharmacies];

        if (searchQuery) {
            filtered = filtered.filter(pharmacy =>
                pharmacy.pharmacyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pharmacy.address?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filter === '24H') {
            filtered = filtered.filter(p => p.is24Hours);
        }

        setFilteredPharmacies(filtered);
    };

    const handleCreatePharmacy = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/pharmacies', formData);
            toast.success('Pharmacy created successfully!');
            setShowCreateModal(false);
            setFormData({
                pharmacyName: '',
                address: '',
                email: '',
                phoneNumber: '',
                licenseNumber: '',
                is24Hours: false,
                openingHours: ''
            });
            fetchPharmacies();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create pharmacy');
        }
    };

    const handleDeletePharmacy = async (pharmacyId: number) => {
        if (window.confirm('Are you sure you want to permanently delete this pharmacy?')) {
            try {
                await apiClient.delete(`/pharmacies/${pharmacyId}`);
                toast.success('Pharmacy deleted successfully!');
                fetchPharmacies();
            } catch (error: any) {
                console.error('Delete error:', error);
                toast.error(error.response?.data?.message || 'Failed to delete pharmacy');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pharmacies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Management</h1>
                    <p className="text-gray-600">View and manage registered pharmacies</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Pharmacy
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <p className="text-sm text-gray-600">Total Pharmacies</p>
                    <p className="text-2xl font-bold text-gray-900">{pharmacies.length}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-orange-700">24/7 Pharmacies</p>
                    <p className="text-2xl font-bold text-orange-900">
                        {pharmacies.filter(p => p.is24Hours).length}
                    </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 shadow-md">
                    <p className="text-sm text-blue-700">Regular Hours</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {pharmacies.filter(p => !p.is24Hours).length}
                    </p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search pharmacies by name or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="ALL">All Pharmacies</option>
                        <option value="24H">24/7 Only</option>
                    </select>
                </div>
            </div>

            {/* Pharmacies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPharmacies.length > 0 ? (
                    filteredPharmacies.map((pharmacy) => (
                        <motion.div
                            key={pharmacy.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    {pharmacy.is24Hours && (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            24/7
                                        </span>
                                    )}
                                    <button
                                        onClick={() => setSelectedPharmacy(pharmacy)}
                                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="View details"
                                    >
                                        <Eye className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePharmacy(pharmacy.id)}
                                        className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Delete pharmacy"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {pharmacy.pharmacyName}
                            </h3>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{pharmacy.address}</span>
                                </div>

                                {pharmacy.phoneNumber && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        {pharmacy.phoneNumber}
                                    </div>
                                )}

                                {pharmacy.licenseNumber && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Award className="w-4 h-4" />
                                        {pharmacy.licenseNumber}
                                    </div>
                                )}

                                {pharmacy.openingHours && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        {pharmacy.openingHours}
                                    </div>
                                )}
                            </div>

                            {pharmacy.email && (
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">{pharmacy.email}</p>
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No pharmacies found</p>
                    </div>
                )}
            </div>

            {/* Create Pharmacy Modal */}
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
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                                    <h2 className="text-2xl font-bold text-gray-900">Add New Pharmacy</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreatePharmacy} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pharmacy Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.pharmacyName}
                                            onChange={(e) => setFormData({...formData, pharmacyName: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="Pharmacie Centrale"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                        <textarea
                                            rows={2}
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="45 Rue de la Liberté, Tunis"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                                placeholder="contact@pharmacy.tn"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                                placeholder="+216 71 234 567"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.licenseNumber}
                                            onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="TN-PHARM-67890"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                                        <input
                                            type="text"
                                            value={formData.openingHours}
                                            onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                            placeholder="08:00-20:00"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is24Hours"
                                            checked={formData.is24Hours}
                                            onChange={(e) => setFormData({...formData, is24Hours: e.target.checked})}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <label htmlFor="is24Hours" className="text-sm font-medium text-gray-700">
                                            24/7 Pharmacy
                                        </label>
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
                                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                        >
                                            Create Pharmacy
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Pharmacy Details Modal */}
            {selectedPharmacy && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPharmacy(null)}>
                    <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Pharmacy Details</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium text-gray-900">{selectedPharmacy.pharmacyName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="font-medium text-gray-900">{selectedPharmacy.address}</p>
                            </div>
                            {selectedPharmacy.email && (
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-900">{selectedPharmacy.email}</p>
                                </div>
                            )}
                            {selectedPharmacy.phoneNumber && (
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-medium text-gray-900">{selectedPharmacy.phoneNumber}</p>
                                </div>
                            )}
                            {selectedPharmacy.licenseNumber && (
                                <div>
                                    <p className="text-sm text-gray-600">License Number</p>
                                    <p className="font-medium text-gray-900">{selectedPharmacy.licenseNumber}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-600">Opening Hours</p>
                                <p className="font-medium text-gray-900">
                                    {selectedPharmacy.is24Hours ? '24/7' : (selectedPharmacy.openingHours || 'Not specified')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedPharmacy(null)}
                            className="mt-6 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};