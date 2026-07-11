import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CustomerDetails } from '../src/components/CustomerDetails';

describe('CustomerDetails', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and displays customer details', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 1,
        cpfCnpj: '12345678901',
        name: 'João Silva',
        address: 'Rua das Flores, 123',
        type: 'INDIVIDUAL',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<CustomerDetails cpfCnpj="12345678901" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
    });

    expect(screen.getByText(/12345678901/)).toBeInTheDocument();
    expect(screen.getByText(/Rua das Flores, 123/)).toBeInTheDocument();
    expect(screen.getByText(/INDIVIDUAL/)).toBeInTheDocument();
  });

  it('shows error when customer not found', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Customer not found' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<CustomerDetails cpfCnpj="99999999999" onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Customer not found');
    });
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 1,
        cpfCnpj: '12345678901',
        name: 'João Silva',
        address: 'Rua das Flores, 123',
        type: 'INDIVIDUAL',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<CustomerDetails cpfCnpj="12345678901" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
    });

    const user = (await import('@testing-library/user-event')).default;
    await user.setup();
    await user.click(screen.getByRole('button', { name: /back to search/i }));

    expect(onBack).toHaveBeenCalled();
  });
});
