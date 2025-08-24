import React, { useEffect, useState } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';
import { loadTodos, saveTodos } from '../utils/sessionStorage';
import { Toast } from '../components/Toast/Toast';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadTodos();
  });
  const [toastMessage, setToastMessage] = useState<string>('');

  const addTodo = (title: string, description: string, dueDate?: string | null) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      createdAt: new Date(),
      ...(dueDate ? { dueDate } : {}),
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      saveTodos(todos);
    } catch (err) {
      const anyErr = err as { name?: string; code?: number } | undefined;
      const isQuotaExceeded =
        Boolean(anyErr) &&
        (anyErr?.name === 'QuotaExceededError' || anyErr?.code === 22 || anyErr?.code === 1014);
      if (isQuotaExceeded) {
        // Continue with in-memory state; notify user
        // eslint-disable-next-line no-console
        console.warn('Storage quota exceeded – your latest changes may not be saved.');
        setToastMessage('Storage quota exceeded – latest changes may not be saved.');
      } else {
        // eslint-disable-next-line no-console
        console.warn('Failed to write to sessionStorage. Falling back to memory.');
      }
    }
  }, [todos]);

  useEffect(() => {
    if (!toastMessage) return;
    const id = setTimeout(() => setToastMessage(''), 4000);
    return () => clearTimeout(id);
  }, [toastMessage]);

  return (
    <TodoContext.Provider value={{ todos, addTodo, editTodo, toggleTodoCompletion, deleteTodo }}>
      {children}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </TodoContext.Provider>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
