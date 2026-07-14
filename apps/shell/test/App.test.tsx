import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/App';

vi.mock('../src/mfe-loaders', () => ({
  loaderMap: {
    '/accounts': () => Promise.resolve({ default: () => <div>Account MFE loaded</div> }),
    '/customers': () => Promise.resolve({ default: () => <div>Customer MFE loaded</div> }),
    '/transfers': () => Promise.resolve({ default: () => <div>Transfer MFE loaded</div> }),
  },
}));

function renderShell(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Shell', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the top bar with "Null Bank" title', () => {
    renderShell();
    expect(screen.getByRole('heading', { name: 'Null Bank' })).toBeInTheDocument();
  });

  it('renders sidebar navigation links', () => {
    renderShell();
    expect(screen.getByRole('link', { name: /accounts/i })).toHaveAttribute('href', '/accounts');
    expect(screen.getByRole('link', { name: /customers/i })).toHaveAttribute('href', '/customers');
    expect(screen.getByRole('link', { name: /transfers/i })).toHaveAttribute('href', '/transfers');
  });

  it('loads the account MFE on the /accounts route', async () => {
    renderShell('/accounts');
    await waitFor(() => {
      expect(screen.getByText('Account MFE loaded')).toBeInTheDocument();
    });
  });

  it('loads the customer MFE on the /customers route', async () => {
    renderShell('/customers');
    await waitFor(() => {
      expect(screen.getByText('Customer MFE loaded')).toBeInTheDocument();
    });
  });

  it('loads the transfer MFE on the /transfers route', async () => {
    renderShell('/transfers');
    await waitFor(() => {
      expect(screen.getByText('Transfer MFE loaded')).toBeInTheDocument();
    });
  });

  it('navigates between routes when sidebar links are clicked', async () => {
    const user = userEvent.setup();
    renderShell('/accounts');

    await waitFor(() => {
      expect(screen.getByText('Account MFE loaded')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('link', { name: /customers/i }));
    await waitFor(() => {
      expect(screen.getByText('Customer MFE loaded')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('link', { name: /transfers/i }));
    await waitFor(() => {
      expect(screen.getByText('Transfer MFE loaded')).toBeInTheDocument();
    });
  });

  it('highlights the active navigation link', async () => {
    renderShell('/accounts');
    const accountsLink = screen.getByRole('link', { name: /accounts/i });
    expect(accountsLink).toHaveAttribute('aria-current', 'page');
  });
});
