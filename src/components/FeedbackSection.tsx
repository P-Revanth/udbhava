import React, { useState, useEffect } from 'react';

interface Feedback {
    id: string;
    patientName: string;
    patientId: string;
    type: 'personal' | 'diet_chart';
    message: string;
    rating?: number;
    timestamp: Date;
    isRead: boolean;
}

interface FeedbackSectionProps {
    patientProfiles: Record<string, any>;
    activePatients: any[];
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ patientProfiles, activePatients }) => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    // Generate sample feedback data
    useEffect(() => {
        if (activePatients.length > 0) {
            const sampleFeedbacks: Feedback[] = [
                {
                    id: 'feedback-1',
                    patientName: activePatients[0]?.name || 'Revanth P',
                    patientId: activePatients[0]?.uid || 'patient-1',
                    type: 'personal',
                    message: 'Thank you for the personalized consultation. Your Ayurvedic approach has really helped me understand my dosha better.',
                    rating: 5,
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                    isRead: false
                },
                {
                    id: 'feedback-2',
                    patientName: activePatients[0]?.name || 'Revanth P',
                    patientId: activePatients[0]?.uid || 'patient-1',
                    type: 'diet_chart',
                    message: 'The morning smoothie recipe is amazing! I feel more energetic. Could you suggest some evening snacks for Pitta balance?',
                    rating: 4,
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                    isRead: false
                },
                {
                    id: 'feedback-3',
                    patientName: 'Priya S',
                    patientId: 'patient-2',
                    type: 'personal',
                    message: 'The breathing exercises you recommended have significantly improved my sleep quality. Very grateful!',
                    rating: 5,
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                    isRead: true
                },
                {
                    id: 'feedback-4',
                    patientName: 'Arjun K',
                    patientId: 'patient-3',
                    type: 'diet_chart',
                    message: 'The spice blend recommendations are perfect for my Vata constitution. Can we add more warming foods for winter?',
                    rating: 4,
                    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
                    isRead: true
                }
            ];
            setFeedbacks(sampleFeedbacks);
        }
    }, [activePatients]);

    const markAsRead = (feedbackId: string) => {
        setFeedbacks(prev => prev.map(feedback =>
            feedback.id === feedbackId ? { ...feedback, isRead: true } : feedback
        ));
    };

    const getTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours === 1) return '1 hour ago';
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1 day ago';
        return `${diffInDays} days ago`;
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <svg
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    const personalFeedbacks = feedbacks.filter(f => f.type === 'personal');
    const dietChartFeedbacks = feedbacks.filter(f => f.type === 'diet_chart');

    return (
        <div className="flex flex-col w-96 h-[580px] space-y-4">
            {/* Personal Feedback Section */}
            <div className="flex flex-col h-[280px]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Personal Feedback</h2>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">
                            {personalFeedbacks.filter(f => !f.isRead).length} new
                        </span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-5 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {personalFeedbacks.slice(0, 3).map((feedback) => (
                            <div
                                key={feedback.id}
                                className={`p-4 rounded-lg border transition-colors cursor-pointer ${!feedback.isRead
                                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                onClick={() => markAsRead(feedback.id)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-sm text-gray-900">
                                            {feedback.patientName}
                                        </span>
                                        {!feedback.isRead && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {getTimeAgo(feedback.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                                    {feedback.message}
                                </p>
                                {feedback.rating && (
                                    <div className="flex items-center space-x-1">
                                        {renderStars(feedback.rating)}
                                    </div>
                                )}
                            </div>
                        ))}
                        {personalFeedbacks.length === 0 && (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-gray-500 text-sm">No personal feedback yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Diet Chart Feedback Section */}
            <div className="flex flex-col h-[280px]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Diet Chart Feedback</h2>
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">
                            {dietChartFeedbacks.filter(f => !f.isRead).length} new
                        </span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-md p-5 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {dietChartFeedbacks.slice(0, 3).map((feedback) => (
                            <div
                                key={feedback.id}
                                className={`p-4 rounded-lg border transition-colors cursor-pointer ${!feedback.isRead
                                    ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                onClick={() => markAsRead(feedback.id)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-sm text-gray-900">
                                            {feedback.patientName}
                                        </span>
                                        {!feedback.isRead && (
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {getTimeAgo(feedback.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                                    {feedback.message}
                                </p>
                                {feedback.rating && (
                                    <div className="flex items-center space-x-1">
                                        {renderStars(feedback.rating)}
                                    </div>
                                )}
                            </div>
                        ))}
                        {dietChartFeedbacks.length === 0 && (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-gray-500 text-sm">No diet chart feedback yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackSection;