import type { Todo } from '../types/Todo';

const STORAGE_KEY = 'todos';

export const isValidTodos = (value: unknown): value is Array<Record<string, unknown>> => {
  if (!Array.isArray(value)) return false;
  return value.every(item => {
    if (typeof item !== 'object' || item === null) return false;
    const candidate = item as Record<string, unknown>;
    const hasId = typeof candidate.id === 'string';
    const hasTitle = typeof candidate.title === 'string';
    const hasCompleted = typeof candidate.completed === 'boolean';
    return hasId && hasTitle && hasCompleted;
  });
};

const reviveTodoDates = (raw: Record<string, unknown>): Todo => {
  const createdAtValue = raw.createdAt;
  const createdAt =
    typeof createdAtValue === 'string' || createdAtValue instanceof Date
      ? new Date(createdAtValue)
      : new Date();
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    description: typeof raw.description === 'string' ? raw.description : '',
    completed: Boolean(raw.completed),
    createdAt,
    ...(typeof raw.dueDate === 'string' ? { dueDate: raw.dueDate } : {}),
  } as Todo;
};

export const loadTodos = (): Todo[] => {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!isValidTodos(parsed)) {
      // Clear corrupt data and fall back to empty
      window.sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed.map(raw => reviveTodoDates(raw));
  } catch {
    // Corrupt JSON or inaccessible storage
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return [];
  }
};

export const saveTodos = (todos: Todo[]): void => {
  // Persist a minimized payload; Dates must be serialized
  const serializable = todos.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    createdAt: t.createdAt.toISOString(),
    ...(t.dueDate ? { dueDate: t.dueDate } : {}),
  }));
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
};

export const clearTodosStorage = (): void => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
