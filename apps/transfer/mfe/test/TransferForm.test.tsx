import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferForm } from '../src/components/TransferForm';

describe('TransferForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form fields', () => {
    render(<TransferForm sourceAccountNumber="1111111111" onTransferCreated={() => {}} />);

    expect(screen.getByLabelText(/destination account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send transfer/i })).toBeInTheDocument();
  });

  it('calls onTransferCreated on successful transfer', async () => {
    const user = userEvent.setup();
    const onTransferCreated = vi.fn();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ transferId: 'transfer-123' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<TransferForm sourceAccountNumber="1111111111" onTransferCreated={onTransferCreated} />);

    await user.type(screen.getByLabelText(/destination account/i), '2222222222');
    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.click(screen.getByRole('button', { name: /send transfer/i }));

    await waitFor(() => {
      expect(onTransferCreated).toHaveBeenCalledWith('transfer-123');
    });

    expect(screen.getByText('Transfer initiated!')).toBeInTheDocument();
  });

  it('shows error message on server error', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Insufficient funds' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<TransferForm sourceAccountNumber="1111111111" onTransferCreated={() => {}} />);

    await user.type(screen.getByLabelText(/destination account/i), '2222222222');
    await user.type(screen.getByLabelText(/amount/i), '1000');
    await user.click(screen.getByRole('button', { name: /send transfer/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Insufficient funds');
    });
  });

  it('shows network error when fetch fails', async () => {
    const user = userEvent.setup();

    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    render(<TransferForm sourceAccountNumber="1111111111" onTransferCreated={() => {}} />);

    await user.type(screen.getByLabelText(/destination account/i), '2222222222');
    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.click(screen.getByRole('button', { name: /send transfer/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
    });
  });
});
