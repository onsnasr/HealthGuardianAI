import React from 'react';
import {
    Heart,
    Target,
    Users,
    Sparkles,
    Stethoscope,
    Calendar,
    MessageCircle,
    Shield,
    Award,
    Activity
} from 'lucide-react';

export const DoctorAboutPage: React.FC = () => {
    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4">
                            <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            HealthGuardian Doctor Portal
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Professional Healthcare Management Platform
                        </p>
                    </div>

                    {/* Mission */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-6 h-6 text-blue-500" />
                            About Doctor Portal
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The HealthGuardian Doctor Portal is designed to empower healthcare professionals
                            with advanced tools for patient management, appointment scheduling, and preventive
                            care monitoring. Our platform bridges the gap between doctors and patients,
                            enabling proactive healthcare delivery.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            With AI-powered insights and real-time patient data, doctors can make informed
                            decisions and provide personalized care recommendations to help prevent chronic diseases.
                        </p>
                    </div>

                    {/* Features for Doctors */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-cyan-500" />
                            Features for Healthcare Professionals
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-gray-900">Patient Management</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Comprehensive patient profiles with medical history, health metrics, and risk assessments
                                </p>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-gray-900">Appointment System</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Efficient scheduling with automated reminders and easy rescheduling options
                                </p>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageCircle className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-900">Secure Messaging</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    HIPAA-compliant communication channel for patient consultations
                                </p>
                            </div>

                            <div className="p-4 bg-orange-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-5 h-5 text-orange-600" />
                                    <h3 className="font-semibold text-gray-900">AI Health Analytics</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Machine learning predictions for disease risk and health trend analysis
                                </p>
                            </div>

                            <div className="p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-red-600" />
                                    <h3 className="font-semibold text-gray-900">Real-time Alerts</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Instant notifications for critical patient metrics and urgent cases
                                </p>
                            </div>

                            <div className="p-4 bg-amber-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-amber-600" />
                                    <h3 className="font-semibold text-gray-900">Professional Dashboard</h3>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Intuitive interface with comprehensive analytics and reporting tools
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Platform Info */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-500" />
                            Our Commitment to Healthcare
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            HealthGuardian is committed to supporting healthcare professionals in their mission
                            to provide exceptional preventive care. We understand the challenges doctors face
                            in managing chronic diseases like diabetes, hypertension, and obesity.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Our platform is built with input from medical professionals and adheres to the
                            highest standards of data security and privacy. Together, we can make preventive
                            healthcare accessible and effective for everyone.
                        </p>
                    </div>

                    {/* Version Info */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Platform Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">Version:</span>
                                <span className="ml-2 font-medium text-gray-900">1.2.0 (Doctor Portal)</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="ml-2 font-medium text-gray-900">November 2025</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Location:</span>
                                <span className="ml-2 font-medium text-gray-900">Tunis, Tunisia</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Compliance:</span>
                                <span className="ml-2 font-medium text-gray-900">HIPAA, GDPR</span>
                            </div>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Need assistance? Contact our support team at{' '}
                            <a href="mailto:doctor-support@healthguardian.com" className="text-blue-600 hover:underline">
                                doctor-support@healthguardian.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};