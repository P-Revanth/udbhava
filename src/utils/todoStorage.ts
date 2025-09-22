// Utility functions for managing todos in localStorage

export interface TodoStorageItem {
    id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    isSystemGenerated: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: string; // Store as ISO string
    patientId?: string;
    patientName?: string;
}

const TODO_STORAGE_KEY = 'dietitian_todos';

export const TodoStorage = {
    // Save todos to localStorage
    saveTodos: (todos: TodoStorageItem[]): void => {
        try {
            localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
        } catch (error) {
            console.error('Error saving todos to localStorage:', error);
        }
    },

    // Load todos from localStorage
    loadTodos: (): TodoStorageItem[] => {
        try {
            const stored = localStorage.getItem(TODO_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading todos from localStorage:', error);
            return [];
        }
    },

    // Update a specific todo
    updateTodo: (todoId: string, updates: Partial<TodoStorageItem>): void => {
        const todos = TodoStorage.loadTodos();
        const updatedTodos = todos.map(todo =>
            todo.id === todoId ? { ...todo, ...updates } : todo
        );
        TodoStorage.saveTodos(updatedTodos);
    },

    // Add a new todo
    addTodo: (todo: TodoStorageItem): void => {
        const todos = TodoStorage.loadTodos();
        // Check if todo already exists to prevent duplicates
        const exists = todos.some(existingTodo => existingTodo.id === todo.id);
        if (!exists) {
            todos.push(todo);
            TodoStorage.saveTodos(todos);
        }
    },

    // Remove a todo
    removeTodo: (todoId: string): void => {
        const todos = TodoStorage.loadTodos();
        const filteredTodos = todos.filter(todo => todo.id !== todoId);
        TodoStorage.saveTodos(filteredTodos);
    },

    // Get active todos (not completed)
    getActiveTodos: (): TodoStorageItem[] => {
        return TodoStorage.loadTodos().filter(todo => !todo.isCompleted);
    },

    // Get top priority todos for dashboard
    getTopTodos: (limit: number = 3): TodoStorageItem[] => {
        const activeTodos = TodoStorage.getActiveTodos();

        // Sort by priority (high -> medium -> low) and then by creation date
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };

        return activeTodos
            .sort((a, b) => {
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;

                // If same priority, sort by creation date (newest first)
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, limit);
    },

    // Clear all todos (for debugging)
    clearAllTodos: (): void => {
        localStorage.removeItem(TODO_STORAGE_KEY);
    }
};