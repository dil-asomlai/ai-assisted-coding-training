import type { Todo } from '../types/Todo';

const TODOS_STORAGE_KEY = 'todos';

/**
 * Validates that the given value is a valid array of Todo objects
 */
export const isValidTodos = (value: unknown): value is Todo[] => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    (item): item is Todo =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      typeof item.completed === 'boolean' &&
      (item.createdAt instanceof Date || typeof item.createdAt === 'string')
  );
};

/**
 * Loads todos from sessionStorage
 * @returns Array of todos or empty array if none found or invalid data
 */
export const loadTodos = (): Todo[] => {
  try {
    const storedValue = window.sessionStorage.getItem(TODOS_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);

    if (!isValidTodos(parsed)) {
      console.warn('Invalid todos data found in sessionStorage, clearing and starting fresh');
      window.sessionStorage.removeItem(TODOS_STORAGE_KEY);
      return [];
    }

    // Convert createdAt strings back to Date objects if needed
    return parsed.map(todo => ({
      ...todo,
      createdAt: typeof todo.createdAt === 'string' ? new Date(todo.createdAt) : todo.createdAt,
    }));
  } catch (error) {
    console.warn('Failed to load todos from sessionStorage:', error);
    // Clear corrupt data
    try {
      window.sessionStorage.removeItem(TODOS_STORAGE_KEY);
    } catch {
      // Ignore cleanup errors
    }
    return [];
  }
};

/**
 * Saves todos to sessionStorage
 * @param todos Array of todos to save
 * @returns Promise that resolves with success status and optional error message
 */
export const saveTodos = async (todos: Todo[]): Promise<{ success: boolean; error?: string }> => {
  try {
    const serialized = JSON.stringify(todos);
    window.sessionStorage.setItem(TODOS_STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Failed to save todos to sessionStorage';

    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      errorMessage = 'Storage quota exceeded – your latest changes may not be saved.';
    }

    console.warn(errorMessage, error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Clears todos from sessionStorage
 */
export const clearTodos = (): void => {
  try {
    window.sessionStorage.removeItem(TODOS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear todos from sessionStorage:', error);
  }
};
