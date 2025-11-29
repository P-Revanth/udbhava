/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PatientProfile, CUISINE_SUB_OPTIONS, DOSHA_ASSESSMENT_OPTIONS } from '../types/patient';

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
        weight_kg: null,
        height_cm: null,
        activity_level: null,
        food_preference: null,
        cuisine_preference: null,
        sub_cuisine_preference: null,
        diseases: [],
        body_frame: null,
        skin_type: null,
        hair_type: null,
        agni_strength: null,
        current_season: null,
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
                    weight_kg: data.weight_kg,
                    height_cm: data.height_cm,
                    activity_level: data.activity_level,
                    food_preference: data.food_preference,
                    cuisine_preference: data.cuisine_preference,
                    sub_cuisine_preference: data.sub_cuisine_preference,
                    diseases: data.diseases || [],
                    body_frame: data.body_frame,
                    skin_type: data.skin_type,
                    hair_type: data.hair_type,
                    agni_strength: data.agni_strength,
                    current_season: data.current_season,
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

    const handleArrayFieldChange = (field: 'diseases', value: string) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...(prev[field] || []), value.trim()]
            }));
        }
    };

    const removeArrayItem = (field: 'diseases', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, i) => i !== index)
        }));
    };

    // Get sub-cuisine options based on selected cuisine
    const getSubCuisineOptions = () => {
        if (!formData.cuisine_preference) return [];
        return CUISINE_SUB_OPTIONS[formData.cuisine_preference] || [];
    };

    // Handle dosha assessment question changes
    const handleAssessmentChange = (field: 'body_frame' | 'skin_type' | 'hair_type', option: 'a' | 'b' | 'c') => {
        const assessmentData = DOSHA_ASSESSMENT_OPTIONS[field][option];
        setFormData(prev => ({
            ...prev,
            [field]: {
                option: option,
                description: assessmentData.description
            }
        }));
    };

    // Get current option value for assessment fields
    const getAssessmentValue = (field: 'body_frame' | 'skin_type' | 'hair_type') => {
        const value = formData[field];
        return value && typeof value === 'object' ? value.option : '';
    };

    // Handle cuisine preference change - reset sub-cuisine when cuisine changes
    const handleCuisineChange = (cuisine: string) => {
        setFormData(prev => ({
            ...prev,
            cuisine_preference: cuisine as any,
            sub_cuisine_preference: null // Reset sub-cuisine when cuisine changes
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                value={formData.weight_kg || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: e.target.value ? parseInt(e.target.value) : null }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                placeholder="Enter weight in kg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <input
                                type="number"
                                value={formData.height_cm || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, height_cm: e.target.value ? parseInt(e.target.value) : null }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                placeholder="Enter height in cm"
                            />
                        </div>
                    </div>

                    {/* Activity Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                        <select
                            value={formData.activity_level || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, activity_level: e.target.value as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null }))}
                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                        >
                            <option value="">Select activity level</option>
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light</option>
                            <option value="moderate">Moderate</option>
                            <option value="active">Active</option>
                            <option value="very_active">Very Active</option>
                        </select>
                    </div>

                    {/* Food Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Food Preference</label>
                            <select
                                value={formData.food_preference || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, food_preference: e.target.value as 'vegetarian' | 'non_vegetarian' | null }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select food preference</option>
                                <option value="vegetarian">Vegetarian</option>
                                <option value="non_vegetarian">Non-Vegetarian</option>
                            </select>
                        </div>
                    </div>

                    {/* Cuisine Preferences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Preference</label>
                            <select
                                value={formData.cuisine_preference || ''}
                                onChange={(e) => handleCuisineChange(e.target.value)}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select cuisine preference</option>
                                <option value="indian">Indian</option>
                                <option value="asian">Asian</option>
                                <option value="mediterranean">Mediterranean</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Cuisine Preference</label>
                            <select
                                value={formData.sub_cuisine_preference || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, sub_cuisine_preference: e.target.value || null }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                disabled={!formData.cuisine_preference}
                            >
                                <option value="">Select sub-cuisine</option>
                                {getSubCuisineOptions().map((subCuisine: string) => (
                                    <option key={subCuisine} value={subCuisine}>
                                        {subCuisine}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Ayurvedic Assessment Questions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Ayurvedic Assessment</h3>

                        {/* Body Frame Question */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">1. Body Frame</label>
                            <select
                                value={getAssessmentValue('body_frame')}
                                onChange={(e) => handleAssessmentChange('body_frame', e.target.value as 'a' | 'b' | 'c')}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select body frame</option>
                                <option value="a">a) Thin, Tall</option>
                                <option value="b">b) Medium build</option>
                                <option value="c">c) Well-built</option>
                            </select>
                        </div>

                        {/* Skin Type Question */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">2. Skin</label>
                            <select
                                value={getAssessmentValue('skin_type')}
                                onChange={(e) => handleAssessmentChange('skin_type', e.target.value as 'a' | 'b' | 'c')}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select skin type</option>
                                <option value="a">a) Dry, Rough</option>
                                <option value="b">b) Oily, Inflamed</option>
                                <option value="c">c) Thick, Cool</option>
                            </select>
                        </div>

                        {/* Hair Type Question */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">3. Hair</label>
                            <select
                                value={getAssessmentValue('hair_type')}
                                onChange={(e) => handleAssessmentChange('hair_type', e.target.value as 'a' | 'b' | 'c')}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select hair type</option>
                                <option value="a">a) Dry, Thin</option>
                                <option value="b">b) Oily, Early greying</option>
                                <option value="c">c) Thick, Wavy</option>
                            </select>
                        </div>
                    </div>

                    {/* Additional Ayurvedic Assessment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Agni Strength</label>
                            <select
                                value={formData.agni_strength || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, agni_strength: e.target.value as 'low' | 'moderate' | 'high' | 'irregular' | null }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select agni strength</option>
                                <option value="low">Low</option>
                                <option value="moderate">Moderate</option>
                                <option value="high">High</option>
                                <option value="irregular">Irregular</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Season</label>
                            <select
                                value={formData.current_season || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, current_season: e.target.value as 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' | 'late_winter' | null }))}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="">Select current season</option>
                                <option value="spring">Spring</option>
                                <option value="summer">Summer</option>
                                <option value="monsoon">Monsoon</option>
                                <option value="autumn">Autumn</option>
                                <option value="winter">Winter</option>
                                <option value="late_winter">Late Winter</option>
                            </select>
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
                            Active patients will appear in the dashboard&apos;s recent active patients section
                        </p>
                    </div>

                    {/* Diseases */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diseases / Medical Conditions</label>
                        <div className="space-y-2">
                            {(formData.diseases || []).map((disease, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">{disease}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem('diseases', index)}
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
                                    placeholder="Add disease or medical condition"
                                    className="flex-1 px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.target as HTMLInputElement;
                                            handleArrayFieldChange('diseases', input.value);
                                            input.value = '';
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                                        handleArrayFieldChange('diseases', input.value);
                                        input.value = '';
                                    }}
                                    className="px-3 py-2 bg-[#5F2C66] text-white rounded-lg hover:bg-[#4A1F4F] transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

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