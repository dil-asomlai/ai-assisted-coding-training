import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isValidTodos, loadTodos, saveTodos } from '../utils/sessionStorage';

describe('sessionStorage utils', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    let store: Record<string, string> = {};
    const mockStorage = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn(),
      length: 0,
    } as unknown as Storage;

    Object.defineProperty(window, 'sessionStorage', {
      value: mockStorage,
      configurable: true,
      writable: true,
    });
  });

  it('isValidTodos validates minimal todo shape', () => {
    expect(
      isValidTodos([
        { id: '1', title: 'A', completed: false },
        { id: '2', title: 'B', completed: true },
      ])
    ).toBe(true);

    // Intentionally invalid shapes to ensure validator returns false
    const invalidArray: unknown = [{ id: 1 as unknown as string, title: 'A', completed: false }];
    expect(isValidTodos(invalidArray as unknown as never)).toBe(false);
    const notAnArray: unknown = 'nope';
    expect(isValidTodos(notAnArray as unknown as never)).toBe(false);
  });

  it('loadTodos returns [] when nothing stored', () => {
    expect(loadTodos()).toEqual([]);
  });

  it('loadTodos returns parsed todos when valid', () => {
    const todos = [
      {
        id: '1',
        title: 'Test',
        description: 'Desc',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];
    window.sessionStorage.setItem('todos', JSON.stringify(todos));
    const loaded = loadTodos();
    expect(loaded.length).toBe(1);
    expect(loaded[0].title).toBe('Test');
    expect(loaded[0].createdAt instanceof Date).toBe(true);
  });

  it('loadTodos clears corrupt data and returns []', () => {
    window.sessionStorage.setItem('todos', '{not-json');
    const loaded = loadTodos();
    expect(loaded).toEqual([]);
  });

  it('saveTodos serializes and writes', () => {
    const now = new Date();
    saveTodos([
      {
        id: '1',
        title: 'X',
        description: '',
        completed: false,
        createdAt: now,
      },
    ]);
    const stored = window.sessionStorage.getItem('todos');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed[0].createdAt).toBe(now.toISOString());
  });

  it('saveTodos bubbles quota exceeded error', () => {
    const error = Object.assign(new Error('QuotaExceededError'), { name: 'QuotaExceededError' });
    (window.sessionStorage.setItem as unknown as (key: string, value: string) => void) = vi.fn(
      () => {
        throw error;
      }
    );
    expect(() => saveTodos([])).toThrowError();
  });

  // Restore after tests
  afterAll(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      configurable: true,
      writable: true,
    });
  });
});
