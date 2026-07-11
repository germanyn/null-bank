import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from '../src/components/RegistrationForm';

describe('RegistrationForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form fields', () => {
    render(<RegistrationForm onCustomerCreated={() => {}} />);

    expect(screen.getByLabelText(/cpf\/cnpj/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register customer/i })).toBeInTheDocument();
  });

  it('calls onCustomerCreated on successful creation', async () => {
    const user = userEvent.setup();
    const onCustomerCreated = vi.fn();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, cpfCnpj: '12345678901', name: 'João Silva' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<RegistrationForm onCustomerCreated={onCustomerCreated} />);

    await user.type(screen.getByLabelText(/cpf\/cnpj/i), '12345678901');
    await user.type(screen.getByLabelText(/name/i), 'João Silva');
    await user.type(screen.getByLabelText(/address/i), 'Rua das Flores, 123');
    await user.click(screen.getByRole('button', { name: /register customer/i }));

    await waitFor(() => {
      expect(onCustomerCreated).toHaveBeenCalled();
    });

    expect(screen.getByText('Customer registered successfully!')).toBeInTheDocument();
  });

  it('shows error message on server error', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Customer already exists with this CPF/CNPJ' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<RegistrationForm onCustomerCreated={() => {}} />);

    await user.type(screen.getByLabelText(/cpf\/cnpj/i), '12345678901');
    await user.type(screen.getByLabelText(/name/i), 'João Silva');
    await user.type(screen.getByLabelText(/address/i), 'Rua das Flores, 123');
    await user.click(screen.getByRole('button', { name: /register customer/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Customer already exists with this CPF/CNPJ');
    });
  });
});
