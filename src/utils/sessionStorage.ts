import type { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

/**
 * Validates that the data is a valid array of Todo objects
 */
export const isValidTodos = (data: unknown): data is Todo[] => {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every((item) => {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      typeof item.completed === 'boolean' &&
      (item.createdAt instanceof Date || typeof item.createdAt === 'string')
    );
  });
};

/**
 * Loads todos from sessionStorage
 * Returns empty array if no data exists, is corrupted, or validation fails
 */
export const loadTodos = (): Todo[] => {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    
    // Convert createdAt strings back to Date objects
    const todosWithDates = parsed.map((todo: unknown) => ({
      ...(todo as Record<string, unknown>),
      createdAt: new Date((todo as { createdAt: string }).createdAt)
    }));

    if (isValidTodos(todosWithDates)) {
      return todosWithDates;
    } else {
      console.warn('Invalid todos data found in sessionStorage, clearing...');
      window.sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }
  } catch (error) {
    console.warn('Failed to load todos from sessionStorage:', error);
    window.sessionStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

/**
 * Saves todos to sessionStorage
 * Returns success/failure status and error message if applicable
 */
export const saveTodos = (todos: Todo[]): { success: boolean; error?: string } => {
  try {
    const serialized = JSON.stringify(todos);
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('SessionStorage quota exceeded:', error);
      return { 
        success: false, 
        error: 'Storage quota exceeded – your latest changes may not be saved.' 
      };
    } else {
      console.warn('Failed to save todos to sessionStorage:', error);
      return { 
        success: false, 
        error: 'Failed to save changes to session storage.' 
      };
    }
  }
}; 