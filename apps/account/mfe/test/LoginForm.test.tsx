import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../src/components/LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form fields', () => {
    render(<LoginForm onLogin={() => {}} />);

    expect(screen.getByLabelText(/account number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls onLogin on successful login', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ accountNumber: '1234567890', token: 'abc123' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText(/account number/i), '1234567890');
    await user.type(screen.getByLabelText(/password/i), 'pass123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('1234567890', 'abc123');
    });
  });

  it('shows error on invalid credentials', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<LoginForm onLogin={() => {}} />);

    await user.type(screen.getByLabelText(/account number/i), '1234567890');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });
  });
});
