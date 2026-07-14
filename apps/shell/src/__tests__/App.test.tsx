import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { App } from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';

vi.mock('../mfe-loaders', () => ({
  loaderMap: {
    '/accounts': () => Promise.resolve({ default: () => <div><h2>Accounts</h2></div> }),
    '/customers': () => Promise.resolve({ default: () => <div><h2>Customers</h2></div> }),
    '/transfers': () => Promise.resolve({ default: () => <div><h2>Transfers</h2></div> }),
  },
}));

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
  ])('renders %s placeholder on /%s route', async (_path, title) => {
    renderShell(`/${_path}`);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
  });

  it('navigates between routes via sidebar links', async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole('link', { name: /accounts/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Accounts' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('link', { name: /customers/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Customers' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('link', { name: /transfers/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Transfers' })).toBeInTheDocument();
    });
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

  it('redirects unmatched route to accounts', async () => {
    renderShell('/unknown');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Accounts' })).toBeInTheDocument();
    });
  });
});
