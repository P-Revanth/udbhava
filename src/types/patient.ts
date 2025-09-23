// Patient collection structure for Firestore
export interface PatientProfile {
    // Basic Information
    name: string;
    age: number | null;
    gender: 'male' | 'female' | 'other' | null;
    weight_kg: number | null;
    height_cm: number | null;
    activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;

    // Food Preferences
    food_preference: 'vegetarian' | 'non_vegetarian' | null;
    cuisine_preference: 'indian' | 'asian' | 'mediterranean' | null;
    sub_cuisine_preference: string | null; // depends on cuisine selection

    // Health Information
    diseases: string[];

    // Ayurvedic Assessment - Dosha assessment questions (option + description)
    body_frame: { option: 'a' | 'b' | 'c'; description: string } | null;
    skin_type: { option: 'a' | 'b' | 'c'; description: string } | null;
    hair_type: { option: 'a' | 'b' | 'c'; description: string } | null;
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
    indian: ['North Indian', 'South Indian', 'Bengali', 'Rajasthani'],
    asian: ['Japanese', 'Chinese', 'Thai'],
    mediterranean: ['Italian', 'Greek']
} as const;

// Dosha assessment options mapping for backend processing
export const DOSHA_ASSESSMENT_OPTIONS = {
    body_frame: {
        a: { description: "Thin, Tall", dosha: "Vata" },
        b: { description: "Medium build", dosha: "Pitta" },
        c: { description: "Well-built", dosha: "Kapha" }
    },
    skin_type: {
        a: { description: "Dry, Rough", dosha: "Vata" },
        b: { description: "Oily, Inflamed", dosha: "Pitta" },
        c: { description: "Thick, Cool", dosha: "Kapha" }
    },
    hair_type: {
        a: { description: "Dry, Thin", dosha: "Vata" },
        b: { description: "Oily, Early greying", dosha: "Pitta" },
        c: { description: "Thick, Wavy", dosha: "Kapha" }
    }
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