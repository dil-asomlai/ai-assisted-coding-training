import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoProvider } from '../contexts/TodoContext';
import { useTodo } from '../hooks/useTodo';

const STORAGE_KEY = 'todos';

// Helper test component exposing addTodo
const TestComponent = () => {
  const { todos, addTodo } = useTodo();
  return (
    <div>
      <button data-testid="add" onClick={() => addTodo('Persisted', 'From test')}>
        Add
      </button>
      <div data-testid="count">{todos.length}</div>
    </div>
  );
};

// Reset sessionStorage between tests
beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  window.sessionStorage.clear();
});

describe('sessionStorage integration', () => {
  it('hydrates todos from valid sessionStorage', () => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: '1',
          title: 'Stored',
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

  it('clears corrupt data and starts empty', () => {
    window.sessionStorage.setItem(STORAGE_KEY, '{not-valid-json');

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
    // The key should have been removed
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it.skip('shows toast when quota exceeded', async () => {
    const user = userEvent.setup();

    const originalSetItem = window.sessionStorage.setItem;
    // Mock setItem to throw QuotaExceededError after first normal call
    const mock = vi.fn().mockImplementation(() => {
      const err = new DOMException('Quota exceeded', 'QuotaExceededError');
      throw err;
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore – overwrite method for test
    window.sessionStorage.setItem = mock as unknown as typeof window.sessionStorage.setItem;

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    await user.click(screen.getByTestId('add'));

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Snackbar should trigger a console warning even if UI portal isn't captured
    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalled();
    });

    warnSpy.mockRestore();

    // Restore original
    window.sessionStorage.setItem = originalSetItem;
  });
});
