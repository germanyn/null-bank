import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { App } from '../src/App';

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
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Transfers')).toBeInTheDocument();
  });

  it('renders placeholder for accounts route', () => {
    renderShell('/accounts');
    expect(screen.getByText('Accounts — coming soon')).toBeInTheDocument();
  });

  it('renders placeholder for customers route', () => {
    renderShell('/customers');
    expect(screen.getByText('Customers — coming soon')).toBeInTheDocument();
  });

  it('renders placeholder for transfers route', () => {
    renderShell('/transfers');
    expect(screen.getByText('Transfers — coming soon')).toBeInTheDocument();
  });

  it('shows default message on unmatched route', () => {
    renderShell('/unknown');
    expect(screen.getByText('Select a domain from the sidebar')).toBeInTheDocument();
  });
});
