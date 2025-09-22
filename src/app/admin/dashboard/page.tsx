'use client';
import React from 'react';
import { useAuth, withAuth } from '../../../contexts/AuthContext';

const AdminDashboard = () => {
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-800">AYURVEDA ADMIN</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">{user?.name}</span>
                                <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">Admin</span>
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">System Administration</h2>
                    <p className="text-gray-600">Manage users, monitor system health, and configure settings</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-indigo-600">1,247</p>
                                <p className="text-xs text-green-500 mt-1">↗️ +12% this month</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600">👥</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                                <p className="text-2xl font-bold text-green-600">843</p>
                                <p className="text-xs text-blue-500 mt-1">Real-time</p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600">⚡</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">System Health</p>
                                <p className="text-2xl font-bold text-emerald-600">98.9%</p>
                                <p className="text-xs text-emerald-500 mt-1">Uptime</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <span className="text-emerald-600">💚</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-purple-600">₹2.4L</p>
                                <p className="text-xs text-green-500 mt-1">↗️ +8% growth</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600">💰</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* User Management */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600">👨‍⚕️</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">Dietitians</p>
                                        <p className="text-xs text-blue-600">45 active</p>
                                    </div>
                                </div>
                                <button className="text-blue-600 hover:text-blue-800 text-sm">Manage</button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600">🏥</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-800">Patients</p>
                                        <p className="text-xs text-green-600">1,182 registered</p>
                                    </div>
                                </div>
                                <button className="text-green-600 hover:text-green-800 text-sm">View</button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600">⚙️</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-purple-800">Admins</p>
                                        <p className="text-xs text-purple-600">8 active</p>
                                    </div>
                                </div>
                                <button className="text-purple-600 hover:text-purple-800 text-sm">Settings</button>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            User Dashboard
                        </button>
                    </div>

                    {/* System Alerts */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-red-800">🚨 High Server Load</h4>
                                        <p className="text-sm text-red-600 mt-1">Database queries taking longer than usual</p>
                                        <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
                                    </div>
                                    <button className="text-red-600 hover:text-red-800 text-sm">Fix</button>
                                </div>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-yellow-800">⚠️ Backup Pending</h4>
                                        <p className="text-sm text-yellow-600 mt-1">Weekly backup scheduled for tonight</p>
                                        <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                                    </div>
                                    <button className="text-yellow-600 hover:text-yellow-800 text-sm">Schedule</button>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-blue-800">💡 Feature Request</h4>
                                        <p className="text-sm text-blue-600 mt-1">Mobile app integration requested by users</p>
                                        <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm">Review</button>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                            View All Alerts
                        </button>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">New dietitian Dr. Rajesh Kumar registered</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">System backup completed successfully</p>
                                    <p className="text-xs text-gray-500">6 hours ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">Payment gateway updated to v2.1</p>
                                    <p className="text-xs text-gray-500">1 day ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">50+ new patient registrations</p>
                                    <p className="text-xs text-gray-500">2 days ago</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">Server maintenance completed</p>
                                    <p className="text-xs text-gray-500">3 days ago</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            Activity Log
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 lg:col-span-2 xl:col-span-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                                <span className="text-2xl mb-2">👤</span>
                                <span className="text-sm font-medium text-indigo-800">Add User</span>
                            </button>

                            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                <span className="text-2xl mb-2">💾</span>
                                <span className="text-sm font-medium text-green-800">Backup</span>
                            </button>

                            <button className="flex flex-col items-center p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                                <span className="text-2xl mb-2">🔧</span>
                                <span className="text-sm font-medium text-red-800">Maintenance</span>
                            </button>

                            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                                <span className="text-2xl mb-2">📊</span>
                                <span className="text-sm font-medium text-purple-800">Analytics</span>
                            </button>
                        </div>
                    </div>

                    {/* Revenue Analytics */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">₹2.4L</p>
                                <p className="text-sm text-green-800">This Month</p>
                                <p className="text-xs text-green-600">+8% from last month</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">₹28.5L</p>
                                <p className="text-sm text-blue-800">This Year</p>
                                <p className="text-xs text-blue-600">+15% YoY growth</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">₹8.2K</p>
                                <p className="text-sm text-purple-800">Avg. Order</p>
                                <p className="text-xs text-purple-600">+3% improvement</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Revenue Report
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Financial Analytics
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Protect this route - only admins can access
export default withAuth(AdminDashboard, { allowedRoles: ['admin'] });