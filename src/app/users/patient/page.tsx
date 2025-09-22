'use client';
import React, { useEffect, useState } from 'react';
import { useAuth, withAuth } from '../../../contexts/AuthContext';
import DietitianCard from '../../../components/dietitianCard';
import { getDietitianProfile } from '../../../lib/dietitian';


type Dietitian = {
    name: string;
    profileImage?: string;
    specialization?: string;
    yearsOfExperience?: number;
    patientsServed?: number;
    isVerified?: boolean;
    rating?: number;
};

const PatientDashboard = () => {
    const { user, signOut } = useAuth();
    const [dietitian, setDietitian] = useState<Dietitian | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDietitian = async () => {
            if (user?.linkedDietitianId) {
                const profile = await getDietitianProfile(user.linkedDietitianId);
                if (profile) {
                    setDietitian(profile);
                } else {
                    setDietitian(null);
                }
            } else {
                setDietitian(null);
            }
            setLoading(false);
        };
        fetchDietitian();
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#EAD9ED]">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-[#EAD9ED]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#5F2C66] rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">Ayurveda</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-600">
                                Welcome, <span className="font-medium">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="px-4 py-2 text-sm font-medium text-[#5F2C66] hover:text-white hover:bg-[#5F2C66] border border-[#5F2C66] rounded-lg transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F2C66] mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading...</p>
                    </div>
                ) : user?.linkedDietitianId && dietitian ? (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-[#5F2C66] mb-2">
                                You have been taken under Dr. {dietitian.name}
                            </h2>
                            <p className="text-gray-600 mb-6">This is your assigned dietitian. You can view their profile below.</p>
                        </div>
                        <DietitianCard
                            name={dietitian.name}
                            profileImage={dietitian.profileImage}
                            specialization={dietitian.specialization || 'Ayurveda Dietitian'}
                            yearsOfExperience={dietitian.yearsOfExperience || 0}
                            patientsServed={dietitian.patientsServed || 0}
                            isVerified={dietitian.isVerified}
                            rating={dietitian.rating}
                        />
                    </div>
                ) : (
                    <div className="text-center mt-16">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">No Dietitian Assigned Yet</h2>
                        <p className="text-gray-500">You have not been accepted or added by any dietitian. Please wait for a dietitian to accept your profile.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

// Protect this route - only patients can access
export default withAuth(PatientDashboard, { allowedRoles: ['patient'] });