import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';
import { loadTodos, saveTodos } from '../utils/sessionStorage';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast/ToastContainer';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Initialize state with data from sessionStorage
    return loadTodos();
  });
  const { toasts, showToast, removeToast } = useToast();

  // Save todos to sessionStorage whenever todos change
  useEffect(() => {
    const result = saveTodos(todos);
    if (!result.success && result.error) {
      showToast(result.error, 'warning');
    }
  }, [todos, showToast]);

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
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </TodoContext.Provider>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
