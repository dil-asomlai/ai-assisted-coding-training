import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';
import { loadTodos, saveTodos } from '../utils/sessionStorage';
import { useToast } from '../components/Toast';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showToast } = useToast();

  // Load todos from sessionStorage on mount
  useEffect(() => {
    const storedTodos = loadTodos();
    setTodos(storedTodos);
    setIsInitialized(true);
  }, []);

  // Save todos to sessionStorage whenever todos change (after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    const saveToStorage = async () => {
      const result = await saveTodos(todos);
      if (!result.success && result.error) {
        showToast(result.error, 'warning');
      }
    };

    // Use a microtask to avoid double-saves during the same render cycle
    void Promise.resolve().then(saveToStorage);
  }, [todos, showToast, isInitialized]);

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
    </TodoContext.Provider>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
