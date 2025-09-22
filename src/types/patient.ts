// Patient collection structure for Firestore
export interface PatientProfile {
    // Basic Information
    name: string;
    age: number | null;
    gender: 'male' | 'female' | 'other' | null;

    // Ayurvedic Assessment
    dosha: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | null;
    agni: 'Sama' | 'Tikshna' | 'Manda' | 'Vishama' | null;

    // Health Information
    allergies: string[];
    medical_conditions: string[];
    sleep_schedule: {
        bedtime: string | null;
        wake_time: string | null;
        sleep_quality: 'poor' | 'fair' | 'good' | 'excellent' | null;
    } | null;

    // Nutrition Goals
    calorie_needs: number | null;
    goals: string[];

    // Assignments
    assignedDietitianId: string;

    // Status
    activeStatus: 'active' | 'not active';

    // Metadata
    createdAt?: any;
    updatedAt?: any;
}

// Example patient document structure:
/*
patients/{patientId} = {
    name: "John Doe",
    age: null, // To be filled by dietitian
    gender: null, // To be filled by dietitian
    dosha: null, // To be assessed by dietitian
    agni: null, // To be assessed by dietitian
    allergies: [], // To be filled by dietitian
    medical_conditions: [], // To be filled by dietitian
    sleep_schedule: null, // To be filled by dietitian
    calorie_needs: null, // To be calculated by dietitian
    goals: [], // To be set by dietitian
    assignedDietitianId: "dietitianUID123",
    activeStatus: "active", // "active" or "not active"
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
}
*/