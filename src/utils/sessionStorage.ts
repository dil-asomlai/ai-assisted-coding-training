import type { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

/**
 * Runtime guard to check if a value looks like an array of minimal Todo objects.
 */
export function isValidTodos(data: unknown): data is Todo[] {
  if (!Array.isArray(data)) return false;
  return data.every(item => {
    if (item === null || typeof item !== 'object') return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.id === 'string' &&
      typeof obj.title === 'string' &&
      typeof obj.completed === 'boolean'
    );
  });
}

/**
 * Load persisted todos from window.sessionStorage.
 * Returns an empty array if nothing is stored or the stored value is invalid/corrupt.
 */
export function loadTodos(): Todo[] {
  if (typeof window === 'undefined' || !('sessionStorage' in window)) {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!isValidTodos(parsed)) {
      // Corrupt or outdated structure – clear and fallback
      window.sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Convert createdAt back to Date instances if present
    return (parsed as Todo[]).map(todo => ({
      ...todo,
      createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
    })) as Todo[];
  } catch (err) {
    console.warn('Failed to parse todos from sessionStorage – resetting', err);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Persist todos to window.sessionStorage.
 * Returns true when data is saved, false when the operation failed (e.g. quota exceeded).
 */
export function saveTodos(todos: Todo[]): boolean {
  if (typeof window === 'undefined' || !('sessionStorage' in window)) {
    return true;
  }

  try {
    if (todos.length === 0) {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
    return true;
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'name' in err &&
      (err as { name?: string }).name === 'QuotaExceededError'
    ) {
      console.warn('Storage quota exceeded – your latest changes may not be saved.');
    } else {
      console.warn('Failed to write todos to sessionStorage', err);
    }
    return false;
  }
}
