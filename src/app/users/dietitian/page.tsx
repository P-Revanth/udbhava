'use client';
import React, { useEffect, useState } from 'react';
import { useAuth, withAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import PatientCard from '../../../components/patientCard';
import { PatientProfile } from '../../../types/patient';

interface Patient {
    uid: string;
    name: string;
    email: string;
    role: string;
    age?: number;
    doshaType?: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha';
    agni?: 'Sama' | 'Tikshna' | 'Manda' | 'Vishama';
    profileImage?: string;
    createdAt?: any;
}

const DietitianDashboard = () => {
    const { user, signOut } = useAuth();
    const [patientCount, setPatientCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [allPatients, setAllPatients] = useState<Patient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
    const [activePatients, setActivePatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [addingPatient, setAddingPatient] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all patients
                const patientsQuery = query(collection(db, 'users'), where('role', '==', 'patient'));
                const patientsSnapshot = await getDocs(patientsQuery);

                const patients: Patient[] = patientsSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data(),
                    // Add default Ayurvedic properties if not present
                    doshaType: doc.data().doshaType || 'Vata',
                    agni: doc.data().agni || 'Sama',
                    age: doc.data().age || Math.floor(Math.random() * 40) + 20, // Random age between 20-60
                } as Patient));

                setAllPatients(patients);
                setFilteredPatients(patients);
                setPatientCount(patients.length);

                // Fetch dietitian's active patients
                if (user?.linkedPatientIds && Array.isArray(user.linkedPatientIds) && user.linkedPatientIds.length > 0) {
                    const activePatientsList = patients.filter(patient =>
                        user.linkedPatientIds!.includes(patient.uid)
                    );
                    setActivePatients(activePatientsList);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setPatientCount(45); // Fallback
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    // Search functionality
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredPatients(allPatients);
            return;
        }

        const filtered = allPatients.filter(patient => {
            const searchLower = searchQuery.toLowerCase();
            return (
                patient.name.toLowerCase().includes(searchLower) ||
                patient.doshaType?.toLowerCase().includes(searchLower) ||
                patient.agni?.toLowerCase().includes(searchLower) ||
                patient.email.toLowerCase().includes(searchLower)
            );
        });

        setFilteredPatients(filtered);
    }, [searchQuery, allPatients]);

    // Helper function to check if patient is already added to dietitian
    const isPatientAdded = (patientId: string): boolean => {
        return user?.linkedPatientIds?.includes(patientId) || false;
    };

    // Handle adding patient to dietitian's list
    const handleAddPatient = async (patientId: string) => {
        if (!user || !user.uid || isPatientAdded(patientId)) return;

        setAddingPatient(patientId);
        try {
            // Update dietitian document
            const dietitianRef = doc(db, 'users', user.uid);
            await updateDoc(dietitianRef, {
                linkedPatientIds: arrayUnion(patientId)
            });

            // Update patient document with dietitian ID
            const patientRef = doc(db, 'users', patientId);
            await updateDoc(patientRef, {
                linkedDietitianId: user.uid
            });

            // Create patient profile in patients collection
            const patientsRef = doc(db, 'patients', patientId);
            const patientData = allPatients.find(p => p.uid === patientId);

            if (patientData) {
                const patientProfile: PatientProfile = {
                    name: patientData.name,
                    age: null,
                    gender: null,
                    dosha: null,
                    agni: null,
                    allergies: [],
                    medical_conditions: [],
                    sleep_schedule: null,
                    calorie_needs: null,
                    goals: [],
                    assignedDietitianId: user.uid,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                await setDoc(patientsRef, patientProfile);
            }

            // Update local active patients list
            const patientToAdd = allPatients.find(p => p.uid === patientId);
            if (patientToAdd) {
                setActivePatients(prev => [...prev, patientToAdd]);
            }

            console.log('Patient added successfully');
        } catch (error) {
            console.error('Error adding patient:', error);
            // If updating patients collection fails, it's okay since it might not exist yet
            // We'll create it with setDoc
            try {
                const patientsRef = doc(db, 'patients', patientId);
                const patientData = allPatients.find(p => p.uid === patientId);

                if (patientData) {
                    const patientProfile: PatientProfile = {
                        name: patientData.name,
                        age: null,
                        gender: null,
                        dosha: null,
                        agni: null,
                        allergies: [],
                        medical_conditions: [],
                        sleep_schedule: null,
                        calorie_needs: null,
                        goals: [],
                        assignedDietitianId: user.uid,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };

                    await setDoc(patientsRef, patientProfile);
                }
            } catch (secondError) {
                console.error('Error creating patient profile:', secondError);
            }
        } finally {
            setAddingPatient(null);
        }
    }; const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#EAD9ED]">
            {/* NavBar */}
            <nav className="flex h-25 w-full justify-between items-center p-5 shadow-md">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Left Navigation */}
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard'
                                        ? 'bg-blue-50 text-[#5F2C66]'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                    <span>Dashboard</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('patients')}
                                    className={`font-medium px-3 py-2 rounded-lg transition-colors ${activeTab === 'patients'
                                        ? 'bg-blue-50 text-[#5F2C66]'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Patients
                                </button>
                                <button
                                    onClick={() => setActiveTab('your-patients')}
                                    className={`font-medium px-3 py-2 rounded-lg transition-colors ${activeTab === 'your-patients'
                                        ? 'bg-blue-50 text-[#5F2C66]'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Your Patients
                                </button>
                                <button
                                    onClick={() => setActiveTab('activity')}
                                    className={`font-medium px-3 py-2 rounded-lg transition-colors ${activeTab === 'activity'
                                        ? 'bg-blue-50 text-[#5F2C66]'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    Activity
                                </button>
                            </div>
                        </div>

                        {/* Center Logo */}
                        <div className="flex-1 flex justify-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-[#5F2C66] rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">A</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">Ayurveda</span>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search patients by name, dosha, or agni..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-80 pl-10 pr-4 py-2 border text-black border-gray-400 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            {/* Notifications */}
                            {/* <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.405-3.405A2.032 2.032 0 0118 11.158V8a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m8 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                            </button> */}

                            {/* User Profile */}
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <button
                                        onClick={handleSignOut}
                                        className="w-10 h-10 bg-[#EAD9ED] border-2 border-[#5F2C66] rounded-full flex items-center justify-center hover:bg-[#d89ee0] transition-colors cursor-pointer"
                                    >
                                        <span className="text-[#5F2C66] font-medium text-sm">
                                            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AS'}
                                        </span>
                                    </button>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium text-gray-900">{user?.name || 'Abraham Smith'}</span>
                                    <span className="text-xs text-gray-500">Dietitian</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {activeTab === 'dashboard' && (
                    <>
                        {/* Dashboard Header */}
                        <div className="flex flex-col mb-8">
                            <h2 className="text-5xl font-bold text-gray-900 mb-2">
                                Welcome {user?.name ? user.name.split(' ')[0] : 'Doctor'},
                            </h2>
                        </div>

                        {/* Stats Cards */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
                            <div className='flex bg-white p-4 pr-6 pl-6 rounded-2xl shadow-md justify-between'>
                                <div className='flex flex-col space-x-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>Total Patients:</h3>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {loading ? '...' : patientCount}
                                    </p>
                                </div>
                                <img src="/group.svg" alt="total" className='w-12 h-12 mt-2' />
                            </div>
                            <div className='flex bg-white p-4 pr-6 pl-6 rounded-2xl shadow-md justify-between'>
                                <div className='flex flex-col space-x-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>Your Patients:</h3>
                                    <p className='text-2xl font-bold text-gray-900'>{activePatients.length}</p>
                                </div>
                                <img src="/active.svg" alt="active" className='w-12 h-12 mt-2' />
                            </div>
                            <div className='flex bg-white p-4 pr-6 pl-6 rounded-2xl shadow-md justify-between'>
                                <div className='flex flex-col space-x-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>New Messages:</h3>
                                    <p className='text-2xl font-bold text-gray-900'>7</p>
                                </div>
                                <img src="/new-msg.svg" alt="messages" className='w-12 h-12 mt-2' />
                            </div>
                            <div className='flex bg-white p-4 pr-6 pl-6 rounded-2xl shadow-md justify-between'>
                                <div className='flex flex-col space-x-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>Pending Diet-Charts:</h3>
                                    <p className='text-2xl font-bold text-gray-900'>3</p>
                                </div>
                                <img src="/pending.svg" alt="pending" className='w-12 h-12 mt-2' />
                            </div>
                        </div>

                        {/* Recent Active Patients */}
                        <div className='flex flex-col'>
                            <h1 className='text-3xl font-bold text-gray-900 mb-6'>Recent Active Patients</h1>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {activePatients.slice(0, 4).map((patient) => (
                                    <PatientCard
                                        key={patient.uid}
                                        name={patient.name}
                                        profileImage={patient.profileImage}
                                        isAddedToDietitian={true}
                                        onClick={() => console.log(`View ${patient.name} profile`)}
                                    />
                                ))}
                                {activePatients.length === 0 && (
                                    <div className="col-span-full text-center py-12">
                                        <p className="text-gray-500 text-lg">No active patients yet. Start by adding patients from the "Patients" tab.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'patients' && (
                    <div className='flex flex-col'>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className='text-3xl font-bold text-gray-900'>All Patients</h1>
                            <p className="text-gray-600">
                                Showing {filteredPatients.length} of {allPatients.length} patients
                            </p>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F2C66] mx-auto"></div>
                                <p className="text-gray-500 mt-4">Loading patients...</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {filteredPatients.map((patient) => (
                                    <PatientCard
                                        key={patient.uid}
                                        name={patient.name}
                                        profileImage={patient.profileImage}
                                        isAddedToDietitian={isPatientAdded(patient.uid)}
                                        isLoading={addingPatient === patient.uid}
                                        onClick={() => console.log(`View ${patient.name} profile`)}
                                        onAddToDietitian={() => handleAddPatient(patient.uid)}
                                    />
                                ))}
                                {filteredPatients.length === 0 && !loading && (
                                    <div className="col-span-full text-center py-12">
                                        <p className="text-gray-500 text-lg">
                                            {searchQuery ? `No patients found matching "${searchQuery}"` : 'No patients available'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'your-patients' && (
                    <div className='flex flex-col'>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className='text-3xl font-bold text-gray-900'>Your Patients</h1>
                            <p className="text-gray-600">
                                {activePatients.length} patients under your care
                            </p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                            {activePatients.map((patient) => (
                                <PatientCard
                                    key={patient.uid}
                                    name={patient.name}
                                    profileImage={patient.profileImage}
                                    isAddedToDietitian={true}
                                    onClick={() => console.log(`View ${patient.name} profile`)}
                                />
                            ))}
                            {activePatients.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 text-lg">No patients added yet. Go to "Patients" tab to add patients to your care.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className='flex flex-col'>
                        <h1 className='text-3xl font-bold text-gray-900 mb-6'>Activity Feed</h1>
                        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                            <p className="text-gray-500 text-lg">Activity feed coming soon...</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// Protect this route - only dietitians can access
export default withAuth(DietitianDashboard, { allowedRoles: ['dietitian'] });