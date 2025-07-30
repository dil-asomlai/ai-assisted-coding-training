import type { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

export const isValidTodos = (data: unknown): data is Todo[] => {
  if (!Array.isArray(data)) return false;
  return data.every(
    item =>
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      typeof item.completed === 'boolean' &&
      // createdAt may be Date object or ISO string
      (item.createdAt instanceof Date || typeof item.createdAt === 'string')
  );
};

export const loadTodos = (): Todo[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!isValidTodos(parsed)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }
    // Map createdAt strings to Date objects
    return parsed.map(item => ({
      ...item,
      createdAt: item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt),
    }));
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.warn('Failed to parse todos from sessionStorage:', error);
    // Corrupt JSON, clear storage
    window.sessionStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export const saveTodos = (todos: Todo[]): { ok: boolean; error?: Error } => {
  if (typeof window === 'undefined') return { ok: true };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err as Error };
  }
};
