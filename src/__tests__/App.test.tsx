import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <App />
      </LocalizationProvider>
    );
    expect(screen.getByRole('heading', { level: 1, name: /todo app/i })).toBeInTheDocument();
  });
});
