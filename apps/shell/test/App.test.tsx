import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/App';

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

  it('renders placeholder content for the accounts route', () => {
    renderShell('/accounts');
    expect(screen.getByRole('heading', { level: 2, name: 'Accounts' })).toBeInTheDocument();
    expect(screen.getByText('Accounts content will be loaded here.')).toBeInTheDocument();
  });

  it('renders placeholder content for the customers route', () => {
    renderShell('/customers');
    expect(screen.getByRole('heading', { level: 2, name: 'Customers' })).toBeInTheDocument();
    expect(screen.getByText('Customers content will be loaded here.')).toBeInTheDocument();
  });

  it('renders placeholder content for the transfers route', () => {
    renderShell('/transfers');
    expect(screen.getByRole('heading', { level: 2, name: 'Transfers' })).toBeInTheDocument();
    expect(screen.getByText('Transfers content will be loaded here.')).toBeInTheDocument();
  });

  it('navigates between routes when sidebar links are clicked', async () => {
    const user = userEvent.setup();
    renderShell('/accounts');

    expect(screen.getByRole('heading', { level: 2, name: 'Accounts' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /customers/i }));
    expect(screen.getByRole('heading', { level: 2, name: 'Customers' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /transfers/i }));
    expect(screen.getByRole('heading', { level: 2, name: 'Transfers' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /accounts/i }));
    expect(screen.getByRole('heading', { level: 2, name: 'Accounts' })).toBeInTheDocument();
  });

  it('highlights the active navigation link', () => {
    renderShell('/accounts');
    const accountsLink = screen.getByRole('link', { name: /accounts/i });
    expect(accountsLink).toHaveAttribute('aria-current', 'page');
  });
});
