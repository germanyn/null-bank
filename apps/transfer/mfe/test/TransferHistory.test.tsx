import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TransferHistory } from '../src/components/TransferHistory';

describe('TransferHistory', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('displays transfer history after loading', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            transferId: 't1',
            sourceAccountNumber: '1111111111',
            destinationAccountNumber: '2222222222',
            amount: 100,
            status: 'completed',
            createdAt: '2026-07-11T10:00:00.000Z',
          },
          {
            transferId: 't2',
            sourceAccountNumber: '2222222222',
            destinationAccountNumber: '1111111111',
            amount: 50,
            status: 'pending',
            createdAt: '2026-07-11T11:00:00.000Z',
          },
        ]),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<TransferHistory accountNumber="1111111111" />);

    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('shows empty state when no transfers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<TransferHistory accountNumber="1111111111" />);

    await waitFor(() => {
      expect(screen.getByText('No transfers found.')).toBeInTheDocument();
    });
  });

  it('shows error when fetch fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Service unavailable' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<TransferHistory accountNumber="1111111111" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable');
    });
  });
});
