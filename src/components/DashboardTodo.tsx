import React, { useState, useEffect } from 'react';
import { TodoStorage, TodoStorageItem } from '../utils/todoStorage';

interface DashboardTodoProps {
    onTaskClick: (todoId: string) => void;
    onTaskComplete: (todoId: string) => void;
}

const DashboardTodo: React.FC<DashboardTodoProps> = ({ onTaskClick, onTaskComplete }) => {
    const [topTodos, setTopTodos] = useState<TodoStorageItem[]>([]);

    const loadTopTodos = () => {
        const todos = TodoStorage.getTopTodos(3);
        setTopTodos(todos);
    };

    useEffect(() => {
        loadTopTodos();

        // Listen for localStorage changes to update the component
        const handleStorageChange = () => {
            loadTopTodos();
        };

        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom events when todos are updated in the same tab
        window.addEventListener('todosUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('todosUpdated', handleStorageChange);
        };
    }, []);

    const handleTaskComplete = (e: React.MouseEvent, todoId: string) => {
        e.stopPropagation();

        // Update in localStorage
        TodoStorage.updateTodo(todoId, { isCompleted: true });

        // Trigger custom event to update other components
        window.dispatchEvent(new Event('todosUpdated'));

        // Call parent handler
        onTaskComplete(todoId);

        // Reload top todos
        loadTopTodos();
    };

    const handleTaskClick = (todoId: string) => {
        onTaskClick(todoId);
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high':
                return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
            case 'medium':
                return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
            case 'low':
                return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
            default:
                return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
        }
    };

    if (topTodos.length === 0) {
        return (
            <div className='flex flex-col w-96 h-[580px] items-start'>
                <h1 className='text-3xl font-bold text-gray-900 mb-6'>Top Priority Tasks</h1>
                <div className="bg-white rounded-2xl shadow-md p-8 text-center w-full flex-1 flex flex-col justify-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-2">All tasks completed!</p>
                    <p className="text-gray-400 text-sm">Great job staying organized.</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col w-96 h-[580px] items-start'>
            <h1 className='text-3xl font-bold text-gray-900 mb-6'>Top Priority Tasks</h1>
            <div className="bg-white rounded-2xl shadow-md p-6 w-full flex-1 flex flex-col">
                <div className="space-y-4 flex-1 overflow-y-auto">
                    {topTodos.map((todo, index) => (
                        <div
                            key={todo.id}
                            className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            onClick={() => handleTaskClick(todo.id)}
                        >
                            <button
                                onClick={(e) => handleTaskComplete(e, todo.id)}
                                className="mt-1 w-5 h-5 border-2 border-gray-300 rounded hover:border-[#5F2C66] transition-colors flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                    {getPriorityIcon(todo.priority)}
                                    <h3 className="font-medium text-gray-900 text-sm truncate">
                                        {todo.title}
                                    </h3>
                                    {todo.isSystemGenerated && (
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full flex-shrink-0">
                                            System
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 text-xs line-clamp-2">
                                    {todo.description}
                                </p>
                                {todo.patientName && (
                                    <p className="text-[#5F2C66] text-xs font-medium mt-1">
                                        Patient: {todo.patientName}
                                    </p>
                                )}
                            </div>
                            <div className="text-gray-400 text-xs flex-shrink-0">
                                #{index + 1}
                            </div>
                        </div>
                    ))}
                </div>

                {topTodos.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
                        <button
                            onClick={() => onTaskClick('view-all')}
                            className="w-full text-center text-[#5F2C66] hover:text-[#4A1F4F] text-sm font-medium transition-colors py-2 rounded-lg hover:bg-purple-50"
                        >
                            View All Tasks →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardTodo;