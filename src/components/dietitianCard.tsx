import React from 'react';

interface DietitianCardProps {
    name: string;
    profileImage?: string;
    specialization: string;
    yearsOfExperience: number;
    patientsServed: number;
    isVerified?: boolean;
    rating?: number;
    onClick?: () => void;
    onFollow?: () => void;
    isFollowing?: boolean;
}

const DietitianCard: React.FC<DietitianCardProps> = ({
    name,
    profileImage,
    specialization,
    yearsOfExperience,
    patientsServed,
    isVerified = false,
    rating,
    onClick,
    onFollow,
    isFollowing = false
}) => {
    // Generate initials from name
    const getInitials = (fullName: string) => {
        return fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className="bg-white rounded-3xl shadow-lg p-6 max-w-sm mx-auto hover:shadow-xl transition-shadow duration-300"
            onClick={onClick}
        >
            {/* Profile Image */}
            <div className="flex justify-center mb-6">
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt={`Dr. ${name}`}
                        className="w-32 h-32 rounded-3xl object-cover"
                    />
                ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-[#5F2C66] to-[#8B4D9B] rounded-3xl flex items-center justify-center">
                        <span className="text-white font-bold text-3xl">
                            {getInitials(name)}
                        </span>
                    </div>
                )}
            </div>

            {/* Name and Verification */}
            <div className="text-center mb-2">
                <div className="flex items-center justify-center space-x-2">
                    <h3 className="text-xl font-bold text-gray-900">
                        Dr. {name}
                    </h3>
                    {isVerified && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Specialization */}
            <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
                {specialization}
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-6">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-gray-900">{patientsServed}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Patients</p>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-gray-900">{yearsOfExperience}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Years Exp.</p>
                </div>
                
                {rating && (
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold text-gray-900">{rating}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Rating</p>
                    </div>
                )}
            </div>

            {/* Follow Button */}
            {onFollow && (
                <div className="text-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFollow();
                        }}
                        className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${isFollowing
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                        {!isFollowing && (
                            <span className="ml-2 text-lg">+</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DietitianCard;
