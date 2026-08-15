import React from 'react';
import { HelpCircle, Mail, Phone, MessageCircle } from 'lucide-react';

export const HelpPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                        <p className="text-gray-600">We're here to help you</p>
                    </div>
                </div>

                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-colors text-center">
                        <Mail className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                        <p className="text-sm text-gray-600 mb-3">support@healthguardian.com</p>
                        <p className="text-xs text-gray-500">Response within 24h</p>
                    </div>

                    <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-colors text-center">
                        <Phone className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                        <p className="text-sm text-gray-600 mb-3">+216 21 214 994</p>
                        <p className="text-xs text-gray-500">Mon-Fri, 9AM-5PM</p>
                    </div>

                    <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-colors text-center">
                        <MessageCircle className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                        <p className="text-sm text-gray-600 mb-3">Available now</p>
                        <p className="text-xs text-gray-500">Instant support</p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">How do I complete my profile?</h3>
                            <p className="text-sm text-gray-600">
                                Click on your profile picture in the top right, then select "My Profile" and click "Edit Profile".
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">How do I book an appointment?</h3>
                            <p className="text-sm text-gray-600">
                                Go to the Appointments page from the sidebar and click "Book New Appointment".
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2">Is my health data secure?</h3>
                            <p className="text-sm text-gray-600">
                                Yes, all your data is encrypted and stored securely. We comply with healthcare data protection regulations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};