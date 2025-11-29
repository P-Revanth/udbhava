'use client';

import React from 'react';
import Image from 'next/image';

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
    chart?: {
        chartUrl?: string;
        doshaType: string;
        recommendations: string[];
        foods?: {
            beneficial: string[];
            neutral: string[];
            avoid: string[];
        };
        lifestyle?: string[];
    };
}

interface DietPlanModalProps {
    dietPlan: DietPlan | null;
    isOpen: boolean;
    onClose: () => void;
    onPublish?: (patientId: string) => void;
    isLoading?: boolean;
}

const DietPlanModal: React.FC<DietPlanModalProps> = ({
    isOpen,
    onClose,
    dietPlan,
    isLoading = false,
    onPublish
}) => {
    if (!isOpen) return null;

    // Close modal when clicking outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
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
            default:
                return {
                    header: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-900'
                };
        }
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

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Diet Plan & Chart
                        </h2>
                        <p className="text-gray-600">
                            {dietPlan?.patientName || 'Patient'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading diet plan...</p>
                            </div>
                        </div>
                    ) : !dietPlan ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Diet Plan Available</h3>
                                <p className="text-gray-600 mb-4">Generate a diet plan first to view the details.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Left Side - Diet Chart */}
                            <div className="w-2/5 bg-gray-50 p-6 overflow-y-auto border-r border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                        📊
                                    </span>
                                    Ayurvedic Diet Chart
                                </h3>

                                {dietPlan.chart ? (
                                    <div className="space-y-6">
                                        {/* Chart Image */}
                                        {dietPlan.chart.chartUrl && (
                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                <h4 className="font-semibold text-gray-900 mb-3">Personalized Diet Chart</h4>
                                                <div className="relative">
                                                    <Image
                                                        src={dietPlan.chart.chartUrl}
                                                        alt="Personalized Diet Chart"
                                                        width={600}
                                                        height={400}
                                                        className="w-full h-auto rounded-lg border border-gray-200"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Dosha Type */}
                                        <div className="bg-white rounded-xl p-4 shadow-sm">
                                            <h4 className="font-semibold text-gray-900 mb-2">Constitution Type</h4>
                                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                                {dietPlan.chart.doshaType}
                                            </span>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="bg-white rounded-xl p-4 shadow-sm">
                                            <h4 className="font-semibold text-gray-900 mb-3">General Recommendations</h4>
                                            <ul className="space-y-2">
                                                {dietPlan.chart.recommendations.map((rec, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                        <span className="text-sm text-gray-700">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Beneficial Foods */}
                                        {dietPlan.chart.foods?.beneficial && dietPlan.chart.foods.beneficial.length > 0 && (
                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                                                    <span className="mr-2">✅</span>
                                                    Beneficial Foods
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {dietPlan.chart.foods.beneficial.map((food, index) => (
                                                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                            {food}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Neutral Foods */}
                                        {dietPlan.chart.foods?.neutral && dietPlan.chart.foods.neutral.length > 0 && (
                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                <h4 className="font-semibold text-yellow-700 mb-3 flex items-center">
                                                    <span className="mr-2">⚠️</span>
                                                    Neutral Foods
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {dietPlan.chart.foods.neutral.map((food, index) => (
                                                        <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                                            {food}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Foods to Avoid */}
                                        {dietPlan.chart.foods?.avoid && dietPlan.chart.foods.avoid.length > 0 && (
                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                <h4 className="font-semibold text-red-700 mb-3 flex items-center">
                                                    <span className="mr-2">❌</span>
                                                    Foods to Avoid
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {dietPlan.chart.foods.avoid.map((food, index) => (
                                                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                                            {food}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Lifestyle Recommendations */}
                                        {dietPlan.chart.lifestyle && dietPlan.chart.lifestyle.length > 0 && (
                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                <h4 className="font-semibold text-gray-900 mb-3">Lifestyle Guidelines</h4>
                                                <ul className="space-y-2">
                                                    {dietPlan.chart.lifestyle.map((guideline, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                            <span className="text-sm text-gray-700">{guideline}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <p>Diet chart not available</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Side - Meal Plan */}
                            <div className="w-3/5 p-6 overflow-y-auto">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                        🍽️
                                    </span>
                                    Daily Meal Plan
                                </h3>

                                {dietPlan.plan ? (
                                    <div className="space-y-6">
                                        {/* Daily Summary */}
                                        <div className="bg-gradient-to-r from-[#EAD9ED] to-[#d89ee0] rounded-xl p-4 border border-[#5F2C66]">
                                            <h4 className="font-semibold text-[#5F2C66] mb-3">Daily Nutritional Summary</h4>
                                            <div className="grid grid-cols-4 gap-4 text-center">
                                                <div>
                                                    <p className="text-2xl font-bold text-[#5F2C66]">{dietPlan.plan.dailyCalories.toFixed(2)}</p>
                                                    <p className="text-sm text-gray-700">Calories</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-[#5F2C66]">{dietPlan.plan.dailyProtein.toFixed(2)}g</p>
                                                    <p className="text-sm text-gray-700">Protein</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-[#5F2C66]">{dietPlan.plan.dailyFat.toFixed(2)}g</p>
                                                    <p className="text-sm text-gray-700">Fat</p>
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-[#5F2C66]">{dietPlan.plan.dailyCarbs.toFixed(2)}g</p>
                                                    <p className="text-sm text-gray-700">Carbs</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meals */}
                                        {dietPlan.plan.meals
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
                                            })}

                                        {/* Additional Recommendations */}
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

                                        {/* Publish Button */}
                                        {onPublish && (
                                            <div className="flex justify-end pt-4 border-t border-purple-200">
                                                <button
                                                    onClick={() => onPublish(dietPlan.patientId)}
                                                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg"
                                                >
                                                    Publish Diet Plan
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        <p>Meal plan not available</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DietPlanModal;