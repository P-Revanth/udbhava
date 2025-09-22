import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Fetch dietitian profile by UID from Firestore
export const getDietitianProfile = async (dietitianId) => {
    if (!dietitianId) return null;
    const docRef = doc(db, 'users', dietitianId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().role === 'dietitian') {
        const data = docSnap.data();
        return {
            uid: dietitianId,
            name: data.name || '',
            profileImage: data.profileImage || '',
            specialization: data.specialization || '',
            yearsOfExperience: data.yearsOfExperience || 0,
            patientsServed: data.patientsServed || 0,
            isVerified: data.isVerified || false,
            rating: data.rating || 0,
        };
    }
    return null;
};
