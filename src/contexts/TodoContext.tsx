import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';
import { loadTodos, saveTodos } from '../utils/sessionStorage';
import { Toast } from '../components/Toast';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize todos from session storage
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());

  // Toast state for error handling
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  // Persist todos to session storage whenever they change
  useEffect(() => {
    const errorMessage = saveTodos(todos);
    if (errorMessage) {
      setToastMessage(errorMessage);
      setShowToast(true);
    }
  }, [todos]);

  const handleToastClose = () => {
    setShowToast(false);
    setToastMessage('');
  };

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
    <>
      <TodoContext.Provider value={{ todos, addTodo, editTodo, toggleTodoCompletion, deleteTodo }}>
        {children}
      </TodoContext.Provider>
      <Toast
        message={toastMessage}
        severity="warning"
        open={showToast}
        onClose={handleToastClose}
      />
    </>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
