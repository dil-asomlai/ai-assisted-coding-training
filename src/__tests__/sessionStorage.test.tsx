import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { loadTodos, saveTodos, TODOS_STORAGE_KEY } from '../utils/sessionStorage';
import type { Todo } from '../types/Todo';

// Mock implementation of sessionStorage
const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
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
  } as unknown as Storage;
};

// Sample todo data
const sampleTodos: Todo[] = [
  {
    id: '1',
    title: 'Test',
    description: 'Test desc',
    completed: false,
    createdAt: new Date(),
  },
];

describe('sessionStorage utils', () => {
  let originalStorage: Storage;

  beforeEach(() => {
    originalStorage = window.sessionStorage;
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: createMockStorage(),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: originalStorage,
    });
  });

  it('loads todos when valid data exists', () => {
    window.sessionStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(sampleTodos));

    const loaded = loadTodos();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Test');
  });

  it('returns empty array and clears storage when data is corrupt', () => {
    window.sessionStorage.setItem(TODOS_STORAGE_KEY, 'not-json');

    const loaded = loadTodos();
    expect(loaded).toEqual([]);
    expect(window.sessionStorage.getItem(TODOS_STORAGE_KEY)).toBeNull();
  });

  it('saves todos successfully', () => {
    saveTodos(sampleTodos);
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      TODOS_STORAGE_KEY,
      JSON.stringify(sampleTodos)
    );
  });

  it('throws when quota exceeded', () => {
    (window.sessionStorage.setItem as unknown as Mock).mockImplementation(() => {
      const error = new DOMException('Quota exceeded', 'QuotaExceededError');
      throw error;
    });

    expect(() => saveTodos(sampleTodos)).toThrowError(DOMException);
  });
});
