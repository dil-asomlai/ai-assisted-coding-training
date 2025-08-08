import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Todo } from '../types/Todo';
import {
  loadTodosFromStorage,
  saveTodosToStorage,
  serializeTodos,
  parseStoredTodos,
} from '../utils/sessionStorage';

describe('sessionStorage utils', () => {
  const STORAGE_KEY = 'todos';

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('serializeTodos stores createdAt and dueDate as ISO strings', () => {
    const createdAt = new Date('2025-01-02T03:04:05.000Z');
    const due = new Date('2025-02-03T00:00:00.000Z').toISOString();
    const todos: Todo[] = [
      {
        id: '1',
        title: 'A',
        description: 'B',
        completed: false,
        createdAt,
        dueDate: due,
      },
    ];

    const stored = serializeTodos(todos);
    expect(stored[0].createdAt).toBe(createdAt.toISOString());
    expect(stored[0].dueDate).toBe(due);
  });

  it('parseStoredTodos parses createdAt and validates dueDate', () => {
    const items = [
      {
        id: '1',
        title: 'x',
        description: 'y',
        completed: true,
        createdAt: '2025-01-02T03:04:05.000Z',
        dueDate: 'invalid-date',
      },
    ];
    const parsed = parseStoredTodos(items as unknown as Parameters<typeof parseStoredTodos>[0]);
    expect(parsed[0].createdAt).toBeInstanceOf(Date);
    expect(parsed[0].dueDate).toBeUndefined();
  });

  it('loadTodosFromStorage returns [] for missing or malformed data', () => {
    expect(loadTodosFromStorage()).toEqual([]);
    sessionStorage.setItem(STORAGE_KEY, '{ not json');
    expect(loadTodosFromStorage()).toEqual([]);
  });

  it('saveTodosToStorage writes ISO strings and load parses back', () => {
    const todo: Todo = {
      id: 't1',
      title: 'Task',
      description: 'Desc',
      completed: false,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      dueDate: new Date('2025-01-10T00:00:00.000Z').toISOString(),
    };

    const ok = saveTodosToStorage([todo]);
    expect(ok).toBe(true);

    const raw = sessionStorage.getItem(STORAGE_KEY)!;
    expect(raw).toContain('2025-01-01T00:00:00.000Z');
    expect(raw).toContain('2025-01-10T00:00:00.000Z');

    const loaded = loadTodosFromStorage();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].createdAt).toBeInstanceOf(Date);
    expect(loaded[0].dueDate).toBe('2025-01-10T00:00:00.000Z');
  });

  it('saveTodosToStorage returns false on quota errors', () => {
    const setItemSpy = vi
      .spyOn(window.sessionStorage.__proto__, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota exceeded');
      });
    const ok = saveTodosToStorage([]);
    expect(ok).toBe(false);
    setItemSpy.mockRestore();
  });
});
