import React from 'react';
import { X} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PatientForm } from './PatientForm';

interface DailyHabitsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DailyHabitsModal: React.FC<DailyHabitsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Daily Health Habits</h2>
                                <p className="text-white/80 text-sm mt-1">Complete your daily check-in</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 overflow-y-auto">
                        <PatientForm
                            onSubmit={(data) => {
                                console.log('Daily habits submitted:', data);
                                onClose();
                            }}
                            onCancel={onClose}
                        />
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
