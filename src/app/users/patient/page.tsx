'use client';
import React, { useEffect, useState } from 'react';
import { useAuth, withAuth } from '../../../contexts/AuthContext';
import DietitianCard from '../../../components/dietitianCard';
import { getDietitianProfile } from '../../../lib/dietitian';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

type Dietitian = {
    name: string;
    profileImage?: string;
    specialization?: string;
    yearsOfExperience?: number;
    patientsServed?: number;
    isVerified?: boolean;
    rating?: number;
};

interface Recipe {
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    ingredients?: string[];
    instructions?: string[];
    ayurvedic_properties?: {
        dosha_effect?: string;
    };
    cuisine?: string;
    sub_cuisine?: string;
    meal_type?: string;
    is_veg?: boolean;
    gunas?: string[];
    rasa?: string[];
    virya?: string;
    seasonal_suitability?: string;
}

interface Meal {
    type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    recipes: Recipe[];
    totalCalories: number;
    totalProtein: number;
    totalFat: number;
    totalCarbs: number;
}

interface DietPlan {
    patientId: string;
    patientName: string;
    plan?: {
        meals: Meal[];
        dailyCalories: number;
        dailyProtein: number;
        dailyFat: number;
        dailyCarbs: number;
        recommendations?: string[];
        restrictions?: string[];
    };
    chart_url?: string;
    createdAt?: any;
}

