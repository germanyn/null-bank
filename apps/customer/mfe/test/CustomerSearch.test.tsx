import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerSearch } from '../src/components/CustomerSearch';

describe('CustomerSearch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the search form', () => {
    render(<CustomerSearch onCustomerSelected={() => {}} />);

    expect(screen.getByLabelText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('displays search results', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        customers: [
          { id: 1, cpfCnpj: '12345678901', name: 'João Silva', address: 'Rua das Flores, 123', type: 'INDIVIDUAL' },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<CustomerSearch onCustomerSelected={() => {}} />);

    await user.type(screen.getByLabelText(/search by name/i), 'João');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
    });
  });

  it('shows no results message when empty', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ customers: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<CustomerSearch onCustomerSelected={() => {}} />);

    await user.type(screen.getByLabelText(/search by name/i), 'nonexistent');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/no customers found/i)).toBeInTheDocument();
    });
  });

  it('calls onCustomerSelected when a customer is clicked', async () => {
    const user = userEvent.setup();
    const onCustomerSelected = vi.fn();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        customers: [
          { id: 1, cpfCnpj: '12345678901', name: 'João Silva', address: 'Rua das Flores, 123', type: 'INDIVIDUAL' },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<CustomerSearch onCustomerSelected={onCustomerSelected} />);

    await user.type(screen.getByLabelText(/search by name/i), 'João');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/João Silva/));

    expect(onCustomerSelected).toHaveBeenCalledWith('12345678901');
  });
});
