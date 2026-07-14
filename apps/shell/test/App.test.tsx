import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { App } from '../src/App';

vi.mock('../src/mfe-loaders', () => ({
  loaderMap: {
    '/accounts': vi.fn().mockResolvedValue({
      default: () => <div>Account MFE</div>,
    }),
    '/customers': vi.fn().mockResolvedValue({
      default: () => <div>Customer MFE</div>,
    }),
    '/transfers': vi.fn().mockResolvedValue({
      default: () => <div>Transfer MFE</div>,
    }),
  },
}));

function renderShell(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Shell', () => {
  it('renders without crashing', () => {
    renderShell();
    expect(screen.getByText('Null Bank')).toBeInTheDocument();
  });

  it('shows sidebar navigation links', () => {
    renderShell();
    expect(screen.getByRole('link', { name: /accounts/i })).toHaveAttribute('href', '/accounts');
    expect(screen.getByRole('link', { name: /customers/i })).toHaveAttribute('href', '/customers');
    expect(screen.getByRole('link', { name: /transfers/i })).toHaveAttribute('href', '/transfers');
  });

  it('renders the account MFE on /accounts route', async () => {
    renderShell('/accounts');
    expect(await screen.findByText('Account MFE')).toBeInTheDocument();
  });

  it('renders the customer MFE on /customers route', async () => {
    renderShell('/customers');
    expect(await screen.findByText('Customer MFE')).toBeInTheDocument();
  });

  it('renders the transfer MFE on /transfers route', async () => {
    renderShell('/transfers');
    expect(await screen.findByText('Transfer MFE')).toBeInTheDocument();
  });

  it('shows default message on unmatched route', () => {
    renderShell('/unknown');
    expect(screen.getByText('Select a domain from the sidebar')).toBeInTheDocument();
  });

  it('highlights the active navigation link', async () => {
    renderShell('/accounts');
    const accountsLink = screen.getByRole('link', { name: /accounts/i });
    expect(accountsLink).toHaveAttribute('aria-current', 'page');
  });
});
