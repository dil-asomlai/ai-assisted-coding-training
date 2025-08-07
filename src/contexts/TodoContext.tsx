import React, { useState, useEffect } from 'react';
import type { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';
import { TodoContext } from './TodoContextType';
import { loadTodos, saveTodos } from '../utils/sessionStorage';
const STORAGE_KEY = 'todos';
import { Snackbar } from '@mui/material';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [storageError, setStorageError] = useState(false);

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

  // Persist todos to sessionStorage whenever they change
  useEffect(() => {
    if (!saveTodos(todos)) {
      setStorageError(true);
    }
  }, [todos]);

  // Cleanup between tests to avoid cross-test pollution
  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === 'test') {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    };
  }, []);

  return (
    <TodoContext.Provider value={{ todos, addTodo, editTodo, toggleTodoCompletion, deleteTodo }}>
      {children}
      <Snackbar
        open={storageError}
        autoHideDuration={4000}
        onClose={() => setStorageError(false)}
        message="Storage quota exceeded – changes may not be saved."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      {storageError && <div role="alert">Storage quota exceeded – changes may not be saved.</div>}
    </TodoContext.Provider>
  );
};

// No re-exports to avoid react-refresh/only-export-components error
