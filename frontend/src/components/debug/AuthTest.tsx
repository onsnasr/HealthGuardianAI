import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

export const AuthTest: React.FC = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [isTesting, setIsTesting] = useState(false);

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runTests = async () => {
        setIsTesting(true);
        setTestResults([]);

        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        addResult(`Token: ${token ? 'Present' : 'Missing'}`);
        addResult(`User data: ${userData ? 'Present' : 'Missing'}`);

        if (userData) {
            try {
                const user = JSON.parse(userData);
                addResult(`User role: ${user.role}`);
                addResult(`User email: ${user.email}`);
            } catch (e) {
                addResult(`Error parsing user data: ${e}`);
            }
        }

        // Test 1: Recherche de docteurs (publique)
        try {
            addResult('Testing doctor search (public)...');
            const searchResponse = await axios.get(`${API_BASE_URL}/appointments/search-doctors?query=test`);
            addResult(`✅ Search successful: ${searchResponse.data.length} results`);
        } catch (error: any) {
            addResult(`❌ Search failed: ${error.response?.status || error.message}`);
        }

        // Test 2: Appointments avec token
        if (token) {
            try {
                addResult('Testing appointments endpoint...');
                const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                addResult(`✅ Appointments successful: ${appointmentsResponse.data.length} appointments`);
            } catch (error: any) {
                addResult(`❌ Appointments failed: Status ${error.response?.status}, Message: ${error.response?.data?.message || error.message}`);
                if (error.response?.data?.error === 'EMAIL_NOT_VERIFIED') {
                    addResult('⚠️ Email not verified!');
                }
            }
        }

        // Test 3: Vérifier le token avec Spring Boot
        if (token) {
            try {
                addResult('Testing token validation...');
                const testResponse = await axios.get(`${API_BASE_URL}/auth/test-token`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                addResult(`✅ Token valid: ${JSON.stringify(testResponse.data)}`);
            } catch (error: any) {
                addResult(`❌ Token validation failed: ${error.response?.status || error.message}`);
            }
        }

        setIsTesting(false);
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Auth Debugger</h3>
                <button
                    onClick={runTests}
                    disabled={isTesting}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300"
                >
                    {isTesting ? 'Testing...' : 'Run Tests'}
                </button>
            </div>

            <div className="h-64 overflow-y-auto border border-gray-200 p-2 text-xs">
                {testResults.length === 0 ? (
                    <p className="text-gray-500">Click "Run Tests" to start debugging</p>
                ) : (
                    testResults.map((result, index) => (
                        <div key={index} className="mb-1 font-mono">
                            {result}
                        </div>
                    ))
                )}
            </div>

            <div className="mt-2 text-xs text-gray-600">
                <p>Token: {localStorage.getItem('token')?.substring(0, 20)}...</p>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        addResult('Cleared local storage');
                    }}
                    className="mt-1 px-2 py-1 bg-red-100 text-red-700 rounded"
                >
                    Clear Storage
                </button>
            </div>
        </div>
    );
};