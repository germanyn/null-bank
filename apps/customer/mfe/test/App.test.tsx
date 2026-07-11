import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App';

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders navigation and registration form by default', () => {
    render(<App />);

    expect(screen.getByText('Null Bank - Customer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Register$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Search$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf\/cnpj/i)).toBeInTheDocument();
  });

  it('switches to search view when search button is clicked', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByText(/search customers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search by name/i)).toBeInTheDocument();
  });
});
