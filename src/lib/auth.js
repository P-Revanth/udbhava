import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

/**
 * User Roles Constants
 */
export const USER_ROLES = {
    ADMIN: 'admin',
    DIETITIAN: 'dietitian',
    PATIENT: 'patient'
};

/**
 * Redirect routes based on user role
 */
export const ROLE_REDIRECTS = {
    [USER_ROLES.ADMIN]: '/admin/dashboard',
    [USER_ROLES.DIETITIAN]: '/users/dietitian',
    [USER_ROLES.PATIENT]: '/users/patient'
};

/**
 * Create or update user document in Firestore
 * @param {Object} userData - User data object
 * @param {string} userData.uid - Firebase UID
 * @param {string} userData.email - User email
 * @param {string} userData.name - User display name
 * @param {string} userData.role - User role
 */
export const createUserDocument = async (userData) => {
    try {
        const { uid, email, name, role = USER_ROLES.PATIENT } = userData;

        if (!uid || !email || !name) {
            throw new Error('Missing required user data: uid, email, and name are required');
        }

        const userRef = doc(db, 'users', uid);

        // Check if user document already exists
        let userSnapshot;
        try {
            userSnapshot = await getDoc(userRef);
        } catch (firestoreError) {
            console.error('Firestore permission error:', firestoreError);
            throw new Error('Unable to access user database. Please check Firestore security rules.');
        }

        // If user document doesn't exist, create it
        if (!userSnapshot.exists()) {
            const userDocData = {
                name,
                email,
                role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Add role-specific fields
            if (role === USER_ROLES.DIETITIAN) {
                userDocData.linkedPatientIds = [];
            } else if (role === USER_ROLES.PATIENT) {
                userDocData.linkedDietitianId = null;
            }

            try {
                await setDoc(userRef, userDocData);
                console.log('User document created successfully');
                return { uid, ...userDocData };
            } catch (firestoreError) {
                console.error('Firestore write error:', firestoreError);
                throw new Error('Unable to create user profile. Please check Firestore security rules.');
            }
        } else {
            console.log('User document already exists');
            return { uid, ...userSnapshot.data() };
        }
    } catch (error) {
        console.error('Error creating user document:', error);

        // Re-throw with more specific message if it's already a formatted error
        if (error.message.includes('Firestore') || error.message.includes('security rules')) {
            throw error;
        }

        throw new Error('Failed to create user profile');
    }
};

/**
 * Get user document from Firestore
 * @param {string} uid - Firebase UID
 * @returns {Object|null} User data or null if not found
 */
export const getUserDocument = async (uid) => {
    try {
        if (!uid) {
            throw new Error('User ID is required');
        }

        const userRef = doc(db, 'users', uid);

        let userSnapshot;
        try {
            userSnapshot = await getDoc(userRef);
        } catch (firestoreError) {
            console.error('Firestore permission error:', firestoreError);
            throw new Error('Unable to access user database. Please check Firestore security rules.');
        }

        if (userSnapshot.exists()) {
            return { uid, ...userSnapshot.data() };
        } else {
            console.log('No user document found for uid:', uid);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user document:', error);

        // Re-throw with more specific message if it's already a formatted error
        if (error.message.includes('Firestore') || error.message.includes('security rules') || error.message.includes('User ID is required')) {
            throw error;
        }

        throw new Error('Failed to fetch user profile');
    }
};

/**
 * Sign up with email and password
 * @param {Object} signupData - Signup form data
 * @param {string} signupData.email - User email
 * @param {string} signupData.password - User password
 * @param {string} signupData.firstName - User first name
 * @param {string} signupData.lastName - User last name
 * @param {string} signupData.role - User role
 */
export const signUpWithEmail = async (signupData) => {
    try {
        const { email, password, firstName, lastName, role } = signupData;

        // Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        const userData = {
            uid: user.uid,
            email: user.email,
            name: `${firstName} ${lastName}`,
            role
        };

        await createUserDocument(userData);

        console.log('User signed up successfully');
        return { user: userData, success: true };
    } catch (error) {
        console.error('Error signing up:', error);

        // Handle specific Firebase auth errors
        let errorMessage = 'Failed to create account';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'An account with this email already exists';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address';
        }

        throw new Error(errorMessage);
    }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user document from Firestore
        const userDoc = await getUserDocument(user.uid);

        if (!userDoc) {
            throw new Error('User profile not found');
        }

        console.log('User signed in successfully');
        return { user: userDoc, success: true };
    } catch (error) {
        console.error('Error signing in:', error);

        let errorMessage = 'Failed to sign in';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later';
        }

        throw new Error(errorMessage);
    }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document exists, if not create it
        let userDoc = await getUserDocument(user.uid);

        if (!userDoc) {
            // Create new user document with default role as patient
            const userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'Google User',
                role: USER_ROLES.PATIENT
            };

            await createUserDocument(userData);
            userDoc = userData;
        }

        console.log('Google sign in successful');
        return { user: userDoc, success: true };
    } catch (error) {
        console.error('Error with Google sign in:', error);

        let errorMessage = 'Failed to sign in with Google';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in was cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup was blocked. Please allow popups for this site';
        }

        throw new Error(errorMessage);
    }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
    try {
        await signOut(auth);
        console.log('User signed out successfully');
        return { success: true };
    } catch (error) {
        console.error('Error signing out:', error);
        throw new Error('Failed to sign out');
    }
};

/**
 * Auth state observer
 * @param {Function} callback - Callback function to handle auth state changes
 */
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get redirect URL based on user role
 * @param {string} role - User role
 * @returns {string} Redirect URL
 */
export const getRedirectUrl = (role) => {
    return ROLE_REDIRECTS[role] || ROLE_REDIRECTS[USER_ROLES.PATIENT];
};