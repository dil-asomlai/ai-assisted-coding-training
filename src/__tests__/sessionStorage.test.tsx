import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Todo } from '../types/Todo';
import { loadTodos, saveTodos, isValidTodos } from '../utils/sessionStorage';

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
  value: mockSessionStorage
});

describe('sessionStorage utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('isValidTodos', () => {
    it('should return true for valid todo array', () => {
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

    it('should return false for non-array values', () => {
      expect(isValidTodos(null)).toBe(false);
      expect(isValidTodos(undefined)).toBe(false);
      expect(isValidTodos('not an array')).toBe(false);
      expect(isValidTodos(123)).toBe(false);
      expect(isValidTodos({})).toBe(false);
    });

    it('should return false for array with invalid todo objects', () => {
      const invalidTodos = [
        { id: 1, title: 'Test', completed: false }, // id should be string
        { title: 'Test', description: 'Test', completed: false }, // missing id
        { id: '1', description: 'Test', completed: false }, // missing title
        { id: '1', title: 'Test', completed: 'false' }, // completed should be boolean
      ];

      invalidTodos.forEach(invalidTodo => {
        expect(isValidTodos([invalidTodo])).toBe(false);
      });
    });

    it('should accept todos with createdAt as Date or string', () => {
      const todoWithDateObject: Todo = {
        id: '1',
        title: 'Test',
        description: 'Test',
        completed: false,
        createdAt: new Date(),
      };

      const todoWithDateString = {
        id: '2',
        title: 'Test',
        description: 'Test',
        completed: false,
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      expect(isValidTodos([todoWithDateObject])).toBe(true);
      expect(isValidTodos([todoWithDateString])).toBe(true);
    });
  });

  describe('loadTodos', () => {
    it('should return empty array when no data exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const result = loadTodos();

      expect(result).toEqual([]);
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('todos');
    });

    it('should return parsed todos when valid data exists', () => {
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

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Test Todo');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should return empty array and clear storage when JSON is invalid', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid json');

      // Spy on console.warn to verify it's called
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = loadTodos();

      expect(result).toEqual([]);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load todos from sessionStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should return empty array and clear storage when data is invalid', () => {
      const invalidData = [{ invalid: 'data' }];
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(invalidData));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = loadTodos();

      expect(result).toEqual([]);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid todos data found in sessionStorage, clearing...'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('saveTodos', () => {
    it('should save todos successfully', () => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date(),
        },
      ];

      const result = saveTodos(testTodos);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'todos',
        JSON.stringify(testTodos)
      );
    });

    it('should handle QuotaExceededError', () => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date(),
        },
      ];

      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      mockSessionStorage.setItem.mockImplementation(() => {
        throw quotaError;
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = saveTodos(testTodos);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage quota exceeded – your latest changes may not be saved.');
      expect(consoleSpy).toHaveBeenCalledWith('SessionStorage quota exceeded:', quotaError);

      consoleSpy.mockRestore();
    });

    it('should handle other storage errors', () => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date(),
        },
      ];

      const genericError = new Error('Some other error');
      mockSessionStorage.setItem.mockImplementation(() => {
        throw genericError;
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = saveTodos(testTodos);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save changes to session storage.');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save todos to sessionStorage:', genericError);

      consoleSpy.mockRestore();
    });
  });
}); 