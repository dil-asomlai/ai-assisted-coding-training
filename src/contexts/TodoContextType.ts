import { createContext } from 'react';
import type { Todo } from '../types/Todo';

export interface TodoContextType {
  todos: Todo[];
  addTodo: (title: string, description: string, dueDate?: string | null) => void;
  editTodo: (id: string, updates: Partial<Todo>) => void;
  toggleTodoCompletion: (id: string) => void;
  deleteTodo: (id: string) => void;
}

export const TodoContext = createContext<TodoContextType | undefined>(undefined);
