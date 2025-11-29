/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth, withAuth } from '../../../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import PatientCard from '../../../components/patientCard';
import EditPatientModal from '../../../components/EditPatientModal';
import DietPlanModal from '../../../components/DietPlanModal';
import TodoList, { TodoItem } from '../../../components/TodoList';
import DashboardTodo from '../../../components/DashboardTodo';
import FeedbackSection from '../../../components/FeedbackSection';
import { PatientProfile } from '../../../types/patient';
import { TodoStorage } from '../../../utils/todoStorage';

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
    isAssignedToDietitian?: boolean;
    linkedDietitianId?: string;
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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
    const [patientProfiles, setPatientProfiles] = useState<Record<string, PatientProfile>>({});
    const [todos, setTodos] = useState<TodoItem[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [lastGeneratedTodos, setLastGeneratedTodos] = useState<string[]>([]);
    const [generatingPlan, setGeneratingPlan] = useState<string | null>(null);
    const [dietPlanModalOpen, setDietPlanModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedPatientForDietPlan, setSelectedPatientForDietPlan] = useState<{ id: string; name: string } | null>(null);
    const [dietPlanData, setDietPlanData] = useState<any>(null);
    const [loadingDietPlan, setLoadingDietPlan] = useState(false);

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
                    // Assignment status
                    isAssignedToDietitian: doc.data().isAssignedToDietitian || false,
                    linkedDietitianId: doc.data().linkedDietitianId || null,
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

                    // Fetch patient profiles from patients collection
                    const profilePromises = user.linkedPatientIds.map(async (patientId) => {
                        try {
                            const patientRef = doc(db, 'patients', patientId);
                            const patientSnap = await getDoc(patientRef);
                            if (patientSnap.exists()) {
                                return { id: patientId, data: patientSnap.data() as PatientProfile };
                            }
                        } catch (error) {
                            console.error(`Error fetching profile for patient ${patientId}:`, error);
                        }
                        return null;
                    });

                    const profiles = await Promise.all(profilePromises);
                    const profilesMap: Record<string, PatientProfile> = {};
                    profiles.forEach(profile => {
                        if (profile) {
                            profilesMap[profile.id] = profile.data;
                        }
                    });
                    setPatientProfiles(profilesMap);
                }

                // Load todos from localStorage
                const savedTodos = TodoStorage.loadTodos();
                const convertedTodos: TodoItem[] = savedTodos.map(todo => ({
                    ...todo,
                    createdAt: new Date(todo.createdAt)
                }));
                setTodos(convertedTodos);
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

    // Helper function to check if patient can be added (not assigned to another dietitian)
    const canPatientBeAdded = (patient: Patient): boolean => {
        // If patient is not assigned to any dietitian, they can be added
        if (!patient.isAssignedToDietitian) {
            return true;
        }
        // If patient is assigned to current dietitian, they're already added
        if (patient.linkedDietitianId === user?.uid) {
            return false;
        }
        // If patient is assigned to another dietitian, they can't be added
        return false;
    };

    // Helper function to check if patient profile is complete
    const isPatientProfileComplete = (profile: PatientProfile | undefined): boolean => {
        if (!profile) return false;

        // Check required fields for new schema
        const requiredFields = [
            profile.age,
            profile.gender,
            profile.weight_kg,
            profile.height_cm,
            profile.activity_level,
            profile.food_preference,
            profile.cuisine_preference,
            profile.body_frame,
            profile.skin_type,
            profile.hair_type,
            profile.agni_strength,
            profile.current_season
        ];

        // Check if all required fields are filled
        const hasRequiredFields = requiredFields.every(field => field !== null && field !== undefined);

        // Check if diseases array has content (optional but good to have)
        return hasRequiredFields;
    };

    // API function to request diet plan generation
    const requestPlan = async (patientId: string) => {
        try {
            const resp = await fetch("http://localhost:8000/generate_diet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient_id: patientId })
            });
            const data = await resp.json();
            if (resp.ok && data.status === "success") {
                // return data;
                console.log('Diet plan generation response:', data);
            } else {
                throw new Error(data.detail || "Failed to generate plan");
            }
        } catch (error) {
            console.error('Error generating diet plan:', error);
            throw error;
        }
    };

    // Handle diet plan generation
    const handleGenerateDietPlan = async (patientId: string, patientName: string) => {
        setGeneratingPlan(patientId);
        try {
            console.log(`Generating diet plan for ${patientName}...`);
            const result = await requestPlan(patientId);
            console.log('Diet plan generated successfully:', result);

            // You can add additional logic here to handle the response
            // For example, save the plan to the database or show a success message
            alert(`Diet plan generated successfully for ${patientName}!`);

        } catch (error) {
            console.error('Failed to generate diet plan:', error);
            alert(`Failed to generate diet plan for ${patientName}. Please try again.`);
        } finally {
            setGeneratingPlan(null);
        }
    };

    // Handle opening diet plan modal and fetching diet plan data
    const handleViewDietPlan = async (patientId: string, patientName: string) => {
        setSelectedPatientForDietPlan({ id: patientId, name: patientName });
        setDietPlanModalOpen(true);
        setLoadingDietPlan(true);

        try {
            // Fetch diet plans from the subcollection: patients/{patientId}/diet_plans
            const dietPlansRef = collection(db, 'patients', patientId, 'diet_plans');
            const dietPlansSnapshot = await getDocs(dietPlansRef);

            if (!dietPlansSnapshot.empty) {
                // Get the first (most recent) diet plan
                const dietPlanDoc = dietPlansSnapshot.docs[0];
                const data = dietPlanDoc.data();

                // Transform the Firestore data to match our modal structure
                const transformedData = await transformFirestoreDietPlan(data, patientId, patientName);
                setDietPlanData(transformedData);
            } else {
                // No diet plan exists, show empty state
                setDietPlanData({
                    patientId,
                    patientName,
                    plan: null,
                    chart: null
                });
            }
        } catch (error) {
            console.error('Error fetching diet plan:', error);
            // Create mock data for demo purposes if Firestore fetch fails
            setDietPlanData(createMockDietPlan(patientId, patientName));
        } finally {
            setLoadingDietPlan(false);
        }
    };

    // Transform Firestore data structure to match our modal interface
    const transformFirestoreDietPlan = async (firestoreData: any, patientId: string, patientName: string) => {
        const transformedPlan: any = {
            patientId,
            patientName,
            chart: {
                chartUrl: firestoreData.chart_url || null,
                doshaType: firestoreData.dosha_alignment_score ? 'Detected from Assessment' : 'Unknown',
                recommendations: [
                    'Follow the personalized meal plan',
                    'Maintain regular eating schedule',
                    'Stay hydrated with warm water',
                    'Practice mindful eating'
                ]
            },
            plan: null
        };

        if (firestoreData.plan) {
            // Group recipes by meal type
            const mealGroups: { [key: string]: any[] } = {};

            // Extract all recipes from the plan structure
            Object.keys(firestoreData.plan).forEach(key => {
                if (Array.isArray(firestoreData.plan[key])) {
                    // Handle meal arrays like "Breakfast", "Lunch", "Dinner"
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
                    type: mealType,
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
    };    // Create mock diet plan data for demonstration
    const createMockDietPlan = (patientId: string, patientName: string) => {
        return {
            patientId,
            patientName,
            plan: {
                meals: [
                    {
                        type: 'Breakfast',
                        recipes: [
                            {
                                name: 'Oatmeal with Almonds and Honey',
                                calories: 350,
                                protein: 12,
                                fat: 8,
                                carbs: 58,
                                fiber: 8,
                                ingredients: ['Rolled oats', 'Almonds', 'Honey', 'Cinnamon', 'Milk'],
                                instructions: [
                                    'Boil water and add oats',
                                    'Cook for 5-7 minutes',
                                    'Add almonds and honey',
                                    'Sprinkle with cinnamon'
                                ]
                            },
                            {
                                name: 'Fresh Fruit Salad',
                                calories: 120,
                                protein: 2,
                                fat: 1,
                                carbs: 30,
                                fiber: 5,
                                ingredients: ['Apple', 'Banana', 'Orange', 'Pomegranate'],
                                instructions: ['Cut fruits into small pieces', 'Mix gently', 'Serve fresh']
                            }
                        ],
                        totalCalories: 470,
                        totalProtein: 14,
                        totalFat: 9,
                        totalCarbs: 88
                    },
                    {
                        type: 'Lunch',
                        recipes: [
                            {
                                name: 'Quinoa Vegetable Bowl',
                                calories: 420,
                                protein: 16,
                                fat: 12,
                                carbs: 65,
                                fiber: 8,
                                ingredients: ['Quinoa', 'Mixed vegetables', 'Olive oil', 'Herbs', 'Lemon'],
                                instructions: [
                                    'Cook quinoa in vegetable broth',
                                    'Sauté vegetables with olive oil',
                                    'Combine quinoa and vegetables',
                                    'Season with herbs and lemon'
                                ]
                            },
                            {
                                name: 'Herbal Tea',
                                calories: 5,
                                protein: 0,
                                fat: 0,
                                carbs: 1,
                                ingredients: ['Ginger', 'Turmeric', 'Honey'],
                                instructions: ['Boil water with ginger and turmeric', 'Add honey to taste']
                            }
                        ],
                        totalCalories: 425,
                        totalProtein: 16,
                        totalFat: 12,
                        totalCarbs: 66
                    },
                    {
                        type: 'Dinner',
                        recipes: [
                            {
                                name: 'Lentil Soup with Vegetables',
                                calories: 280,
                                protein: 18,
                                fat: 6,
                                carbs: 45,
                                fiber: 12,
                                ingredients: ['Red lentils', 'Carrots', 'Celery', 'Onions', 'Spices'],
                                instructions: [
                                    'Soak lentils for 30 minutes',
                                    'Chop vegetables finely',
                                    'Cook lentils with vegetables',
                                    'Season with Ayurvedic spices'
                                ]
                            },
                            {
                                name: 'Steamed Rice',
                                calories: 150,
                                protein: 3,
                                fat: 1,
                                carbs: 33,
                                ingredients: ['Basmati rice', 'Water', 'Salt'],
                                instructions: ['Wash rice thoroughly', 'Cook in 2:1 water ratio', 'Steam for 15 minutes']
                            }
                        ],
                        totalCalories: 430,
                        totalProtein: 21,
                        totalFat: 7,
                        totalCarbs: 78
                    }
                ],
                dailyCalories: 1325,
                dailyProtein: 51,
                dailyFat: 28,
                dailyCarbs: 232,
                recommendations: [
                    'Eat meals at regular intervals',
                    'Chew food slowly and mindfully',
                    'Drink warm water throughout the day',
                    'Avoid eating late at night'
                ]
            },
            chart: {
                doshaType: 'Vata-Pitta',
                recommendations: [
                    'Eat warm, moist, and grounding foods',
                    'Include sweet, sour, and salty tastes',
                    'Avoid cold and raw foods',
                    'Maintain regular meal times'
                ],
                foods: {
                    beneficial: ['Rice', 'Oats', 'Sweet fruits', 'Ghee', 'Warm milk', 'Cooked vegetables'],
                    neutral: ['Quinoa', 'Nuts', 'Seeds', 'Herbal teas'],
                    avoid: ['Cold drinks', 'Raw vegetables', 'Spicy foods', 'Caffeine', 'Processed foods']
                },
                lifestyle: [
                    'Practice regular meditation',
                    'Get adequate sleep (7-8 hours)',
                    'Exercise moderately and regularly',
                    'Create a calm eating environment'
                ]
            }
        };
    };

    // Handle closing diet plan modal
    const handleCloseDietPlanModal = () => {
        setDietPlanModalOpen(false);
        setSelectedPatientForDietPlan(null);
        setDietPlanData(null);
        setLoadingDietPlan(false);
    };

    // Handle publishing diet plan to patient
    const handlePublishDietPlan = async (patientId: string) => {
        try {
            // Find the diet plan document and mark it as published
            const dietPlansRef = collection(db, 'patients', patientId, 'diet_plans');
            const q = query(dietPlansRef);
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                // Update the latest diet plan to mark as published
                const latestDietPlan = snapshot.docs[0];
                await updateDoc(latestDietPlan.ref, {
                    published: true,
                    publishedAt: serverTimestamp(),
                    publishedBy: user?.uid
                });

                alert('Diet plan published successfully! The patient will be notified.');
                handleCloseDietPlanModal();
            } else {
                alert('No diet plan found to publish.');
            }
        } catch (error) {
            console.error('Error publishing diet plan:', error);
            alert('Failed to publish diet plan. Please try again.');
        }
    };    // Generate system todos based on patient profiles
    const generateSystemTodos = (): TodoItem[] => {
        const systemTodos: TodoItem[] = [];
        const existingTodos = TodoStorage.loadTodos();

        // Add default system todos (always present)
        const defaultTodos = [
            {
                id: 'default-review-patients',
                title: 'Weekly Patient Review',
                description: 'Review all active patients and their progress. Update treatment plans as needed.',
                isCompleted: false,
                isSystemGenerated: true,
                priority: 'medium' as const,
                createdAt: new Date()
            },
            {
                id: 'default-update-knowledge',
                title: 'Continue Ayurvedic Education',
                description: 'Stay updated with latest Ayurvedic practices and research. Complete monthly educational goals.',
                isCompleted: false,
                isSystemGenerated: true,
                priority: 'low' as const,
                createdAt: new Date()
            }
        ];

        // Add default todos if they don't exist in localStorage
        defaultTodos.forEach(defaultTodo => {
            const exists = existingTodos.find(todo => todo.id === defaultTodo.id);
            if (!exists) {
                TodoStorage.addTodo({
                    ...defaultTodo,
                    createdAt: defaultTodo.createdAt.toISOString()
                });
                systemTodos.push(defaultTodo);
            }
        });

        // Add patient-specific todos
        activePatients.forEach(patient => {
            const profile = patientProfiles[patient.uid];

            if (!isPatientProfileComplete(profile)) {
                // Check if this todo already exists in localStorage
                const existingTodo = existingTodos.find(todo =>
                    todo.isSystemGenerated &&
                    todo.patientId === patient.uid &&
                    todo.title === 'Complete Patient Profile' &&
                    !todo.isCompleted
                );

                if (!existingTodo) {
                    const newTodo = {
                        id: `system-${patient.uid}-profile`,
                        title: `Complete Patient Profile`,
                        description: `Fill out the complete profile form for ${patient.name} including personal details, Ayurvedic assessment, and health information.`,
                        isCompleted: false,
                        isSystemGenerated: true,
                        priority: 'high' as const,
                        createdAt: new Date(),
                        patientId: patient.uid,
                        patientName: patient.name
                    };

                    TodoStorage.addTodo({
                        ...newTodo,
                        createdAt: newTodo.createdAt.toISOString()
                    });
                    systemTodos.push(newTodo);
                }
            } else {
                // Mark as completed if profile is now complete
                const profileTodo = existingTodos.find(todo =>
                    todo.isSystemGenerated &&
                    todo.patientId === patient.uid &&
                    todo.title === 'Complete Patient Profile' &&
                    !todo.isCompleted
                );

                if (profileTodo) {
                    TodoStorage.updateTodo(profileTodo.id, { isCompleted: true });
                }
            }
        });

        return systemTodos;
    };

    // Update todos when patient profiles change
    useEffect(() => {
        if (activePatients.length > 0) {
            generateSystemTodos();
            // Reload from localStorage to get latest state
            const savedTodos = TodoStorage.loadTodos();
            const convertedTodos: TodoItem[] = savedTodos.map(todo => ({
                ...todo,
                createdAt: new Date(todo.createdAt)
            }));
            setTodos(convertedTodos);

            // Trigger event for dashboard todo component to update
            window.dispatchEvent(new Event('todosUpdated'));
        }
    }, [activePatients, patientProfiles]);

    // Handle opening edit modal
    const handleEditPatient = (patientId: string, patientName: string) => {
        setSelectedPatient({ id: patientId, name: patientName });
        setEditModalOpen(true);
    };

    // Handle closing edit modal
    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedPatient(null);
    };

    // Handle patient profile update
    const handlePatientUpdate = (updatedData: Partial<PatientProfile>) => {
        if (selectedPatient) {
            setPatientProfiles(prev => ({
                ...prev,
                [selectedPatient.id]: { ...prev[selectedPatient.id], ...updatedData } as PatientProfile
            }));
        }
    };

    // Todo management functions
    const handleToggleTodoComplete = (todoId: string) => {
        const updatedTodo = todos.find(todo => todo.id === todoId);
        if (updatedTodo) {
            const newStatus = !updatedTodo.isCompleted;
            TodoStorage.updateTodo(todoId, { isCompleted: newStatus });

            setTodos(prev => prev.map(todo =>
                todo.id === todoId
                    ? { ...todo, isCompleted: newStatus }
                    : todo
            ));

            // Trigger event for dashboard todo component
            window.dispatchEvent(new Event('todosUpdated'));
        }
    };

    const handleAddTodo = (title: string, description: string, priority: 'low' | 'medium' | 'high') => {
        const newTodo: TodoItem = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            description,
            isCompleted: false,
            isSystemGenerated: false,
            priority,
            createdAt: new Date()
        };

        // Save to localStorage
        TodoStorage.addTodo({
            ...newTodo,
            createdAt: newTodo.createdAt.toISOString()
        });

        setTodos(prev => [...prev, newTodo]);

        // Trigger event for dashboard todo component
        window.dispatchEvent(new Event('todosUpdated'));
    };

    const handleDeleteTodo = (todoId: string) => {
        TodoStorage.removeTodo(todoId);
        setTodos(prev => prev.filter(todo => todo.id !== todoId));

        // Trigger event for dashboard todo component
        window.dispatchEvent(new Event('todosUpdated'));
    };

    // Handle dashboard todo interactions
    const handleDashboardTaskClick = (todoId: string) => {
        if (todoId === 'view-all') {
            setActiveTab('activity');
        } else {
            // Navigate to activity tab and highlight the specific todo
            setActiveTab('activity');
        }
    };

    const handleDashboardTaskComplete = (todoId: string) => {
        handleToggleTodoComplete(todoId);
    };

    // Handle adding patient to dietitian's list
    const handleAddPatient = async (patientId: string) => {
        if (!user || !user.uid || isPatientAdded(patientId)) return;

        // Check if patient can be added (not assigned to another dietitian)
        const patient = allPatients.find(p => p.uid === patientId);
        if (!patient || !canPatientBeAdded(patient)) {
            console.log('Patient cannot be added - already assigned to another dietitian');
            return;
        }

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
                linkedDietitianId: user.uid,
                isAssignedToDietitian: true
            });

            // Create patient profile in patients collection
            const patientsRef = doc(db, 'patients', patientId);
            const patientData = allPatients.find(p => p.uid === patientId);

            if (patientData) {
                const patientProfile: PatientProfile = {
                    name: patientData.name,
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
                    assignedDietitianId: user.uid,
                    activeStatus: 'active',
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                await setDoc(patientsRef, patientProfile);
            }

            // Update local active patients list
            const patientToAdd = allPatients.find(p => p.uid === patientId);
            if (patientToAdd) {
                setActivePatients(prev => [...prev, patientToAdd]);
                // Update the patient in allPatients list to reflect assignment
                setAllPatients(prev => prev.map(p =>
                    p.uid === patientId
                        ? { ...p, isAssignedToDietitian: true, linkedDietitianId: user.uid }
                        : p
                ));
                setFilteredPatients(prev => prev.map(p =>
                    p.uid === patientId
                        ? { ...p, isAssignedToDietitian: true, linkedDietitianId: user.uid }
                        : p
                ));
            }

            // Update user state locally to reflect the change immediately
            if (user.linkedPatientIds) {
                user.linkedPatientIds = [...user.linkedPatientIds, patientId];
            } else {
                user.linkedPatientIds = [patientId];
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
                        assignedDietitianId: user.uid,
                        activeStatus: 'active',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };

                    await setDoc(patientsRef, patientProfile);

                    // Update local state even in error recovery
                    const patientToAdd = allPatients.find(p => p.uid === patientId);
                    if (patientToAdd) {
                        setActivePatients(prev => [...prev, patientToAdd]);
                        // Update the patient in allPatients list to reflect assignment
                        setAllPatients(prev => prev.map(p =>
                            p.uid === patientId
                                ? { ...p, isAssignedToDietitian: true, linkedDietitianId: user.uid }
                                : p
                        ));
                        setFilteredPatients(prev => prev.map(p =>
                            p.uid === patientId
                                ? { ...p, isAssignedToDietitian: true, linkedDietitianId: user.uid }
                                : p
                        ));
                    }

                    // Update user state locally to reflect the change immediately
                    if (user.linkedPatientIds) {
                        user.linkedPatientIds = [...user.linkedPatientIds, patientId];
                    } else {
                        user.linkedPatientIds = [patientId];
                    }
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
                                <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10" />
                                <span className="text-xl font-bold text-gray-900">AYURAAHARYA</span>
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
                                <Image src="/group.svg" alt="total" width={48} height={48} className='mt-2' />
                            </div>
                            <div className='flex bg-white p-4 pr-6 pl-6 rounded-2xl shadow-md justify-between'>
                                <div className='flex flex-col space-x-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>Your Patients:</h3>
                                    <p className='text-2xl font-bold text-gray-900'>{activePatients.length}</p>
                                </div>
                                <Image src="/group.svg" alt="your-patients" width={48} height={48} className='mt-2' />
                            </div>
                            <div className='flex bg-white p-4 pr-6 pl-6 rounded-2xl shadow-md justify-between'>
                                <div className='flex flex-col space-x-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>Active Patients:</h3>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {activePatients.filter((patient) => {
                                            const profile = patientProfiles[patient.uid];
                                            return !profile || profile.activeStatus === 'active';
                                        }).length}
                                    </p>
                                </div>
                                <Image src="/active.svg" alt="active" width={48} height={48} className='mt-2' />
                            </div>
                            <div className='flex bg-white p-4 pr-6 pl-6 rounded-2xl shadow-md justify-between'>
                                <div className='flex flex-col space-x-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>Pending Tasks:</h3>
                                    <p className='text-2xl font-bold text-gray-900'>
                                        {todos.filter(todo => !todo.isCompleted).length}
                                    </p>
                                </div>
                                <Image src="/pending.svg" alt="pending" width={48} height={48} className='mt-2' />
                            </div>
                            {/* <div className='flex bg-white p-4 pr-6 pl-6 rounded-2xl shadow-md justify-between'>
                                <div className='flex flex-col space-x-2'>
                                    <h3 className='text-xl font-semibold text-gray-900'>Pending Diet-Charts:</h3>
                                    <p className='text-2xl font-bold text-gray-900'>3</p>
                                </div>
                                <img src="/pending.svg" alt="pending" className='w-12 h-12 mt-2' />
                            </div> */}
                        </div>

                        {/* Dashboard Content - Recent Patients, Todo Tasks, and Feedback */}
                        <div className="flex gap-6 mb-10 h-[580px]">
                            {/* Recent Active Patients */}
                            <div className='flex flex-col flex-1 h-full items-start max-w-2xl'>
                                <h1 className='text-3xl font-bold text-gray-900 mb-6'>Recent Active Patients</h1>
                                <div className="flex-1 w-full overflow-y-auto items-start">
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 h-fit'>
                                        {activePatients.slice(0, 6).filter((patient) => {
                                            const profile = patientProfiles[patient.uid];
                                            return !profile || profile.activeStatus === 'active'; // Show if no profile exists or if active
                                        }).map((patient) => {
                                            const profile = patientProfiles[patient.uid];
                                            const isProfileComplete = isPatientProfileComplete(profile);
                                            return (
                                                <PatientCard
                                                    key={patient.uid}
                                                    name={patient.name}
                                                    profileImage={patient.profileImage}
                                                    age={profile?.age || undefined}
                                                    gender={profile?.gender || undefined}
                                                    doshaType={undefined} // Will be calculated from assessment in backend
                                                    agni={profile?.agni_strength as any || undefined}
                                                    activeStatus={profile?.activeStatus || undefined}
                                                    isAddedToDietitian={true}
                                                    showEditButton={true}
                                                    onEditProfile={() => handleEditPatient(patient.uid, patient.name)}
                                                    onGenerateDietPlan={() => handleGenerateDietPlan(patient.uid, patient.name)}
                                                    isGeneratingPlan={generatingPlan === patient.uid}
                                                    canGeneratePlan={isProfileComplete}
                                                    onClick={() => handleViewDietPlan(patient.uid, patient.name)}
                                                />
                                            );
                                        })}
                                        {activePatients.filter((patient) => {
                                            const profile = patientProfiles[patient.uid];
                                            return !profile || profile.activeStatus === 'active';
                                        }).length === 0 && (
                                                <div className="col-span-full text-center py-12">
                                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                    </svg>
                                                    <p className="text-gray-500 text-lg mb-2">No active patients yet</p>
                                                    <p className="text-gray-400 text-sm">Start by adding patients from the &quot;Patients&quot; tab.</p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Todo Preview */}
                            <div className='flex flex-col flex-1 h-full items-center'>
                                <DashboardTodo
                                    onTaskClick={handleDashboardTaskClick}
                                    onTaskComplete={handleDashboardTaskComplete}
                                />
                            </div>

                            {/* Feedback Section */}
                            <div className='flex flex-col h-full items-center'>
                                <FeedbackSection
                                    patientProfiles={patientProfiles}
                                    activePatients={activePatients}
                                />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'patients' && (
                    <div className='flex flex-col w-full items-start'>
                        <div className="flex justify-between w-full items-center mb-6">
                            <h1 className='text-3xl font-bold text-gray-900'>All Patients</h1>
                            <p className="text-gray-600">
                                Showing {filteredPatients.length} of {allPatients.length} patients
                            </p>
                        </div>

                        {loading ? (
                            <div className="w-full text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F2C66] mx-auto"></div>
                                <p className="text-gray-500 mt-4">Loading patients...</p>
                            </div>
                        ) : (
                            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
                                {filteredPatients.map((patient) => (
                                    <PatientCard
                                        key={patient.uid}
                                        name={patient.name}
                                        profileImage={patient.profileImage}
                                        isAddedToDietitian={isPatientAdded(patient.uid)}
                                        canBeAdded={canPatientBeAdded(patient)}
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
                    <div className='w-full flex flex-col items-start'>
                        <div className="w-full flex justify-between items-center mb-6">
                            <h1 className='text-3xl font-bold text-gray-900'>Your Patients</h1>
                            <p className="text-gray-600">
                                {activePatients.length} patients under your care
                            </p>
                        </div>

                        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                            {activePatients.map((patient) => {
                                const profile = patientProfiles[patient.uid];
                                const isProfileComplete = isPatientProfileComplete(profile);
                                return (
                                    <PatientCard
                                        key={patient.uid}
                                        name={patient.name}
                                        profileImage={patient.profileImage}
                                        age={profile?.age || undefined}
                                        gender={profile?.gender || undefined}
                                        doshaType={undefined} // Will be calculated from assessment in backend
                                        agni={profile?.agni_strength as any || undefined}
                                        activeStatus={profile?.activeStatus || undefined}
                                        isAddedToDietitian={true}
                                        showEditButton={true}
                                        onEditProfile={() => handleEditPatient(patient.uid, patient.name)}
                                        onGenerateDietPlan={() => handleGenerateDietPlan(patient.uid, patient.name)}
                                        isGeneratingPlan={generatingPlan === patient.uid}
                                        canGeneratePlan={isProfileComplete}
                                        onClick={() => handleViewDietPlan(patient.uid, patient.name)}
                                    />
                                );
                            })}
                            {activePatients.length === 0 && (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 text-lg">No patients added yet. Go to &quot;Patients&quot; tab to add patients to your care.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className='flex flex-col'>
                        <TodoList
                            todos={todos}
                            onToggleComplete={handleToggleTodoComplete}
                            onAddTodo={handleAddTodo}
                            onDeleteTodo={handleDeleteTodo}
                            onPatientProfileEdit={handleEditPatient}
                        />
                    </div>
                )}
            </main>

            {/* Diet Plan Modal */}
            <DietPlanModal
                isOpen={dietPlanModalOpen}
                onClose={handleCloseDietPlanModal}
                dietPlan={dietPlanData}
                isLoading={loadingDietPlan}
                onPublish={handlePublishDietPlan}
            />

            {/* Edit Patient Modal */}
            {selectedPatient && (
                <EditPatientModal
                    isOpen={editModalOpen}
                    onClose={handleCloseEditModal}
                    patientId={selectedPatient.id}
                    patientName={selectedPatient.name}
                    onUpdate={handlePatientUpdate}
                />
            )}
        </div>
    );
};

// Protect this route - only dietitians can access
export default withAuth(DietitianDashboard, { allowedRoles: ['dietitian'] });