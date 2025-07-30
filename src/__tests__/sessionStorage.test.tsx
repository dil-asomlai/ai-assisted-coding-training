import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadTodos, saveTodos, isValidTodos } from '../utils/sessionStorage';
import { TodoProvider } from '../contexts/TodoContext';
import { useTodo } from '../hooks/useTodo';
import type { Todo } from '../types/Todo';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    store,
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
      // Update the reference since it's exposed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mockSessionStorage as any).store = store;
    }),
  };
})();

// Replace global sessionStorage with mock
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Test component that uses the context
const TestComponent = () => {
  const { todos, addTodo, toggleTodoCompletion, deleteTodo } = useTodo();

  return (
    <div>
      <button data-testid="add-todo" onClick={() => addTodo('Test Todo', 'Test Description')}>
        Add Todo
      </button>
      <div data-testid="todo-count">{todos.length}</div>
      {todos.map(todo => (
        <div key={todo.id} data-testid={`todo-item-${todo.id}`}>
          <span data-testid={`todo-title-${todo.id}`}>{todo.title}</span>
          <span data-testid={`todo-completed-${todo.id}`}>
            {todo.completed ? 'Completed' : 'Not completed'}
          </span>
          <button data-testid={`toggle-${todo.id}`} onClick={() => toggleTodoCompletion(todo.id)}>
            Toggle
          </button>
          <button data-testid={`delete-${todo.id}`} onClick={() => deleteTodo(todo.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

describe('sessionStorage utilities', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('isValidTodos', () => {
    it('should return true for valid todos array', () => {
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

    it('should return false for non-array data', () => {
      expect(isValidTodos(null)).toBe(false);
      expect(isValidTodos(undefined)).toBe(false);
      expect(isValidTodos('string')).toBe(false);
      expect(isValidTodos(123)).toBe(false);
      expect(isValidTodos({})).toBe(false);
    });

    it('should return false for array with invalid todo objects', () => {
      const invalidTodos = [
        { id: 1, title: 'Invalid', completed: false }, // id should be string
        { title: 'Missing id', completed: false }, // missing id
        { id: '2', title: 123, completed: false }, // title should be string
        { id: '3', title: 'Valid', completed: 'false' }, // completed should be boolean
      ];

      expect(isValidTodos(invalidTodos)).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(isValidTodos([])).toBe(true);
    });

    it('should accept createdAt as Date or string', () => {
      const todosWithDate: Todo[] = [
        {
          id: '1',
          title: 'Test',
          description: 'Test',
          completed: false,
          createdAt: new Date(),
        },
      ];

      const todosWithStringDate = [
        {
          id: '1',
          title: 'Test',
          description: 'Test',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      expect(isValidTodos(todosWithDate)).toBe(true);
      expect(isValidTodos(todosWithStringDate)).toBe(true);
    });
  });

  describe('loadTodos', () => {
    it('should return empty array when no data in storage', () => {
      const result = loadTodos();
      expect(result).toEqual([]);
    });

    it('should load and parse valid todos from storage', () => {
      const testTodos: Todo[] = [
        {
          id: '1',
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockSessionStorage.setItem('todos', JSON.stringify(testTodos));

      const result = loadTodos();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Test Todo');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should handle corrupt JSON gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockSessionStorage.setItem('todos', 'invalid json');

      const result = loadTodos();
      expect(result).toEqual([]);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle invalid todo structure gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const invalidData = [{ invalid: 'data' }];
      mockSessionStorage.setItem('todos', JSON.stringify(invalidData));

      const result = loadTodos();
      expect(result).toEqual([]);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid todos data found in sessionStorage, clearing storage'
      );

      consoleSpy.mockRestore();
    });

    it('should convert string dates to Date objects', () => {
      const todosWithStringDates = [
        {
          id: '1',
          title: 'Test',
          description: 'Test',
          completed: false,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockSessionStorage.setItem('todos', JSON.stringify(todosWithStringDates));

      const result = loadTodos();
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].createdAt.getFullYear()).toBe(2024);
    });
  });

  describe('saveTodos', () => {
    it('should successfully save todos to storage', () => {
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
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('todos', JSON.stringify(testTodos));
    });

    it('should handle QuotaExceededError', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockSessionStorage.setItem.mockImplementation(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = saveTodos([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage quota exceeded – your latest changes may not be saved');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle generic storage errors', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('Generic storage error');
      });

      const result = saveTodos([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage error: Generic storage error');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});

describe('TodoContext with sessionStorage integration', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
    vi.clearAllMocks();
    // Reset the setItem implementation to default
    mockSessionStorage.setItem.mockImplementation((key: string, value: string) => {
      mockSessionStorage.store[key] = value;
    });
  });

  it('should hydrate todos from sessionStorage on initialization', () => {
    const existingTodos: Todo[] = [
      {
        id: '1',
        title: 'Existing Todo',
        description: 'Existing Description',
        completed: true,
        createdAt: new Date('2024-01-01'),
      },
    ];

    mockSessionStorage.setItem('todos', JSON.stringify(existingTodos));

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    expect(screen.getByTestId('todo-count')).toHaveTextContent('1');
    expect(screen.getByTestId('todo-title-1')).toHaveTextContent('Existing Todo');
  });

  it('should persist todos to sessionStorage when state changes', async () => {
    const user = userEvent.setup();

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    const addButton = screen.getByTestId('add-todo');
    await user.click(addButton);

    // Wait for the effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSessionStorage.setItem).toHaveBeenCalled();
    // Get the last call (most recent) since setItem gets called twice:
    // once on mount with empty array, once after adding todo
    const calls = mockSessionStorage.setItem.mock.calls;
    const savedData = calls[calls.length - 1][1];
    const parsedData = JSON.parse(savedData);
    expect(parsedData).toHaveLength(1);
    expect(parsedData[0].title).toBe('Test Todo');
  });

  it('should show toast notification on storage quota error', async () => {
    const user = userEvent.setup();

    // Mock setItem to throw QuotaExceededError
    mockSessionStorage.setItem.mockImplementation(() => {
      const error = new Error('Quota exceeded');
      error.name = 'QuotaExceededError';
      throw error;
    });

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    const addButton = screen.getByTestId('add-todo');
    await user.click(addButton);

    // Wait for the effect and toast to appear
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText(/Storage quota exceeded/)).toBeInTheDocument();
    expect(screen.getByTestId('todo-count')).toHaveTextContent('1'); // App should still work
  });

  it('should start with empty state when sessionStorage has corrupt data', () => {
    mockSessionStorage.setItem('todos', 'invalid json');

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    expect(screen.getByTestId('todo-count')).toHaveTextContent('0');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
  });
});
