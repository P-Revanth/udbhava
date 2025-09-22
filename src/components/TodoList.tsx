import React, { useState } from 'react';

export interface TodoItem {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    isSystemGenerated: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    patientId?: string; // For patient-related tasks
    patientName?: string; // For display purposes
}

interface TodoListProps {
    todos: TodoItem[];
    onToggleComplete: (todoId: string) => void;
    onAddTodo: (title: string, description: string, priority: 'low' | 'medium' | 'high') => void;
    onDeleteTodo: (todoId: string) => void;
    onPatientProfileEdit?: (patientId: string, patientName: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
    todos,
    onToggleComplete,
    onAddTodo,
    onDeleteTodo,
    onPatientProfileEdit
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTodo, setNewTodo] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    const handleAddTodo = () => {
        if (newTodo.title.trim() && newTodo.description.trim()) {
            onAddTodo(newTodo.title, newTodo.description, newTodo.priority);
            setNewTodo({ title: '', description: '', priority: 'medium' });
            setShowAddForm(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const activeTodos = todos.filter(todo => !todo.isCompleted);
    const completedTodos = todos.filter(todo => todo.isCompleted);

    return (
        <div className="min-h-screen w-full space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Activity & To-Do List</h2>
                    <p className="text-gray-600 mt-1">
                        {activeTodos.length} active tasks, {completedTodos.length} completed
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-[#5F2C66] text-white rounded-lg hover:bg-[#4A1F4F] transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Task</span>
                </button>
            </div>

            {/* Add Todo Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Task</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                            <input
                                type="text"
                                value={newTodo.title}
                                onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                placeholder="Enter task title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={newTodo.description}
                                onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                                placeholder="Enter task description..."
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={newTodo.priority}
                                onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as any }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5F2C66] focus:border-transparent"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleAddTodo}
                                className="px-4 py-2 bg-[#5F2C66] text-white rounded-lg hover:bg-[#4A1F4F] transition-colors"
                            >
                                Add Task
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Tasks */}
            {activeTodos.length > 0 && (
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Active Tasks ({activeTodos.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {activeTodos.map((todo) => (
                            <div key={todo.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <button
                                            onClick={() => onToggleComplete(todo.id)}
                                            className="mt-1 w-5 h-5 border-2 border-gray-300 rounded hover:border-[#5F2C66] transition-colors"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="font-medium text-gray-900">{todo.title}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(todo.priority)}`}>
                                                    {todo.priority}
                                                </span>
                                                {todo.isSystemGenerated && (
                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">{todo.description}</p>
                                            {todo.patientName && (
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-[#5F2C66] font-medium">
                                                        Patient: {todo.patientName}
                                                    </p>
                                                    {onPatientProfileEdit && todo.patientId && (
                                                        <button
                                                            onClick={() => onPatientProfileEdit(todo.patientId!, todo.patientName!)}
                                                            className="text-sm bg-[#5F2C66] text-white px-3 py-1 rounded-full hover:bg-[#4A1F4F] transition-colors"
                                                        >
                                                            Edit Profile
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500">Created: {formatDate(todo.createdAt)}</p>
                                        </div>
                                    </div>
                                    {!todo.isSystemGenerated && (
                                        <button
                                            onClick={() => onDeleteTodo(todo.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Tasks */}
            {completedTodos.length > 0 && (
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Completed Tasks ({completedTodos.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {completedTodos.map((todo) => (
                            <div key={todo.id} className="p-6 opacity-60">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                        <button
                                            onClick={() => onToggleComplete(todo.id)}
                                            className="mt-1 w-5 h-5 bg-green-500 border-2 border-green-500 rounded flex items-center justify-center text-white"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="font-medium text-gray-900 line-through">{todo.title}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(todo.priority)}`}>
                                                    {todo.priority}
                                                </span>
                                                {todo.isSystemGenerated && (
                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2 line-through">{todo.description}</p>
                                            {todo.patientName && (
                                                <p className="text-sm text-[#5F2C66] font-medium">
                                                    Patient: {todo.patientName}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">Created: {formatDate(todo.createdAt)}</p>
                                        </div>
                                    </div>
                                    {!todo.isSystemGenerated && (
                                        <button
                                            onClick={() => onDeleteTodo(todo.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {todos.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                    <p className="text-gray-600 mb-4">Get started by adding your first task or check back later for system-generated tasks.</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-[#5F2C66] text-white rounded-lg hover:bg-[#4A1F4F] transition-colors"
                    >
                        Add Your First Task
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodoList;