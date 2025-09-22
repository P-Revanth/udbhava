import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PatientProfile } from '../types/patient';

interface EditPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    patientName: string;
    onUpdate: (updatedData: Partial<PatientProfile>) => void;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({
    isOpen,
    onClose,
    patientId,
    patientName,
    onUpdate
}) => {
    const [formData, setFormData] = useState<Partial<PatientProfile>>({
        name: patientName,
        age: null,
        gender: null,
        dosha: null,
        agni: null,
        allergies: [],
        medical_conditions: [],
        sleep_schedule: null,
        calorie_needs: null,
        goals: [],
        activeStatus: 'active'
    });
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Fetch existing patient data when modal opens
    useEffect(() => {
        if (isOpen && patientId && initialLoad) {
            fetchPatientData();
            setInitialLoad(false);
        }
    }, [isOpen, patientId, initialLoad]);

    const fetchPatientData = async () => {
        try {
            const patientRef = doc(db, 'patients', patientId);
            const patientSnap = await getDoc(patientRef);

            if (patientSnap.exists()) {
                const data = patientSnap.data() as PatientProfile;
                setFormData({
                    name: data.name || patientName,
                    age: data.age,
                    gender: data.gender,
                    dosha: data.dosha,
                    agni: data.agni,
                    allergies: data.allergies || [],
                    medical_conditions: data.medical_conditions || [],
                    sleep_schedule: data.sleep_schedule,
                    calorie_needs: data.calorie_needs,
                    goals: data.goals || [],
                    activeStatus: data.activeStatus || 'active'
                });
            }
        } catch (error) {
            console.error('Error fetching patient data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const patientRef = doc(db, 'patients', patientId);
            const updateData = {
                ...formData,
                updatedAt: serverTimestamp()
            };

            await updateDoc(patientRef, updateData);
            onUpdate(updateData);
            onClose();
        } catch (error) {
            console.error('Error updating patient:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArrayFieldChange = (field: 'allergies' | 'medical_conditions' | 'goals', value: string) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...(prev[field] || []), value.trim()]
            }));
        }
    };

    const removeArrayItem = (field: 'allergies' | 'medical_conditions' | 'goals', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, i) => i !== index)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Patient Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                                type="number"
                                value={formData.age || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                placeholder="Enter age"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                value={formData.gender || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' | null }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Ayurvedic Assessment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosha Type</label>
                            <select
                                value={formData.dosha || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, dosha: e.target.value as any }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select dosha</option>
                                <option value="Vata">Vata</option>
                                <option value="Pitta">Pitta</option>
                                <option value="Kapha">Kapha</option>
                                <option value="Vata-Pitta">Vata-Pitta</option>
                                <option value="Pitta-Kapha">Pitta-Kapha</option>
                                <option value="Vata-Kapha">Vata-Kapha</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Agni</label>
                            <select
                                value={formData.agni || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, agni: e.target.value as any }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select agni</option>
                                <option value="Sama">Sama</option>
                                <option value="Tikshna">Tikshna</option>
                                <option value="Manda">Manda</option>
                                <option value="Vishama">Vishama</option>
                            </select>
                        </div>
                    </div>

                    {/* Calorie Needs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Calorie Needs</label>
                        <input
                            type="number"
                            value={formData.calorie_needs || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, calorie_needs: e.target.value ? parseInt(e.target.value) : null }))}
                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            placeholder="Enter daily calorie needs"
                        />
                    </div>

                    {/* Sleep Schedule */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Schedule</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Bedtime</label>
                                <input
                                    type="time"
                                    value={formData.sleep_schedule?.bedtime || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        sleep_schedule: {
                                            ...prev.sleep_schedule,
                                            bedtime: e.target.value || null,
                                            wake_time: prev.sleep_schedule?.wake_time || null,
                                            sleep_quality: prev.sleep_schedule?.sleep_quality || null
                                        }
                                    }))}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Wake Time</label>
                                <input
                                    type="time"
                                    value={formData.sleep_schedule?.wake_time || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        sleep_schedule: {
                                            ...prev.sleep_schedule,
                                            bedtime: prev.sleep_schedule?.bedtime || null,
                                            wake_time: e.target.value || null,
                                            sleep_quality: prev.sleep_schedule?.sleep_quality || null
                                        }
                                    }))}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Sleep Quality</label>
                                <select
                                    value={formData.sleep_schedule?.sleep_quality || ''}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        sleep_schedule: {
                                            ...prev.sleep_schedule,
                                            bedtime: prev.sleep_schedule?.bedtime || null,
                                            wake_time: prev.sleep_schedule?.wake_time || null,
                                            sleep_quality: e.target.value as any || null
                                        }
                                    }))}
                                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                >
                                    <option value="">Select quality</option>
                                    <option value="poor">Poor</option>
                                    <option value="fair">Fair</option>
                                    <option value="good">Good</option>
                                    <option value="excellent">Excellent</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient Status</label>
                        <select
                            value={formData.activeStatus || 'active'}
                            onChange={(e) => setFormData(prev => ({ ...prev, activeStatus: e.target.value as 'active' | 'not active' }))}
                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                        >
                            <option value="active">Active - Currently being served</option>
                            <option value="not active">Not Active - Service completed</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Active patients will appear in the dashboard's recent active patients section
                        </p>
                    </div>

                    {/* Array Fields */}
                    {(['allergies', 'medical_conditions', 'goals'] as const).map((field) => (
                        <div key={field}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                            <div className="space-y-2">
                                {(formData[field] || []).map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">{item}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem(field, index)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder={`Add ${field.replace(/_/g, ' ').slice(0, -1)}`}
                                        className="flex-1 px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = e.target as HTMLInputElement;
                                                handleArrayFieldChange(field, input.value);
                                                input.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                                            handleArrayFieldChange(field, input.value);
                                            input.value = '';
                                        }}
                                        className="px-3 py-2 bg-[#5F2C66] text-white rounded-lg hover:bg-[#4A1F4F] transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-[#5F2C66] text-white rounded-xl hover:bg-[#4A1F4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPatientModal;