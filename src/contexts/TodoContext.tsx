import React, { useEffect, useState } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';
import { loadTodos, saveTodos } from '../utils/sessionStorage';

/**
 * Provider responsible for Todo state management.
 * Adds sessionStorage hydration / persistence with basic error handling.
 */
export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // -----------------------
  // Hydrate from sessionStorage on mount
  // -----------------------
  useEffect(() => {
    const initial = loadTodos();
    if (initial.length) {
      setTodos(initial);
    }
  }, []);

  // -----------------------
  // Persist to sessionStorage on every change
  // -----------------------
  useEffect(() => {
    const { ok, error } = saveTodos(todos);
    if (!ok && error) {
      /* eslint-disable-next-line no-console */
      console.warn('Failed to persist todos to sessionStorage:', error);
      if (
        (error as { name?: string; code?: number })?.name === 'QuotaExceededError' ||
        (error as { name?: string; code?: number })?.code === 22 ||
        (error as { name?: string; code?: number })?.code === 1014 // Firefox
      ) {
        triggerToast('Storage quota exceeded – your latest changes may not be saved.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos]);

  // -----------------------
  // Toast helpers
  // -----------------------
  const triggerToast = (message: string) => {
    setToastMessage(message);
    // Auto-dismiss after 4s
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -----------------------
  // CRUD helpers
  // -----------------------
  const addTodo = (title: string, description: string) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
    };
    setTodos(prev => [...prev, newTodo]);
  };

  const editTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => (todo.id === id ? { ...todo, ...updates } : todo)));
  };

  const toggleTodoCompletion = (id: string) => {
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, editTodo, toggleTodoCompletion, deleteTodo }}>
      {children}
      {toastMessage && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            zIndex: 9999,
          }}
        >
          {toastMessage}
        </div>
      )}
    </TodoContext.Provider>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
