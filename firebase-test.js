// Firebase Connection Test
// Run this in browser console to test Firebase connection

import { auth, db } from './src/lib/firebase.js';
import { doc, getDoc } from 'firebase/firestore';

// Test 1: Check if Firebase Auth is initialized
console.log('Firebase Auth initialized:', !!auth);
console.log('Current user:', auth.currentUser);

// Test 2: Check if Firestore is initialized  
console.log('Firestore initialized:', !!db);

// Test 3: Try to read from Firestore (this will help identify permission issues)
const testFirestoreConnection = async () => {
    try {
        // Try to read a non-existent document to test permissions
        const testRef = doc(db, 'test-collection', 'test-doc');
        const testSnap = await getDoc(testRef);

        console.log('Firestore connection successful');
        console.log('Test document exists:', testSnap.exists());

        return true;
    } catch (error) {
        console.error('Firestore connection failed:', error);

        if (error.code === 'permission-denied') {
            console.error('❌ PERMISSION DENIED: Firestore security rules need to be updated');
        }

        return false;
    }
};

// Run the test
testFirestoreConnection();