const PatientDashboard = () => {
    const { user, signOut } = useAuth();
    const [dietitian, setDietitian] = useState<Dietitian | null>(null);
    const [loading, setLoading] = useState(true);
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [loadingDietPlan, setLoadingDietPlan] = useState(false);

    // Feedback states
    const [dietitianFeedback, setDietitianFeedback] = useState('');
    const [dietChartFeedback, setDietChartFeedback] = useState('');
    const [mealPlanFeedback, setMealPlanFeedback] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const fetchData = async () => {
            if (user?.linkedDietitianId) {
                // Fetch dietitian profile
                const profile = await getDietitianProfile(user.linkedDietitianId);
                if (profile) {
                    setDietitian(profile);
                }

                // Set up real-time listener for published diet plan
                unsubscribe = await fetchDietPlan();
            }
            setLoading(false);
        };

        fetchData();

        // Cleanup function
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    const fetchDietPlan = async () => {
        if (!user?.uid) return;

        setLoadingDietPlan(true);
        try {
            const dietPlansRef = collection(db, 'patients', user.uid, 'diet_plans');
            const q = query(dietPlansRef, where('published', '==', true));

            // Set up real-time listener for published diet plans
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    // Sort documents by publishedAt in JavaScript to avoid composite index requirement
                    const sortedDocs = snapshot.docs.sort((a, b) => {
                        const aTime = a.data().publishedAt?.toDate?.() || new Date(0);
                        const bTime = b.data().publishedAt?.toDate?.() || new Date(0);
                        return bTime.getTime() - aTime.getTime(); // Descending order (newest first)
                    });

                    const latestDietPlan = sortedDocs[0];
                    const data = latestDietPlan.data();

                    // Debug: Log the actual data structure
                    console.log('Raw Diet Plan Data Structure:', data);

                    // Transform the Firestore data to match our display structure
                    const transformedData = transformFirestoreDietPlan(data, user.uid, user.name || 'Patient');

                    console.log('Transformed Diet Plan Data:', transformedData);

                    setDietPlan(transformedData);
                } else {
                    setDietPlan(null);
                }
                setLoadingDietPlan(false);
            });

            // Return cleanup function
            return unsubscribe;
        } catch (error) {
            console.error('Error fetching diet plan:', error);
            setLoadingDietPlan(false);
        }
    };

    // Transform Firestore data structure to match our display interface
    const transformFirestoreDietPlan = (firestoreData: any, patientId: string, patientName: string) => {
        const transformedPlan: DietPlan = {
            patientId,
            patientName,
            chart_url: firestoreData.chart_url || null,
            createdAt: firestoreData.createdAt,
            plan: undefined
        };

        if (firestoreData.plan) {
            // Group recipes by meal type
            const mealGroups: { [key: string]: any[] } = {};

            // Extract all recipes from the plan structure
            Object.keys(firestoreData.plan).forEach(key => {
                if (Array.isArray(firestoreData.plan[key])) {
                    // Handle meal arrays like "Breakfast", "Lunch", "Dinner", "Snack"
                    const mealType = key;
                    if (!mealGroups[mealType]) {
                        mealGroups[mealType] = [];
                    }
                    mealGroups[mealType] = firestoreData.plan[key];
                }
            });

            // Transform to our meal structure
            const meals = Object.keys(mealGroups).map(mealType => {
                const recipes = mealGroups[mealType].map((recipe: any) => ({
                    name: recipe.name || 'Unknown Recipe',
                    calories: recipe.calories || 0,
                    protein: recipe.protein || 0,
                    fat: recipe.fat || 0,
                    carbs: recipe.carbs || 0,
                    fiber: recipe.fiber || 0,
                    ingredients: recipe.ingredients || [],
                    instructions: recipe.instructions || [],
                    ayurvedic_properties: recipe.ayurvedic_properties || {},
                    cuisine: recipe.cuisine || '',
                    sub_cuisine: recipe.sub_cuisine || '',
                    meal_type: recipe.meal_type || mealType,
                    is_veg: recipe.is_veg !== undefined ? recipe.is_veg : true,
                    gunas: recipe.gunas || [],
                    rasa: recipe.rasa || [],
                    virya: recipe.virya || '',
                    seasonal_suitability: recipe.seasonal_suitability || ''
                }));

                const totalCalories = recipes.reduce((sum: number, recipe: any) => sum + recipe.calories, 0);
                const totalProtein = recipes.reduce((sum: number, recipe: any) => sum + recipe.protein, 0);
                const totalFat = recipes.reduce((sum: number, recipe: any) => sum + recipe.fat, 0);
                const totalCarbs = recipes.reduce((sum: number, recipe: any) => sum + recipe.carbs, 0);

                return {
                    type: mealType as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack',
                    recipes,
                    totalCalories,
                    totalProtein,
                    totalFat,
                    totalCarbs
                };
            });

            const dailyCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
            const dailyProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
            const dailyFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);
            const dailyCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);

            transformedPlan.plan = {
                meals,
                dailyCalories,
                dailyProtein,
                dailyFat,
                dailyCarbs,
                recommendations: [
                    'Follow the prescribed meal timings',
                    'Chew food slowly and mindfully',
                    'Avoid drinking cold water with meals',
                    'Practice gratitude before eating'
                ]
            };
        }

        return transformedPlan;
    };

    const getMealOrder = (mealType: string) => {
        switch (mealType) {
            case 'Breakfast': return 1;
            case 'Lunch': return 2;
            case 'Snack': return 3;
            case 'Dinner': return 4;
            default: return 5;
        }
    };

    const getMealIcon = (mealType: string) => {
        switch (mealType) {
            case 'Breakfast':
                return '🌅';
            case 'Lunch':
                return '☀️';
            case 'Dinner':
                return '🌙';
            case 'Snack':
                return '🍎';
            default:
                return '🍽️';
        }
    };

    const getMealColors = (mealType: string) => {
        switch (mealType) {
            case 'Breakfast':
                return {
                    header: 'bg-[#EAD9ED]',
                    border: 'border-[#5F2C66]',
                    text: 'text-[#5F2C66]'
                };
            case 'Lunch':
                return {
                    header: 'bg-[#d89ee0]',
                    border: 'border-[#5F2C66]',
                    text: 'text-[#5F2C66]'
                };
            case 'Dinner':
                return {
                    header: 'bg-[#c48cc4]',
                    border: 'border-[#5F2C66]',
                    text: 'text-[#5F2C66]'
                };
            case 'Snack':
                return {
                    header: 'bg-[#b78bb7]',
                    border: 'border-[#5F2C66]',
                    text: 'text-[#5F2C66]'
                };
            default:
                return {
                    header: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-900'
                };
        }
    };

    const submitDietitianFeedback = async () => {
        if (!dietitianFeedback.trim() || !user?.linkedDietitianId) return;

        setSubmittingFeedback('dietitian');
        try {
            // Update dietitian document with patient feedback
            const dietitianRef = doc(db, 'users', user.linkedDietitianId);
            await updateDoc(dietitianRef, {
                patient_feedback: arrayUnion({
                    patientId: user.uid,
                    patientName: user.name,
                    feedback: dietitianFeedback,
                    rating: 5, // You can add a rating system
                    createdAt: serverTimestamp()
                })
            });

            // Also create a centralized feedback document for analytics
            const feedbackRef = doc(collection(db, 'feedback'));
            await setDoc(feedbackRef, {
                type: 'dietitian_feedback',
                dietitianId: user.linkedDietitianId,
                patientId: user.uid,
                patientName: user.name,
                feedback: dietitianFeedback,
                createdAt: serverTimestamp()
            });

            setDietitianFeedback('');
            alert('Feedback submitted successfully!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setSubmittingFeedback(null);
        }
    };

    const submitDietPlanFeedback = async (type: 'chart' | 'meal_plan') => {
        const feedback = type === 'chart' ? dietChartFeedback : mealPlanFeedback;
        if (!feedback.trim() || !dietPlan) return;

        setSubmittingFeedback(type);
        try {
            // Create feedback document
            const feedbackRef = doc(collection(db, 'feedback'));
            await setDoc(feedbackRef, {
                type: `diet_${type}_feedback`,
                dietitianId: user?.linkedDietitianId,
                patientId: user?.uid,
                patientName: user?.name,
                feedback: feedback,
                createdAt: serverTimestamp()
            });

            // Update diet plan document with feedback
            const dietPlansRef = collection(db, 'patients', user!.uid, 'diet_plans');
            const q = query(dietPlansRef, where('published', '==', true));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const dietPlanDoc = snapshot.docs[0];
                await updateDoc(dietPlanDoc.ref, {
                    [`feedback.${type}`]: arrayUnion({
                        feedback: feedback,
                        createdAt: serverTimestamp()
                    })
                });
            }

            if (type === 'chart') {
                setDietChartFeedback('');
            } else {
                setMealPlanFeedback('');
            }
            alert('Feedback submitted successfully!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setSubmittingFeedback(null);
        }
    };

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
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-[#EAD9ED]">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <img src="/images/logo.png" alt="Logo" className="w-10 h-10" />
                            <h1 className="text-xl font-semibold text-gray-900">AYURAAHARYA</h1>
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
            <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F2C66] mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading...</p>
                    </div>
                ) : user?.linkedDietitianId && dietitian ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
                        {/* Left Column - Dietitian Details & Feedback */}
                        <div className="lg:col-span-3 space-y-6 overflow-y-auto">
                            {/* Dietitian Details */}
                            <div className="bg-white rounded-lg shadow-lg p-4">
                                <h2 className="text-lg font-bold text-[#5F2C66] mb-3">Your Dietitian</h2>
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

                            {/* Dietitian Feedback */}
                            <div className="bg-white rounded-lg shadow-lg p-4">
                                <h3 className="text-base font-semibold text-[#5F2C66] mb-3">Feedback for Dr. {dietitian.name}</h3>
                                <textarea
                                    value={dietitianFeedback}
                                    onChange={(e) => setDietitianFeedback(e.target.value)}
                                    placeholder="Share your experience with your dietitian..."
                                    className="w-full h-24 p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent resize-none text-sm"
                                />
                                <button
                                    onClick={submitDietitianFeedback}
                                    disabled={!dietitianFeedback.trim() || submittingFeedback === 'dietitian'}
                                    className="mt-2 w-full bg-[#5F2C66] text-white py-1.5 px-3 rounded-lg hover:bg-[#4a1f52] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                    {submittingFeedback === 'dietitian' ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </div>

                        {/* Middle Column - Meal Plan with Scroll */}
                        <div className="h-full overflow-scroll lg:col-span-5">
                            <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
                                <div className="p-4 border-b flex-shrink-0">
                                    <h2 className="text-xl font-bold text-[#5F2C66]">Your Meal Plan</h2>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                    {loadingDietPlan ? (
                                        <div className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F2C66] mx-auto"></div>
                                            <p className="text-gray-500 mt-4">Loading meal plan...</p>
                                        </div>
                                    ) : dietPlan?.plan ? (
                                        <div className="space-y-6">
                                            {/* Daily Summary */}
                                            <div className="bg-gradient-to-r from-[#EAD9ED] to-[#d89ee0] rounded-xl p-4 border border-[#5F2C66]">
                                                <h4 className="font-semibold text-[#5F2C66] mb-3">Daily Nutritional Summary</h4>
                                                <div className="grid grid-cols-4 gap-4 text-center">
                                                    <div>
                                                        <p className="text-2xl font-bold text-[#5F2C66]">{dietPlan.plan.dailyCalories?.toFixed(2) || '0.00'}</p>
                                                        <p className="text-sm text-gray-700">Calories</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-[#5F2C66]">{dietPlan.plan.dailyProtein?.toFixed(2) || '0.00'}g</p>
                                                        <p className="text-sm text-gray-700">Protein</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-[#5F2C66]">{dietPlan.plan.dailyFat?.toFixed(2) || '0.00'}g</p>
                                                        <p className="text-sm text-gray-700">Fat</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-[#5F2C66]">{dietPlan.plan.dailyCarbs?.toFixed(2) || '0.00'}g</p>
                                                        <p className="text-sm text-gray-700">Carbs</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meals */}
                                            {dietPlan.plan.meals && dietPlan.plan.meals.length > 0 ? (
                                                dietPlan.plan.meals
                                                    .sort((a, b) => getMealOrder(a.type) - getMealOrder(b.type))
                                                    .map((meal, mealIndex) => {
                                                        const mealColors = getMealColors(meal.type);
                                                        return (
                                                            <div key={mealIndex} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                                <div className={`${mealColors.header} px-6 py-4 border-b ${mealColors.border}`}>
                                                                    <h4 className={`text-lg font-semibold ${mealColors.text} flex items-center`}>
                                                                        <span className="mr-3 text-2xl">{getMealIcon(meal.type)}</span>
                                                                        {meal.type}
                                                                        <span className="ml-auto text-sm font-normal text-gray-700">
                                                                            {meal.totalCalories} cal
                                                                        </span>
                                                                    </h4>
                                                                </div>

                                                                <div className="p-6">
                                                                    <div className="space-y-4">
                                                                        {meal.recipes.map((recipe, recipeIndex) => (
                                                                            <div key={recipeIndex} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                                                <div className="flex justify-between items-start mb-3">
                                                                                    <h5 className="font-medium text-gray-900">{recipe.name}</h5>
                                                                                    <span className="text-sm text-gray-600 font-medium">{recipe.calories} cal</span>
                                                                                </div>

                                                                                {/* Nutrition Info */}
                                                                                <div className="flex flex-wrap gap-3 mb-3">
                                                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                                        Protein: {recipe.protein}g
                                                                                    </span>
                                                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                                                        Fat: {recipe.fat}g
                                                                                    </span>
                                                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                                                        Carbs: {recipe.carbs}g
                                                                                    </span>
                                                                                    {recipe.fiber && (
                                                                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                                                            Fiber: {recipe.fiber}g
                                                                                        </span>
                                                                                    )}
                                                                                    {recipe.is_veg !== undefined && (
                                                                                        <span className={`px-2 py-1 text-xs rounded-full ${recipe.is_veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                                            {recipe.is_veg ? '🌿 Veg' : '🥩 Non-Veg'}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {/* Ayurvedic Properties */}
                                                                                {(recipe.ayurvedic_properties?.dosha_effect || recipe.gunas || recipe.rasa || recipe.virya || recipe.seasonal_suitability) && (
                                                                                    <div className="mb-3 p-2 bg-orange-50 rounded-lg">
                                                                                        <p className="text-sm font-medium text-orange-800 mb-2">🕉️ Ayurvedic Properties:</p>
                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            {recipe.ayurvedic_properties?.dosha_effect && (
                                                                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                                                                    {recipe.ayurvedic_properties.dosha_effect}
                                                                                                </span>
                                                                                            )}
                                                                                            {recipe.virya && (
                                                                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                                                                    Virya: {recipe.virya}
                                                                                                </span>
                                                                                            )}
                                                                                            {recipe.gunas && recipe.gunas.length > 0 && (
                                                                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                                                                    Gunas: {recipe.gunas.join(', ')}
                                                                                                </span>
                                                                                            )}
                                                                                            {recipe.rasa && recipe.rasa.length > 0 && (
                                                                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                                                                    Rasa: {recipe.rasa.join(', ')}
                                                                                                </span>
                                                                                            )}
                                                                                            {recipe.seasonal_suitability && (
                                                                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                                                                                    Season: {recipe.seasonal_suitability}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Cuisine Info */}
                                                                                {(recipe.cuisine || recipe.sub_cuisine) && (
                                                                                    <div className="mb-3">
                                                                                        <div className="flex gap-2">
                                                                                            {recipe.cuisine && (
                                                                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                                                                    {recipe.cuisine}
                                                                                                </span>
                                                                                            )}
                                                                                            {recipe.sub_cuisine && (
                                                                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                                                                    {recipe.sub_cuisine}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Ingredients */}
                                                                                {recipe.ingredients && recipe.ingredients.length > 0 && (
                                                                                    <div className="mb-3">
                                                                                        <p className="text-sm font-medium text-gray-700 mb-1">Ingredients:</p>
                                                                                        <p className="text-sm text-gray-600">{recipe.ingredients.join(', ')}</p>
                                                                                    </div>
                                                                                )}

                                                                                {/* Instructions */}
                                                                                {recipe.instructions && recipe.instructions.length > 0 && (
                                                                                    <div>
                                                                                        <p className="text-sm font-medium text-gray-700 mb-1">Instructions:</p>
                                                                                        <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                                                                                            {recipe.instructions.map((instruction, index) => (
                                                                                                <li key={index}>{instruction}</li>
                                                                                            ))}
                                                                                        </ol>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Meal Summary */}
                                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600">Meal Total:</span>
                                                                            <div className="space-x-4 text-black">
                                                                                <span>{meal.totalCalories.toFixed(2)} cal</span>
                                                                                <span>{meal.totalProtein.toFixed(2)}g protein</span>
                                                                                <span>{meal.totalFat.toFixed(2)}g fat</span>
                                                                                <span>{meal.totalCarbs.toFixed(2)}g carbs</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p>No meals available in this plan</p>
                                                </div>
                                            )}

                                            {/* Recommendations */}
                                            {dietPlan.plan.recommendations && dietPlan.plan.recommendations.length > 0 && (
                                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                                    <h4 className="font-semibold text-purple-900 mb-3">Additional Recommendations</h4>
                                                    <ul className="space-y-2">
                                                        {dietPlan.plan.recommendations.map((rec, index) => (
                                                            <li key={index} className="flex items-start">
                                                                <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                                <span className="text-sm text-purple-800">{rec}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Meal Plan Feedback */}
                                            <div className="border-t pt-3">
                                                <h4 className="font-semibold text-gray-800 mb-2 text-sm">Feedback on Meal Plan</h4>
                                                <textarea
                                                    value={mealPlanFeedback}
                                                    onChange={(e) => setMealPlanFeedback(e.target.value)}
                                                    placeholder="How are you finding the meal plan? Any dishes you particularly like or dislike?"
                                                    className="w-full h-20 p-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent resize-none text-sm"
                                                />
                                                <button
                                                    onClick={() => submitDietPlanFeedback('meal_plan')}
                                                    disabled={!mealPlanFeedback.trim() || submittingFeedback === 'meal_plan'}
                                                    className="mt-2 bg-[#5F2C66] text-white py-1.5 px-3 rounded-lg hover:bg-[#4a1f52] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                                                >
                                                    {submittingFeedback === 'meal_plan' ? 'Submitting...' : 'Submit Feedback'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-gray-400 mb-4">
                                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Meal Plan Available</h3>
                                            <p className="text-gray-500">Your dietitian hasn't published a meal plan for you yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Diet Chart */}
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
                                <div className="p-4 border-b flex-shrink-0">
                                    <h2 className="text-xl font-bold text-[#5F2C66]">Your Diet Chart</h2>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                    {loadingDietPlan ? (
                                        <div className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F2C66] mx-auto"></div>
                                            <p className="text-gray-500 mt-4">Loading diet chart...</p>
                                        </div>
                                    ) : dietPlan ? (
                                        <div className="space-y-4">
                                            {dietPlan.chart_url ? (
                                                <img
                                                    src={dietPlan.chart_url}
                                                    alt="Diet Chart"
                                                    className="w-full h-auto rounded-lg shadow-md"
                                                />
                                            ) : (
                                                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <p className="text-gray-500">No chart available</p>
                                                </div>
                                            )}

                                            {/* Diet Chart Feedback */}
                                            <div className="border-t pt-4">
                                                <h4 className="font-semibold text-gray-800 mb-2">Feedback on Diet Chart</h4>
                                                <textarea
                                                    value={dietChartFeedback}
                                                    onChange={(e) => setDietChartFeedback(e.target.value)}
                                                    placeholder="How helpful is this diet chart? Any suggestions?"
                                                    className="w-full h-20 p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent resize-none"
                                                />
                                                <button
                                                    onClick={() => submitDietPlanFeedback('chart')}
                                                    disabled={!dietChartFeedback.trim() || submittingFeedback === 'chart'}
                                                    className="mt-2 bg-[#5F2C66] text-white py-2 px-4 rounded-lg hover:bg-[#4a1f52] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {submittingFeedback === 'chart' ? 'Submitting...' : 'Submit Feedback'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-gray-400 mb-4">
                                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Diet Chart Available</h3>
                                            <p className="text-gray-500">Your dietitian hasn't published a diet chart for you yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mt-16">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">No Dietitian Assigned Yet</h2>
                        <p className="text-gray-500">You have not been accepted or added by any dietitian. Please wait for a dietitian to accept your profile.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Protect this route - only patients can access
export default withAuth(PatientDashboard, { allowedRoles: ['patient'] });