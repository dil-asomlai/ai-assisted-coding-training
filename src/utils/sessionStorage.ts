import type { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

/**
 * Validates if the loaded data is a valid array of Todo objects
 */
export function isValidTodos(data: unknown): data is Todo[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every(
    item =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      typeof item.completed === 'boolean' &&
      // createdAt can be either Date object or ISO string from JSON
      (item.createdAt instanceof Date || typeof item.createdAt === 'string')
  );
}

/**
 * Loads todos from sessionStorage
 * Returns empty array if no data, corrupt data, or validation fails
 */
export function loadTodos(): Todo[] {
  try {
    const storedData = window.sessionStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return [];
    }

    const parsed = JSON.parse(storedData);

    if (!isValidTodos(parsed)) {
      console.warn('Invalid todo data found in sessionStorage, clearing and starting fresh');
      window.sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Convert string dates back to Date objects
    return parsed.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
    }));
  } catch (error) {
    console.warn('Failed to load todos from sessionStorage:', error);
    // Clear corrupted data
    window.sessionStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Saves todos to sessionStorage
 * Returns error message if save fails, null if successful
 */
export function saveTodos(todos: Todo[]): string | null {
  try {
    const serialized = JSON.stringify(todos);
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('SessionStorage quota exceeded - your latest changes may not be saved');
      return 'Storage quota exceeded – your latest changes may not be saved.';
    }

    console.warn('Failed to save todos to sessionStorage:', error);
    return 'Failed to save changes to session storage.';
  }
}
