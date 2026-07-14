import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { App } from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';

function renderShell(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

function ThrowingComponent(): JSX.Element {
  throw new Error('MFE load failed');
}

describe('Shell smoke tests', () => {
  it('renders without crashing with sidebar', () => {
    renderShell();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('shows sidebar navigation links', () => {
    renderShell();
    expect(screen.getByRole('link', { name: /accounts/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /customers/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transfers/i })).toBeInTheDocument();
  });

  it.each([
    ['accounts', 'Accounts'],
    ['customers', 'Customers'],
    ['transfers', 'Transfers'],
  ])('renders %s placeholder on /%s route', (_path, title) => {
    renderShell(`/${_path}`);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('navigates between routes via sidebar links', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('link', { name: /accounts/i }));
    expect(screen.getByRole('heading', { name: 'Accounts' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /customers/i }));
    expect(screen.getByRole('heading', { name: 'Customers' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /transfers/i }));
    expect(screen.getByRole('heading', { name: 'Transfers' })).toBeInTheDocument();
  });

  it('error boundary catches thrown error and renders fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Service unavailable. Retry?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('redirects unmatched route to accounts', () => {
    renderShell('/unknown');
    expect(screen.getByRole('heading', { name: 'Accounts' })).toBeInTheDocument();
  });
});
