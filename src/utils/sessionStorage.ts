import type { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

/**
 * Validates if the provided data is a valid array of Todo objects
 */
export function isValidTodos(data: unknown): data is Todo[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    const obj = item as Record<string, unknown>;
    return (
      typeof obj.id === 'string' &&
      typeof obj.title === 'string' &&
      typeof obj.description === 'string' &&
      typeof obj.completed === 'boolean' &&
      (obj.createdAt instanceof Date || typeof obj.createdAt === 'string')
    );
  });
}

/**
 * Loads todos from sessionStorage with validation and error handling
 * Returns empty array if data is missing, corrupt, or invalid
 */
export function loadTodos(): Todo[] {
  try {
    const storedData = window.sessionStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return [];
    }

    const parsedData = JSON.parse(storedData);

    if (!isValidTodos(parsedData)) {
      console.warn('Invalid todos data found in sessionStorage, clearing storage');
      window.sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Convert createdAt strings back to Date objects if needed
    return parsedData.map(todo => ({
      ...todo,
      createdAt: typeof todo.createdAt === 'string' ? new Date(todo.createdAt) : todo.createdAt,
    }));
  } catch (error) {
    console.warn('Failed to load todos from sessionStorage:', error);
    // Clear corrupted data
    window.sessionStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Saves todos to sessionStorage with error handling
 * Returns a promise that resolves to success status and error message if failed
 */
export function saveTodos(todos: Todo[]): { success: boolean; error?: string } {
  try {
    const serializedData = JSON.stringify(todos);
    window.sessionStorage.setItem(STORAGE_KEY, serializedData);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Failed to save todos to sessionStorage';

    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        errorMessage = 'Storage quota exceeded – your latest changes may not be saved';
      } else {
        errorMessage = `Storage error: ${error.message}`;
      }
    }

    console.warn(errorMessage, error);
    return { success: false, error: errorMessage };
  }
}
