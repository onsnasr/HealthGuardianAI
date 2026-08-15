// src/pages/pharmacy/PharmacySearchPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MapPin,
    Phone,
    Clock,
    Navigation,
    Pill,
    AlertCircle,
    Loader2,
    Package,
    CheckCircle,
    XCircle,
    Building2
} from 'lucide-react';
import { pharmacyApi, PharmacyWithDistance, Medicine, calculateDistance } from '@/api/pharmacyApi';
import toast from 'react-hot-toast';

export const PharmacySearchPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [pharmaciesWithMedicine, setPharmaciesWithMedicine] = useState<PharmacyWithDistance[]>([]);
    const [allPharmacies, setAllPharmacies] = useState<PharmacyWithDistance[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(true);
    const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(true);

    // Get user's location
    const getUserLocation = () => {
        setIsLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsLoadingLocation(false);
                    toast.success('Location detected successfully');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Unable to get your location. Please enable location services.');
                    setIsLoadingLocation(false);
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
            setIsLoadingLocation(false);
        }
    };

    // Load all medicines and pharmacies on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoadingPharmacies(true);

                // Load medicines
                const allMedicines = await pharmacyApi.getAllMedicines();
                setMedicines(allMedicines);

                // Load all pharmacies
                const allPharmaciesData = await pharmacyApi.getAllPharmacies();
                console.log('Loaded pharmacies:', allPharmaciesData);

                // Calculate distances for all pharmacies
                const pharmaciesWithDistances: PharmacyWithDistance[] = allPharmaciesData.map(pharmacy => {
                    let distance = 0;
                    if (userLocation && pharmacy.latitude && pharmacy.longitude) {
                        distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            pharmacy.latitude,
                            pharmacy.longitude
                        );
                    }
                    return { ...pharmacy, distance };
                });

                // Sort by distance
                pharmaciesWithDistances.sort((a, b) => a.distance - b.distance);

                setAllPharmacies(pharmaciesWithDistances);
                setPharmaciesWithMedicine(pharmaciesWithDistances);

            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Failed to load data');
            } finally {
                setIsLoadingPharmacies(false);
            }
        };

        loadData();
        getUserLocation();
    }, []);

    // Recalculate distances when user location changes
    useEffect(() => {
        if (userLocation && allPharmacies.length > 0) {
            const updatedPharmacies = allPharmacies.map(pharmacy => {
                let distance = 0;
                if (pharmacy.latitude && pharmacy.longitude) {
                    distance = calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        pharmacy.latitude,
                        pharmacy.longitude
                    );
                }
                return { ...pharmacy, distance };
            });

            updatedPharmacies.sort((a, b) => a.distance - b.distance);
            setAllPharmacies(updatedPharmacies);
            if (!selectedMedicine) {
                setPharmaciesWithMedicine(updatedPharmacies);
            }
        }
    }, [userLocation]);

    // Filter medicines based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMedicines([]);
            return;
        }

        const filtered = medicines.filter((medicine) =>
            medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredMedicines(filtered);
    }, [searchQuery, medicines]);

    // Search for pharmacies with selected medicine
    const handleMedicineSelect = async (medicine: Medicine) => {
        setSelectedMedicine(medicine);
        setIsSearching(true);
        setShowResults(true);

        try {
            // Get all pharmacies
            const allPharmaciesData = await pharmacyApi.getAllPharmacies();

            // Filter pharmacies that have this medicine in stock
            const pharmaciesWithStock: PharmacyWithDistance[] = [];

            for (const pharmacy of allPharmaciesData) {
                const pharmacyMedicines = await pharmacyApi.getInStockMedicinesByPharmacy(pharmacy.id);
                const medicineInPharmacy = pharmacyMedicines.find(m => m.name === medicine.name);

                if (medicineInPharmacy && medicineInPharmacy.stock > 0) {
                    let distance = 0;
                    if (userLocation && pharmacy.latitude && pharmacy.longitude) {
                        distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            pharmacy.latitude,
                            pharmacy.longitude
                        );
                    }

                    pharmaciesWithStock.push({
                        ...pharmacy,
                        distance,
                        availableMedicine: medicineInPharmacy
                    });
                }
            }

            // Sort by distance
            pharmaciesWithStock.sort((a, b) => a.distance - b.distance);
            setPharmaciesWithMedicine(pharmaciesWithStock);

            if (pharmaciesWithStock.length === 0) {
                toast.error('No pharmacies found with this medicine in stock');
            }
        } catch (error) {
            console.error('Error searching pharmacies:', error);
            toast.error('Failed to search pharmacies');
        } finally {
            setIsSearching(false);
        }
    };

    const openInMaps = (pharmacy: PharmacyWithDistance) => {
        if (pharmacy.latitude && pharmacy.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
            window.open(url, '_blank');
        } else {
            toast.error('Location not available for this pharmacy');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                        <Pill className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Medicine</h1>
                    <p className="text-gray-600 text-lg">Search for medications and find the nearest pharmacy</p>
                </motion.div>

                {/* Search Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for a medicine..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                            />

                            {/* Medicine Suggestions Dropdown */}
                            <AnimatePresence>
                                {searchQuery && filteredMedicines.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50"
                                    >
                                        {filteredMedicines.map((medicine) => (
                                            <button
                                                key={medicine.id}
                                                onClick={() => {
                                                    handleMedicineSelect(medicine);
                                                    setSearchQuery(medicine.name);
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{medicine.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            ${medicine.price.toFixed(2)} • Stock: {medicine.stock}
                                                        </p>
                                                    </div>
                                                    {medicine.available && medicine.stock > 0 ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Location Button */}
                        <button
                            onClick={getUserLocation}
                            disabled={isLoadingLocation}
                            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoadingLocation ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Detecting...</span>
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-5 h-5" />
                                    <span>My Location</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Location Status */}
                    {userLocation && (
                        <div className="mt-4 flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm">Location detected successfully</span>
                        </div>
                    )}
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            {isLoadingPharmacies ? (
                                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading pharmacies...</p>
                                </div>
                            ) : isSearching ? (
                                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                                    <p className="text-gray-600">Searching for pharmacies...</p>
                                </div>
                            ) : pharmaciesWithMedicine.length > 0 ? (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                        {selectedMedicine ? (
                                            <>Found {pharmaciesWithMedicine.length} Pharmacy{pharmaciesWithMedicine.length !== 1 ? 's' : ''} with {selectedMedicine.name}</>
                                        ) : (
                                            <>All Pharmacies ({pharmaciesWithMedicine.length})</>
                                        )}
                                    </h2>
                                    <div className="grid gap-4">
                                        {pharmaciesWithMedicine.map((pharmacy, index) => (
                                            <motion.div
                                                key={pharmacy.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6"
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                    {/* Pharmacy Info */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                                <Building2 className="w-6 h-6" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h3 className="text-xl font-bold text-gray-900">
                                                                        {pharmacy.pharmacyName}
                                                                    </h3>
                                                                    {pharmacy.is24Hours && (
                                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                                            24/7
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span className="text-sm">{pharmacy.address}</span>
                                                                        {userLocation && pharmacy.distance > 0 && (
                                                                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                                                {pharmacy.distance.toFixed(1)} km away
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {pharmacy.phoneNumber && (
                                                                        <div className="flex items-center gap-2 text-gray-600">
                                                                            <Phone className="w-4 h-4" />
                                                                            <span className="text-sm">{pharmacy.phoneNumber}</span>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center gap-2 text-gray-600">
                                                                        <Clock className="w-4 h-4" />
                                                                        <span className="text-sm">
                                                                            {pharmacy.is24Hours ? '24 Hours' : (pharmacy.openingHours || 'Contact for hours')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Medicine Stock Info */}
                                                    {pharmacy.availableMedicine && (
                                                        <div className="lg:w-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Package className="w-5 h-5 text-green-600" />
                                                                <span className="font-semibold text-gray-900">In Stock</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600">Quantity:</span>
                                                                    <span className="font-bold text-green-700">
                                                                        {pharmacy.availableMedicine.stock} units
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600">Price:</span>
                                                                    <span className="font-bold text-green-700">
                                                                        ${pharmacy.availableMedicine.price.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Button */}
                                                    <button
                                                        onClick={() => openInMaps(pharmacy)}
                                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                                    >
                                                        <Navigation className="w-5 h-5" />
                                                        <span>Get Directions</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ) : selectedMedicine ? (
                                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h3>
                                    <p className="text-gray-600">
                                        No pharmacies currently have <strong>{selectedMedicine.name}</strong> in stock.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Pharmacies Found</h3>
                                    <p className="text-gray-600">
                                        No pharmacies are currently registered in the system.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Cards */}
                {!selectedMedicine && !isLoadingPharmacies && pharmaciesWithMedicine.length === 0 && (
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Search className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Search Medicine</h3>
                            <p className="text-gray-600 text-sm">
                                Enter the name of the medicine you're looking for
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-lg"
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Find Nearest</h3>
                            <p className="text-gray-600 text-sm">
                                We'll show you the closest pharmacies with that medicine
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-lg"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <Navigation className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Get Directions</h3>
                            <p className="text-gray-600 text-sm">
                                Navigate directly to the pharmacy using Google Maps
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};