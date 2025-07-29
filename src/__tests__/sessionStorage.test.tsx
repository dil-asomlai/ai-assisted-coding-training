import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadTodos, saveTodos, isValidTodos } from '../utils/sessionStorage';
import type { Todo } from '../types/Todo';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

// Sample valid todo data
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Test Todo 1',
    description: 'Test description 1',
    completed: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: '2',
    title: 'Test Todo 2',
    description: 'Test description 2',
    completed: true,
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
  },
];

describe('sessionStorage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear console warnings for cleaner test output
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('isValidTodos', () => {
    it('should return true for valid todo array', () => {
      expect(isValidTodos(mockTodos)).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isValidTodos([])).toBe(true);
    });

    it('should return false for non-array', () => {
      expect(isValidTodos(null)).toBe(false);
      expect(isValidTodos(undefined)).toBe(false);
      expect(isValidTodos('string')).toBe(false);
      expect(isValidTodos(123)).toBe(false);
      expect(isValidTodos({})).toBe(false);
    });

    it('should return false for array with invalid todo objects', () => {
      const invalidTodos = [
        { id: 1, title: 'Test', description: 'Test', completed: false }, // id should be string
        { title: 'Test', description: 'Test', completed: false }, // missing id
        { id: '1', description: 'Test', completed: false }, // missing title
        { id: '1', title: 'Test', completed: false }, // missing description
        { id: '1', title: 'Test', description: 'Test' }, // missing completed
      ];

      invalidTodos.forEach(invalid => {
        expect(isValidTodos([invalid])).toBe(false);
      });
    });

    it('should return true for todos with string dates (from JSON)', () => {
      const todosWithStringDates = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test description',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z', // String date
        },
      ];

      expect(isValidTodos(todosWithStringDates)).toBe(true);
    });
  });

  describe('loadTodos', () => {
    it('should return empty array when no data in storage', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const result = loadTodos();

      expect(result).toEqual([]);
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('todos');
    });

    it('should load and parse valid todos from storage', () => {
      const storedData = JSON.stringify(mockTodos);
      mockSessionStorage.getItem.mockReturnValue(storedData);

      const result = loadTodos();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Test Todo 1');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should clear storage and return empty array for invalid JSON', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid json');

      const result = loadTodos();

      expect(result).toEqual([]);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load todos from sessionStorage:',
        expect.any(Error)
      );
    });

    it('should clear storage and return empty array for invalid todo data', () => {
      const invalidData = JSON.stringify([{ invalid: 'data' }]);
      mockSessionStorage.getItem.mockReturnValue(invalidData);

      const result = loadTodos();

      expect(result).toEqual([]);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid todo data found in sessionStorage, clearing and starting fresh'
      );
    });

    it('should convert string dates back to Date objects', () => {
      const todosWithStringDates = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test description',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(todosWithStringDates));

      const result = loadTodos();

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('saveTodos', () => {
    it('should save todos to storage successfully', () => {
      const result = saveTodos(mockTodos);

      expect(result).toBeNull();
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('todos', JSON.stringify(mockTodos));
    });

    it('should return error message on QuotaExceededError', () => {
      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';
      mockSessionStorage.setItem.mockImplementation(() => {
        throw quotaError;
      });

      const result = saveTodos(mockTodos);

      expect(result).toBe('Storage quota exceeded – your latest changes may not be saved.');
      expect(console.warn).toHaveBeenCalledWith(
        'SessionStorage quota exceeded - your latest changes may not be saved'
      );
    });

    it('should return generic error message on other storage errors', () => {
      const genericError = new Error('Some other error');
      mockSessionStorage.setItem.mockImplementation(() => {
        throw genericError;
      });

      const result = saveTodos(mockTodos);

      expect(result).toBe('Failed to save changes to session storage.');
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to save todos to sessionStorage:',
        genericError
      );
    });

    it('should save empty array', () => {
      // Reset the mock to not throw errors for this test
      mockSessionStorage.setItem.mockImplementation(() => {});

      const result = saveTodos([]);

      expect(result).toBeNull();
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('todos', '[]');
    });
  });
});
