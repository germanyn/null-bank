import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders navigation and registration form by default', () => {
    render(<App />);

    expect(screen.getByText('Null Bank - Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf\/cnpj/i)).toBeInTheDocument();
  });

  it('switches to login view when login button is clicked', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByLabelText(/account number/i)).toBeInTheDocument();
  });
});
