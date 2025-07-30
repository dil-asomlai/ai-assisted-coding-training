import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadTodos, saveTodos, isValidTodos, clearTodos } from '../utils/sessionStorage';
import type { Todo } from '../types/Todo';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock console methods
const consoleSpy = {
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};

describe('sessionStorage utilities', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    mockSessionStorage.clear();

    // Replace global sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
  });

  describe('isValidTodos', () => {
    it('should return true for valid todo arrays', () => {
      const validTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date(),
        },
      ];

      expect(isValidTodos(validTodos)).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(isValidTodos([])).toBe(true);
    });

    it('should return false for non-arrays', () => {
      expect(isValidTodos(null)).toBe(false);
      expect(isValidTodos(undefined)).toBe(false);
      expect(isValidTodos('not an array')).toBe(false);
      expect(isValidTodos(123)).toBe(false);
      expect(isValidTodos({})).toBe(false);
    });

    it('should return false for arrays with invalid todo objects', () => {
      const invalidTodos = [
        { id: 1, title: 'Test', completed: false }, // id should be string
        { title: 'Test', description: 'Test', completed: false, createdAt: new Date() }, // missing id
        { id: '1', description: 'Test', completed: false, createdAt: new Date() }, // missing title
        { id: '1', title: 'Test', completed: 'false', createdAt: new Date() }, // completed should be boolean
      ];

      invalidTodos.forEach(todo => {
        expect(isValidTodos([todo])).toBe(false);
      });
    });

    it('should return true for todos with string createdAt (serialized dates)', () => {
      const todosWithStringDate = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      expect(isValidTodos(todosWithStringDate)).toBe(true);
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
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2023-01-01'),
        },
      ];

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(testTodos));

      const result = loadTodos();

      expect(result).toEqual(testTodos);
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should handle corrupt JSON data gracefully', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid json {');

      const result = loadTodos();

      expect(result).toEqual([]);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to load todos from sessionStorage:',
        expect.any(Error)
      );
    });

    it('should handle invalid todo data gracefully', () => {
      const invalidData = [{ invalid: 'data' }];
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(invalidData));

      const result = loadTodos();

      expect(result).toEqual([]);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Invalid todos data found in sessionStorage, clearing and starting fresh'
      );
    });

    it('should convert string dates back to Date objects', () => {
      const todosWithStringDates = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(todosWithStringDates));

      const result = loadTodos();

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].createdAt.toISOString()).toBe('2023-01-01T00:00:00.000Z');
    });
  });

  describe('saveTodos', () => {
    it('should save todos to storage successfully', async () => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2023-01-01'),
        },
      ];

      const result = await saveTodos(testTodos);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('todos', JSON.stringify(testTodos));
    });

    it('should handle quota exceeded errors', async () => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date(),
        },
      ];

      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      mockSessionStorage.setItem.mockImplementation(() => {
        throw quotaError;
      });

      const result = await saveTodos(testTodos);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage quota exceeded – your latest changes may not be saved.');
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Storage quota exceeded – your latest changes may not be saved.',
        quotaError
      );
    });

    it('should handle other storage errors', async () => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date(),
        },
      ];

      const genericError = new Error('Generic storage error');
      mockSessionStorage.setItem.mockImplementation(() => {
        throw genericError;
      });

      const result = await saveTodos(testTodos);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save todos to sessionStorage');
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to save todos to sessionStorage',
        genericError
      );
    });
  });

  describe('clearTodos', () => {
    it('should clear todos from storage', () => {
      clearTodos();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
    });

    it('should handle errors gracefully', () => {
      const error = new Error('Storage error');
      mockSessionStorage.removeItem.mockImplementation(() => {
        throw error;
      });

      clearTodos();

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        'Failed to clear todos from sessionStorage:',
        error
      );
    });
  });
});
