'use client';
import React from 'react';
import { useAuth, withAuth } from '../../../contexts/AuthContext';

const PatientDashboard = () => {
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-green-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-800">AYURVEDA</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Welcome, <span className="font-medium">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h2>
                    <p className="text-gray-600">Manage your wellness journey with Ayurveda</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Health Score</p>
                                <p className="text-2xl font-bold text-green-600">85%</p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600">❤️</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                                <p className="text-2xl font-bold text-blue-600">3</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600">📋</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Consultations</p>
                                <p className="text-2xl font-bold text-purple-600">12</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600">👩‍⚕️</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Current Treatment Plans */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Treatment Plans</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-800">Digestive Health Plan</h4>
                                <p className="text-sm text-green-600 mt-1">Progress: 75% complete</p>
                                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-800">Stress Management</h4>
                                <p className="text-sm text-blue-600 mt-1">Progress: 45% complete</p>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            View All Plans
                        </button>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Dr. Priya Sharma</h4>
                                    <p className="text-sm text-gray-600">Ayurvedic Consultation</p>
                                    <p className="text-sm text-green-600">Tomorrow, 10:00 AM</p>
                                </div>
                                <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors">
                                    Join Call
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Dr. Raj Kumar</h4>
                                    <p className="text-sm text-gray-600">Diet Planning Session</p>
                                    <p className="text-sm text-blue-600">Friday, 2:30 PM</p>
                                </div>
                                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                                    Reschedule
                                </button>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Book New Appointment
                        </button>
                    </div>

                    {/* Daily Recommendations */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Recommendations</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Take Triphala before breakfast</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Practice 15 minutes of pranayama</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Drink warm turmeric milk before bed</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Include ginger in your evening tea</span>
                            </div>
                        </div>
                    </div>

                    {/* Health Metrics */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Energy Level</span>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className={`text-sm ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}>⭐</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Sleep Quality</span>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className={`text-sm ${star <= 3 ? 'text-yellow-400' : 'text-gray-300'}`}>⭐</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Stress Level</span>
                                <span className="text-sm text-green-600 font-medium">Low</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Digestion</span>
                                <span className="text-sm text-green-600 font-medium">Good</span>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            Update Metrics
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Protect this route - only patients can access
export default withAuth(PatientDashboard, { allowedRoles: ['patient'] });