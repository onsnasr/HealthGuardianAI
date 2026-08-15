import React, { useState } from 'react';
import {
    HelpCircle,
    Mail,
    Phone,
    MessageCircle,
    Book,
    Video,
    FileText,
    ChevronDown,
    ChevronUp,
    Search
} from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

export const DoctorHelpPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            category: 'Patient Management',
            question: 'How do I view my patient list?',
            answer: 'Navigate to the "Patients" tab from the sidebar. Here you can see all your registered patients with their current health status, last visit date, and quick action buttons.'
        },
        {
            category: 'Patient Management',
            question: 'How can I update patient status?',
            answer: 'In the patient list, click on any patient row to view details. You can then update their health status (stable, attention, critical) and add clinical notes.'
        },
        {
            category: 'Patient Management',
            question: 'Can I search for specific patients?',
            answer: 'Yes, use the search bar at the top of the Patients page to quickly find patients by name, email, or medical record number.'
        },
        {
            category: 'Appointments',
            question: 'How do I manage my appointments?',
            answer: 'Go to the "Appointments" section to view all scheduled appointments. You can confirm, reschedule, or cancel appointments as needed. Today\'s appointments are highlighted for quick access.'
        },
        {
            category: 'Appointments',
            question: 'What happens when I confirm an appointment?',
            answer: 'When you confirm an appointment, the patient receives an automatic notification via email and SMS. The appointment status changes to "confirmed" in your dashboard.'
        },
        {
            category: 'Appointments',
            question: 'How do I reschedule an appointment?',
            answer: 'Click the "Reschedule" button next to any appointment, select a new date and time, and the patient will be notified of the change automatically.'
        },
        {
            category: 'Communication',
            question: 'How do I communicate with patients?',
            answer: 'Use the secure messaging system in the "Messages" tab. All communications are HIPAA-compliant and encrypted. You can send messages, share documents, and provide care instructions.'
        },
        {
            category: 'Communication',
            question: 'Can I send bulk messages to patients?',
            answer: 'Currently, messages are sent individually for personalized care. Bulk messaging for general announcements is planned for a future update.'
        },
        {
            category: 'Dashboard',
            question: 'What do the dashboard statistics show?',
            answer: 'Your dashboard displays: Total Patients (lifetime), Today\'s Appointments, Unread Messages, and Health Alerts for patients requiring attention.'
        },
        {
            category: 'Dashboard',
            question: 'What are health alerts?',
            answer: 'Health alerts appear when a patient\'s metrics indicate potential health risks or when critical values are detected. These require immediate attention.'
        },
        {
            category: 'Technical',
            question: 'Is patient data secure?',
            answer: 'Yes, all patient data is encrypted end-to-end and stored in HIPAA-compliant servers. We follow strict data protection regulations (HIPAA, GDPR).'
        },
        {
            category: 'Technical',
            question: 'Can I access the portal on mobile devices?',
            answer: 'Yes, the Doctor Portal is fully responsive and works on smartphones and tablets. Download our mobile app for an optimized experience.'
        },
        {
            category: 'Account',
            question: 'How do I update my profile information?',
            answer: 'Click on your profile avatar in the sidebar, then select "Edit Profile". You can update your contact information, specialty, and clinic details.'
        },
        {
            category: 'Account',
            question: 'How do I change my password?',
            answer: 'Go to your profile settings, click "Security", then "Change Password". For security, you\'ll need to enter your current password.'
        }
    ];

    const filteredFAQs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = Array.from(new Set(faqs.map(faq => faq.category)));

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-card p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Help & Support Center</h1>
                            <p className="text-gray-600">Doctor Portal - Healthcare Professional Support</p>
                        </div>
                    </div>

                    {/* Quick Contact Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors text-center">
                            <Mail className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                            <p className="text-sm text-gray-600 mb-3">doctor-support@healthguardian.com</p>
                            <p className="text-xs text-gray-500">Response within 4 hours</p>
                        </div>

                        <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-colors text-center">
                            <Phone className="w-8 h-8 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">Priority Phone Line</h3>
                            <p className="text-sm text-gray-600 mb-3">+216 21 214 994</p>
                            <p className="text-xs text-gray-500">Mon-Sat, 8AM-8PM</p>
                        </div>

                        <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-colors text-center">
                            <MessageCircle className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                            <p className="text-sm text-gray-600 mb-3">Instant messaging</p>
                            <p className="text-xs text-gray-500">Available 24/7</p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                            <Book className="w-6 h-6 text-blue-600 mb-2" />
                            <h3 className="font-semibold text-gray-900 text-sm">User Guide</h3>
                            <p className="text-xs text-gray-600 mt-1">Complete documentation</p>
                        </button>

                        <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                            <Video className="w-6 h-6 text-green-600 mb-2" />
                            <h3 className="font-semibold text-gray-900 text-sm">Video Tutorials</h3>
                            <p className="text-xs text-gray-600 mt-1">Step-by-step guides</p>
                        </button>

                        <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
                            <FileText className="w-6 h-6 text-purple-600 mb-2" />
                            <h3 className="font-semibold text-gray-900 text-sm">Best Practices</h3>
                            <p className="text-xs text-gray-600 mt-1">Clinical guidelines</p>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for help articles, FAQs, or topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <button
                                onClick={() => setSearchQuery('')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    searchQuery === ''
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSearchQuery(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        searchQuery === category
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-3">
                            {filteredFAQs.length > 0 ? (
                                filteredFAQs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                        >
                                            <div className="flex-1">
                                                <span className="text-xs font-medium text-blue-600 mb-1 block">
                                                    {faq.category}
                                                </span>
                                                <h3 className="font-semibold text-gray-900">
                                                    {faq.question}
                                                </h3>
                                            </div>
                                            {expandedFAQ === index ? (
                                                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                                            )}
                                        </button>
                                        {expandedFAQ === index && (
                                            <div className="p-4 bg-white border-t border-gray-200">
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No results found for "{searchQuery}"</p>
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-4 text-blue-600 hover:underline text-sm"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Still Need Help */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <h3 className="font-semibold text-gray-900 mb-2">Still need help?</h3>
                        <p className="text-sm text-gray-700 mb-4">
                            Our dedicated support team is available to assist you with any questions or technical issues.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                Contact Support
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                Schedule a Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};