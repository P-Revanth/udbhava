import React from 'react';

interface PatientCardProps {
    name: string;
    profileImage?: string;
    isAddedToDietitian?: boolean;
    canBeAdded?: boolean; // Controls whether patient can be added (not assigned to another dietitian)
    onClick?: () => void;
    onAddToDietitian?: () => void;
    onEditProfile?: () => void;
    isLoading?: boolean;
    showEditButton?: boolean; // Controls whether to show edit button (for dietitian's patients)
    // Optional extended fields - will be shown when available
    age?: number;
    gender?: 'male' | 'female' | 'other';
    doshaType?: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha';
    agni?: 'Sama' | 'Tikshna' | 'Manda' | 'Vishama';
    activeStatus?: 'active' | 'not active';
}

const PatientCard: React.FC<PatientCardProps> = ({
    name,
    profileImage,
    isAddedToDietitian = false,
    canBeAdded = true,
    onClick,
    onAddToDietitian,
    onEditProfile,
    isLoading = false,
    showEditButton = false,
    age,
    gender,
    doshaType,
    agni,
    activeStatus
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
        <div className="bg-white rounded-2xl shadow-lg w-70 h-96 mx-auto overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
            {/* Large Profile Image */}
            <div className="h-48 bg-gradient-to-b from-gray-300 to-gray-400 relative overflow-hidden flex-shrink-0">
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt={`${name}'s profile`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 flex items-center justify-center">
                        <div className="w-20 h-20 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">
                                {getInitials(name)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                {/* Name and optional extended info */}
                <div className="flex-grow flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                        {name}
                    </h3>

                    {/* Extended info - only shown when data is available */}
                    {(age || gender || doshaType || agni) && (
                        <div className="space-y-1 text-center">
                            {age && (
                                <p className="text-sm text-gray-600">Age: {age}</p>
                            )}
                            {gender && (
                                <p className="text-sm text-gray-600">Gender: {gender}</p>
                            )}
                            <div className="flex justify-center gap-1 mt-2 flex-wrap">
                                {doshaType && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                        {doshaType}
                                    </span>
                                )}
                                {agni && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                        {agni}
                                    </span>
                                )}
                                {activeStatus && (
                                    <span className={`px-2 py-1 text-xs rounded-full ${activeStatus === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {activeStatus === 'active' ? 'Active' : 'Completed'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Button - Fixed at bottom */}
                <div className="space-y-2 flex-shrink-0">
                    {onAddToDietitian && canBeAdded && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isAddedToDietitian) {
                                    onAddToDietitian();
                                }
                            }}
                            disabled={isAddedToDietitian || isLoading}
                            className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${isAddedToDietitian
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : isLoading
                                    ? 'bg-orange-300 text-white cursor-not-allowed'
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                                }`}
                        >
                            {isAddedToDietitian ? (
                                <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Added</span>
                                </>
                            ) : isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <span>Add to My Patients</span>
                            )}
                        </button>
                    )}

                    {onAddToDietitian && !canBeAdded && !isAddedToDietitian && (
                        <div className="w-full py-3 px-4 rounded-xl bg-red-100 text-red-600 text-sm font-medium text-center">
                            Assigned to Another Dietitian
                        </div>
                    )}

                    {showEditButton && onEditProfile && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditProfile();
                            }}
                            className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-xl font-medium text-sm hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit Profile</span>
                        </button>
                    )}

                    {onClick && !showEditButton && (
                        <button
                            onClick={onClick}
                            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                        >
                            View Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientCard;
