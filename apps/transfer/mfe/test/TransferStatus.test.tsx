import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TransferStatus } from '../src/components/TransferStatus';

describe('TransferStatus', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('displays transfer details after loading', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          transferId: 'transfer-abc',
          sourceAccountNumber: '1111111111',
          destinationAccountNumber: '2222222222',
          amount: 150,
          status: 'completed',
          createdAt: '2026-07-11T10:00:00.000Z',
        }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<TransferStatus transferId="transfer-abc" />);

    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    expect(screen.getByText('1111111111')).toBeInTheDocument();
    expect(screen.getByText('2222222222')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Transfer not found' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<TransferStatus transferId="nonexistent" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Transfer not found');
    });
  });
});
