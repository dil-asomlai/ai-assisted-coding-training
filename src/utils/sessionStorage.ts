export const TODOS_STORAGE_KEY = 'todos';

import type { Todo } from '../types/Todo';

/**
 * Validate that a value is an array of (partial) Todo-like objects that contains
 * at least the fields we need to restore app state.
 */
export function isValidTodos(value: unknown): value is Todo[] {
  if (!Array.isArray(value)) return false;

  return value.every(
    item =>
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.completed === 'boolean'
  );
}

/**
 * Attempt to read todos from sessionStorage.
 *
 * If the data is missing, malformed or fails validation, the key will be
 * cleared and an empty array is returned so the app can recover gracefully.
 */
export function loadTodos(): Todo[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.sessionStorage.getItem(TODOS_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (isValidTodos(parsed)) {
      // Ensure Date objects are revived from ISO strings if present
      return (parsed as Todo[]).map(todo => ({
        ...todo,
        createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
      }));
    }
  } catch (err) {
    // fall-through – we handle below by clearing storage
    console.warn('[sessionStorage] Failed to parse stored todos – resetting', err);
  }

  // If we reach here the data was invalid or corrupt – clear and return empty
  try {
    window.sessionStorage.removeItem(TODOS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return [];
}

/**
 * Persist todos to sessionStorage.
 *
 * On QuotaExceededError the caller can decide how to handle (e.g. show toast).
 */
export function saveTodos(todos: Todo[]): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
  } catch (err: unknown) {
    if (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || (err as { code?: number }).code === 22)
    ) {
      // Re-throw so caller can handle specifically
      throw err;
    }
    console.warn('[sessionStorage] Failed to save todos', err);
  }
}
