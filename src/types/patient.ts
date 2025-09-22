// Patient collection structure for Firestore
export interface PatientProfile {
    // Basic Information
    name: string;
    age: number | null;
    weight_kg: number | null;
    height_cm: number | null;
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;

    // Food Preferences
    food_preference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian' | null;
    cuisine_preference: 'north_indian' | 'south_indian' | 'continental' | 'chinese' | 'italian' | 'mexican' | 'mediterranean' | 'other' | null;
    sub_cuisine_preference: string | null; // depends on cuisine selection

    // Health Information
    diseases: string[];

    // Ayurvedic Assessment - Dosha assessment questions
    body_frame: 'thin_tall' | 'medium_build' | 'well_built' | null;
    skin_type: 'dry_rough' | 'oily_inflamed' | 'thick_cool' | null;
    hair_type: 'dry_thin' | 'oily_early_greying' | 'thick_wavy' | null;
    agni_strength: 'low' | 'moderate' | 'high' | 'irregular' | null;
    current_season: 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' | 'late_winter' | null;

    // Assignments
    assignedDietitianId: string;

    // Status
    activeStatus: 'active' | 'not active';

    // Metadata
    createdAt?: any;
    updatedAt?: any;
}

// Cuisine sub-options mapping
export const CUISINE_SUB_OPTIONS = {
    north_indian: ['Punjabi', 'Kashmiri', 'Rajasthani', 'Uttar Pradesh', 'Delhi', 'Haryana'],
    south_indian: ['Tamil', 'Telugu', 'Kerala', 'Karnataka', 'Andhra', 'Hyderabadi'],
    continental: ['European', 'American', 'British', 'French', 'German', 'Russian'],
    chinese: ['Cantonese', 'Sichuan', 'Hunan', 'Beijing', 'Shanghai', 'Hakka'],
    italian: ['Northern Italian', 'Southern Italian', 'Tuscan', 'Roman', 'Neapolitan', 'Sicilian'],
    mexican: ['Tex-Mex', 'Yucatecan', 'Oaxacan', 'Poblano', 'Veracruzan', 'Jalisco'],
    mediterranean: ['Greek', 'Turkish', 'Lebanese', 'Moroccan', 'Spanish', 'Israeli'],
    other: ['Fusion', 'Local', 'Traditional', 'Modern', 'Regional', 'Custom']
} as const;

// Example patient document structure:
/*
patients/{patientId} = {
    name: "John Doe",
    age: 30,
    weight_kg: 70,
    height_cm: 175,
    activity_level: "moderate",
    food_preference: "vegetarian",
    cuisine_preference: "north_indian",
    sub_cuisine_preference: "Punjabi",
    diseases: ["diabetes", "hypertension"],
    body_frame: "medium_build",
    skin_type: "oily_inflamed",
    hair_type: "thick_wavy",
    agni_strength: "moderate",
    current_season: "summer",
    assignedDietitianId: "dietitianUID123",
    activeStatus: "active",
    createdAt: "timestamp",
    updatedAt: "timestamp"
}
*/