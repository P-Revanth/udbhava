/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, getUserDocument, signOutUser } from '../lib/auth';

// Define the user type
interface User {
    uid: string;
    name: string;
    email: string;
    role: 'admin' | 'dietitian' | 'patient';
    linkedPatientIds?: string[];
    linkedDietitianId?: string | null;
    createdAt?: any;
    updatedAt?: any;
}

// Define the auth context type
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isDietitian: boolean;
    isPatient: boolean;
}

/**
 * Authentication Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * Manages user authentication state across the application
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Subscribe to authentication state changes
        const unsubscribe = onAuthStateChange(async (firebaseUser: any) => {
            try {
                setError(null);

                if (firebaseUser) {
                    // User is signed in, get their profile from Firestore
                    try {
                        const userDoc = await getUserDocument(firebaseUser.uid);

                        if (userDoc) {
                            setUser(userDoc as User);
                        } else {
                            // Handle case where Firebase user exists but no Firestore document
                            console.warn('Firebase user exists but no Firestore document found');
                            setError('User profile not found. Please contact support.');
                            setUser(null);
                        }
                    } catch (firestoreError) {
                        console.error('Firestore error in auth state change:', firestoreError);

                        // Check if it's a permissions error
                        if (firestoreError instanceof Error && firestoreError.message.includes('security rules')) {
                            setError('Database access denied. Please check Firestore security rules.');
                        } else {
                            setError('Unable to load user profile. Please try again.');
                        }
                        setUser(null);
                    }
                } else {
                    // User is signed out
                    setUser(null);
                }
            } catch (error) {
                console.error('Error in auth state change:', error);
                const errorMessage = error instanceof Error ? error.message : 'Authentication error';
                setError(errorMessage);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    /**
     * Sign out the current user
     */
    const handleSignOut = async () => {
        try {
            setError(null);
            await signOutUser();
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            const errorMessage = error instanceof Error ? error.message : 'Sign out error';
            setError(errorMessage);
        }
    };

    /**
     * Refresh user data from Firestore
     */
    const refreshUser = async () => {
        if (user?.uid) {
            try {
                const updatedUser = await getUserDocument(user.uid);
                setUser(updatedUser as User);
            } catch (error) {
                console.error('Error refreshing user:', error);
                const errorMessage = error instanceof Error ? error.message : 'Refresh error';
                setError(errorMessage);
            }
        }
    };

    /**
     * Clear any authentication errors
     */
    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        signOut: handleSignOut,
        refreshUser,
        clearError,
        // Helper getters
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDietitian: user?.role === 'dietitian',
        isPatient: user?.role === 'patient'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use authentication context
 * @returns Authentication context value
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

/**
 * Higher-order component for protecting routes
 * @param WrappedComponent - Component to protect
 * @param options - Protection options
 */
interface WithAuthOptions {
    allowedRoles?: ('admin' | 'dietitian' | 'patient')[];
    redirectTo?: string;
}

export const withAuth = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options: WithAuthOptions = {}
) => {
    const { allowedRoles = [], redirectTo = '/login' } = options;

    return function AuthenticatedComponent(props: P) {
        const { user, loading } = useAuth();

        useEffect(() => {
            if (!loading) {
                if (!user) {
                    // Not authenticated, redirect to login
                    window.location.href = redirectTo;
                    return;
                }

                if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                    // User doesn't have required role
                    console.warn(`Access denied. Required roles: ${allowedRoles.join(', ')}, User role: ${user.role}`);
                    window.location.href = '/unauthorized';
                    return;
                }
            }
        }, [user, loading]);

        // Show loading while checking authentication
        if (loading) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            );
        }

        // Don't render component if user is not authenticated or authorized
        if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};