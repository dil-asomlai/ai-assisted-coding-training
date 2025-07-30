import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoProvider } from '../contexts/TodoContext';
import { useTodo } from '../hooks/useTodo';

const STORAGE_KEY = 'todos';

afterEach(() => {
  window.sessionStorage.clear();
});

const TestComponent = () => {
  const { todos, addTodo } = useTodo();
  return (
    <div>
      <button data-testid="add" onClick={() => addTodo('Persisted', 'desc')}>
        add
      </button>
      <div data-testid="count">{todos.length}</div>
    </div>
  );
};

describe('sessionStorage integration', () => {
  it('hydrates from sessionStorage when valid data present', () => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: '1',
          title: 'stored',
          description: 'desc',
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ])
    );

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('falls back to empty array when corrupt JSON', () => {
    window.sessionStorage.setItem(STORAGE_KEY, 'not-json');
    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('persists todos on change', async () => {
    const user = userEvent.setup();
    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    await user.click(screen.getByTestId('add'));

    await waitFor(() => {
      const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]');
      expect(stored.length).toBe(1);
    });
  });
});
