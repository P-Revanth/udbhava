'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpWithEmail } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    submit?: string;
}

const SignUpPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'patient',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Redirect if user is already authenticated
    React.useEffect(() => {
        if (user) {
            router.push('/login');
        }
    }, [user, router]);

    /**
     * Handle form input changes
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    /**
     * Validate form data
     */
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await signUpWithEmail({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role
            });

            // Redirect to login page after successful signup
            router.push('/login?message=Account created successfully. Please sign in.');
        } catch (error) {
            console.error('Signup error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            setErrors({ submit: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#EAD9ED] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="text-2xl font-semibold text-gray-800">AYURVEDA</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-gray-600">Join our wellness community today</p>
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-red-600 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <input
                                    required
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all peer placeholder-transparent ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="First Name"
                                    id="firstName"
                                />
                                <label
                                    htmlFor="firstName"
                                    className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-600 peer-focus:bg-white"
                                >
                                    First Name
                                </label>
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                            </div>
                            <div className="relative">
                                <input
                                    required
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all peer placeholder-transparent ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="Last Name"
                                    id="lastName"
                                />
                                <label
                                    htmlFor="lastName"
                                    className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-600 peer-focus:bg-white"
                                >
                                    Last Name
                                </label>
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="relative">
                            <input
                                required
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all peer placeholder-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                placeholder="Email"
                                id="email"
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-600 peer-focus:bg-white"
                            >
                                Email Address
                            </label>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                I am registering as:
                            </label>
                            <div className="flex space-x-6">
                                <div className="flex items-center">
                                    <input
                                        id="patient"
                                        name="role"
                                        type="radio"
                                        value="patient"
                                        checked={formData.role === 'patient'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                    />
                                    <label htmlFor="patient" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                        Patient
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="dietitian"
                                        name="role"
                                        type="radio"
                                        value="dietitian"
                                        checked={formData.role === 'dietitian'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                    />
                                    <label htmlFor="dietitian" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                        Dietitian
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <input
                                required
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 pr-12 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all peer placeholder-transparent ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                placeholder="Password"
                                id="password"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-600 peer-focus:bg-white"
                            >
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="relative">
                            <input
                                required
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 pr-12 border text-black rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all peer placeholder-transparent ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                                placeholder="Confirm Password"
                                id="confirmPassword"
                            />
                            <label
                                htmlFor="confirmPassword"
                                className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-600 peer-focus:bg-white"
                            >
                                Confirm Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Creating Account...</span>
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    {/* Sign In Link */}
                    <p className="text-center text-gray-600">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="text-green-600 font-semibold hover:text-green-700 hover:underline transition-colors"
                        >
                            Sign In
                        </a>
                    </p>
                </form>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage; 