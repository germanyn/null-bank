import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from '../src/components/RegistrationForm';

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form fields', () => {
    render(<RegistrationForm onAccountCreated={() => {}} />);

    expect(screen.getByLabelText(/cpf\/cnpj/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/initial balance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('calls onAccountCreated on successful creation', async () => {
    const user = userEvent.setup();
    const onAccountCreated = vi.fn();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ accountNumber: '1234567890' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<RegistrationForm onAccountCreated={onAccountCreated} />);

    await user.type(screen.getByLabelText(/cpf\/cnpj/i), '12345678901');
    await user.type(screen.getByLabelText(/password/i), 'securePass123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(onAccountCreated).toHaveBeenCalledWith('1234567890');
    });

    expect(screen.getByText('Account created successfully!')).toBeInTheDocument();
  });

  it('shows error message on server error', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Account already exists for this CPF/CNPJ' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<RegistrationForm onAccountCreated={() => {}} />);

    await user.type(screen.getByLabelText(/cpf\/cnpj/i), '12345678901');
    await user.type(screen.getByLabelText(/password/i), 'securePass123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Account already exists for this CPF/CNPJ');
    });
  });

  it('shows network error when fetch fails', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    render(<RegistrationForm onAccountCreated={() => {}} />);

    await user.type(screen.getByLabelText(/cpf\/cnpj/i), '12345678901');
    await user.type(screen.getByLabelText(/password/i), 'securePass123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
    });
  });
});
