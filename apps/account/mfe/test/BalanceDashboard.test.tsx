import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BalanceDashboard } from '../src/components/BalanceDashboard';

describe('BalanceDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the account number', () => {
    render(<BalanceDashboard accountNumber="1234567890" />);

    expect(screen.getByText(/account.*1234567890/i)).toBeInTheDocument();
  });

  it('fetches and displays balance on load', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ accountNumber: '1234567890', balance: 1500 }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<BalanceDashboard accountNumber="1234567890" />);

    await waitFor(() => {
      expect(screen.getByTestId('balance-value')).toHaveTextContent(/\$1,500/);
    });
  });

  it('shows error when balance fetch fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Account not found' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<BalanceDashboard accountNumber="9999999999" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Account not found');
    });
  });
});
