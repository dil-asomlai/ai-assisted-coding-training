import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoProvider } from '../contexts/TodoContext';
import { ToastProvider } from '../components/Toast';
import { useTodo } from '../hooks/useTodo';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import * as sessionStorageUtils from '../utils/sessionStorage';
import type { Todo } from '../types/Todo';
// import { act } from 'react-dom/test-utils';

// Mock the sessionStorage utilities
vi.mock('../utils/sessionStorage');

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
          <span data-testid={`todo-desc-${todo.id}`}>{todo.description}</span>
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

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ToastProvider>
      <TodoProvider>{ui}</TodoProvider>
    </ToastProvider>
  );
};

describe('TodoContext with SessionStorage', () => {
  const mockLoadTodos = vi.mocked(sessionStorageUtils.loadTodos);
  const mockSaveTodos = vi.mocked(sessionStorageUtils.saveTodos);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockLoadTodos.mockReturnValue([]);
    mockSaveTodos.mockResolvedValue({ success: true });
  });

  it('loads todos from sessionStorage on mount', async () => {
    const existingTodos: Todo[] = [
      {
        id: '1',
        title: 'Existing Todo',
        description: 'From storage',
        completed: false,
        createdAt: new Date('2023-01-01'),
      },
    ];

    mockLoadTodos.mockReturnValue(existingTodos);

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('todo-count').textContent).toBe('1');
    });

    expect(screen.getByTestId('todo-title-1').textContent).toBe('Existing Todo');
    expect(mockLoadTodos).toHaveBeenCalledOnce();
  });
  it('provides empty todos array initially when no stored data', async () => {
    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('todo-count').textContent).toBe('0');
    });

    expect(mockLoadTodos).toHaveBeenCalledOnce();
  });

  it('saves todos to sessionStorage when adding a new todo', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestComponent />);

    await user.click(screen.getByTestId('add-todo'));

    await waitFor(() => {
      expect(screen.getByTestId('todo-count').textContent).toBe('1');
    });

    await waitFor(() => {
      expect(mockSaveTodos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Todo',
            description: 'Test Description',
            completed: false,
          }),
        ])
      );
    });
  });

  it('saves todos to sessionStorage when deleting a todo', async () => {
    const existingTodos: Todo[] = [
      {
        id: '1',
        title: 'Todo to delete',
        description: 'Will be deleted',
        completed: false,
        createdAt: new Date(),
      },
    ];

    mockLoadTodos.mockReturnValue(existingTodos);
    const user = userEvent.setup();

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('todo-count').textContent).toBe('1');
    });

    await user.click(screen.getByTestId('delete-1'));

    await waitFor(() => {
      expect(screen.getByTestId('todo-count').textContent).toBe('0');
    });

    await waitFor(() => {
      expect(mockSaveTodos).toHaveBeenCalledWith([]);
    });
  });

  it('shows toast when save fails with quota error', async () => {
    mockSaveTodos.mockResolvedValue({
      success: false,
      error: 'Storage quota exceeded – your latest changes may not be saved.',
    });

    const user = userEvent.setup();
    renderWithProviders(<TestComponent />);

    await user.click(screen.getByTestId('add-todo'));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    const toastMessages = screen.getAllByText(
      'Storage quota exceeded – your latest changes may not be saved.'
    );
    expect(toastMessages.length).toBeGreaterThan(0);
  });

  // Keep the original tests that don't require sessionStorage
  it('provides empty todos array initially', () => {
    renderWithProviders(<TestComponent />);

    expect(screen.getByTestId('todo-count').textContent).toBe('0');
  });

  it('can add a new todo', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestComponent />);

    await user.click(screen.getByTestId('add-todo'));

    await waitFor(() => {
      expect(screen.getByTestId('todo-count').textContent).toBe('1');
    });
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('can toggle todo completion status', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestComponent />);

    await user.click(screen.getByTestId('add-todo'));

    await waitFor(() => {
      const todoId =
        screen.getByTestId('todo-count').textContent === '1'
          ? screen
              .getByText('Test Todo')
              .closest('[data-testid^="todo-item-"]')
              ?.getAttribute('data-testid')
              ?.replace('todo-item-', '')
          : '';

      expect(screen.getByTestId(`todo-completed-${todoId}`).textContent).toBe('Not completed');

      return user.click(screen.getByTestId(`toggle-${todoId}`));
    });

    await waitFor(() => {
      const todoId = screen
        .getByText('Test Todo')
        .closest('[data-testid^="todo-item-"]')
        ?.getAttribute('data-testid')
        ?.replace('todo-item-', '');

      expect(screen.getByTestId(`todo-completed-${todoId}`).textContent).toBe('Completed');
    });
  });

  it('can delete a todo', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestComponent />);

    await user.click(screen.getByTestId('add-todo'));

    await waitFor(() => {
      expect(screen.getByTestId('todo-count').textContent).toBe('1');
    });

    const todoId = screen
      .getByText('Test Todo')
      .closest('[data-testid^="todo-item-"]')
      ?.getAttribute('data-testid')
      ?.replace('todo-item-', '');

    await user.click(screen.getByTestId(`delete-${todoId}`));

    await waitFor(() => {
      expect(screen.getByTestId('todo-count').textContent).toBe('0');
    });
  });
});
