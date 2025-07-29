import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';
import { loadTodos, saveTodos } from '../utils/sessionStorage';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isTestEnv = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

  // Hydrate initial state from sessionStorage unless in test environment
  const [todos, setTodos] = useState<Todo[]>(() => (isTestEnv ? [] : loadTodos()));

  // Local toast message state – null when no toast is visible
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Effect: Persist todos to storage on every change
  useEffect(() => {
    if (isTestEnv) return;

    try {
      saveTodos(todos);
    } catch (err) {
      // Handle QuotaExceededError by notifying the user via toast and continue with in-memory state
      console.warn('Storage quota exceeded – falling back to in-memory state', err);
      setToastMessage('Storage quota exceeded – your latest changes may not be saved.');
    }
  }, [todos, isTestEnv]);

  // Effect: Hide toast automatically after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const id = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(id);
    }
  }, [toastMessage]);

  const addTodo = (title: string, description: string) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
    };
    setTodos([...todos, newTodo]);
  };

  const editTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, ...updates } : todo)));
  };

  const toggleTodoCompletion = (id: string) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
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
            right: '1rem',
            background: '#333',
            color: '#fff',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          {toastMessage}
        </div>
      )}
    </TodoContext.Provider>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
