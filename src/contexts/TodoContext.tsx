import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';
import { loadTodos, saveTodos } from '../utils/sessionStorage';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Hydrate from sessionStorage on initialization
    return loadTodos();
  });
  const [showToast, setShowToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

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

  // Persist todos to sessionStorage on every change
  useEffect(() => {
    const result = saveTodos(todos);
    if (!result.success && result.error) {
      setShowToast({ show: true, message: result.error });
    }
  }, [todos]);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showToast.show) {
      const timer = setTimeout(() => {
        setShowToast({ show: false, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast.show]);

  return (
    <>
      <TodoContext.Provider value={{ todos, addTodo, editTodo, toggleTodoCompletion, deleteTodo }}>
        {children}
      </TodoContext.Provider>
      {showToast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#f44336',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 9999,
            maxWidth: '300px',
            fontSize: '14px',
          }}
        >
          {showToast.message}
        </div>
      )}
    </>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
