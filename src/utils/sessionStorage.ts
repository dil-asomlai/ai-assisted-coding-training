import type { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

interface StoredTodo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
  dueDate?: string;
}

const isValidIsoDateString = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
};

export const serializeTodos = (todos: Todo[]): StoredTodo[] =>
  todos.map(todo => ({
    id: todo.id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    createdAt: todo.createdAt?.toISOString?.() ?? undefined,
    dueDate: todo.dueDate,
  }));

export const parseStoredTodos = (items: StoredTodo[]): Todo[] =>
  items
    .filter(item => !!item && typeof item === 'object')
    .map(item => {
      const created = isValidIsoDateString(item.createdAt)
        ? new Date(item.createdAt as string)
        : new Date();

      const due = isValidIsoDateString(item.dueDate) ? (item.dueDate as string) : undefined;

      const parsed: Todo = {
        id: String(item.id ?? ''),
        title: String(item.title ?? ''),
        description: String(item.description ?? ''),
        completed: Boolean(item.completed),
        createdAt: created,
        dueDate: due,
      };
      return parsed;
    });

export const loadTodosFromStorage = (): Todo[] => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parseStoredTodos(parsed);
  } catch {
    return [];
  }
};

export const saveTodosToStorage = (todos: Todo[]): boolean => {
  try {
    const payload = JSON.stringify(serializeTodos(todos));
    window.sessionStorage.setItem(STORAGE_KEY, payload);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to save todos to sessionStorage', err);
    return false;
  }
};

export const toStartOfDay = (date: Date): number => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
};
