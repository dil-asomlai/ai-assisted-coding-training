import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoProvider } from '../contexts/TodoContext';
import { useTodo } from '../hooks/useTodo';
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

// Test component that uses the TodoContext
const TestComponent = () => {
  const { todos, addTodo, deleteTodo, toggleTodoCompletion } = useTodo();

  return (
    <div>
      <div data-testid="todo-count">{todos.length}</div>
      {todos.map(todo => (
        <div key={todo.id} data-testid={`todo-${todo.id}`}>
          <span>{todo.title}</span>
          <span>{todo.completed ? 'completed' : 'pending'}</span>
          <button onClick={() => toggleTodoCompletion(todo.id)}>Toggle</button>
          <button onClick={() => deleteTodo(todo.id)}>Delete</button>
        </div>
      ))}
      <button onClick={() => addTodo('New Todo', 'New Description')} data-testid="add-todo">
        Add Todo
      </button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <TodoProvider>
      <TestComponent />
    </TodoProvider>
  );
};

// Sample todos for testing
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Existing Todo',
    description: 'Existing Description',
    completed: false,
    createdAt: new Date('2024-01-01'),
  },
];

describe('TodoContext with sessionStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear console warnings for cleaner test output
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should hydrate todos from sessionStorage on initialization', () => {
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockTodos));

    renderWithProvider();

    expect(screen.getByTestId('todo-count')).toHaveTextContent('1');
    expect(screen.getByTestId('todo-1')).toBeInTheDocument();
    expect(screen.getByText('Existing Todo')).toBeInTheDocument();
  });

  it('should start with empty array when no stored data', () => {
    mockSessionStorage.getItem.mockReturnValue(null);

    renderWithProvider();

    expect(screen.getByTestId('todo-count')).toHaveTextContent('0');
  });

  it('should persist todos to sessionStorage when state changes', async () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    const user = userEvent.setup();

    renderWithProvider();

    // Add a todo
    await user.click(screen.getByTestId('add-todo'));

    // Wait for the effect to run
    await waitFor(() => {
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
    });

    const setItemCalls = mockSessionStorage.setItem.mock.calls;
    const lastCall = setItemCalls[setItemCalls.length - 1];
    const [key, value] = lastCall;

    expect(key).toBe('todos');
    const savedTodos = JSON.parse(value);
    expect(savedTodos).toHaveLength(1);
    expect(savedTodos[0].title).toBe('New Todo');
    expect(savedTodos[0].description).toBe('New Description');
  });

  it('should show toast notification on storage quota error', async () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';
    mockSessionStorage.setItem.mockImplementation(() => {
      throw quotaError;
    });

    const user = userEvent.setup();
    renderWithProvider();

    // Add a todo to trigger storage save
    await user.click(screen.getByTestId('add-todo'));

    // Wait for toast to appear
    await waitFor(() => {
      expect(screen.getByText(/Storage quota exceeded/)).toBeInTheDocument();
    });
  });

  it('should handle corrupt data gracefully', () => {
    mockSessionStorage.getItem.mockReturnValue('invalid json');

    renderWithProvider();

    // Should start with empty array
    expect(screen.getByTestId('todo-count')).toHaveTextContent('0');

    // Should have cleared the corrupt data
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
  });

  it('should handle invalid todo data gracefully', () => {
    const invalidData = JSON.stringify([{ invalid: 'data' }]);
    mockSessionStorage.getItem.mockReturnValue(invalidData);

    renderWithProvider();

    // Should start with empty array
    expect(screen.getByTestId('todo-count')).toHaveTextContent('0');

    // Should have cleared the invalid data
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('todos');
  });

  it('should continue to work normally after storage errors', async () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    // First save will fail, subsequent ones succeed
    let shouldFail = true;
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';

    mockSessionStorage.setItem.mockImplementation(() => {
      if (shouldFail) {
        shouldFail = false;
        throw quotaError;
      }
    });

    const user = userEvent.setup();
    renderWithProvider();

    // Add first todo (will trigger storage error)
    await user.click(screen.getByTestId('add-todo'));

    await waitFor(() => {
      expect(screen.getByTestId('todo-count')).toHaveTextContent('1');
    });

    // Add second todo (should succeed)
    await user.click(screen.getByTestId('add-todo'));

    await waitFor(() => {
      expect(screen.getByTestId('todo-count')).toHaveTextContent('2');
    });

    // App should continue to function normally
    expect(screen.getByTestId('todo-count')).toHaveTextContent('2');
  });
});
