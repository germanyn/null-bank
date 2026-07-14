import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('MFE load failed');
  }
  return <div>Child content</div>;
}

describe('ErrorBoundary', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    spy.mockClear();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('shows fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Service unavailable. Retry?')).toBeInTheDocument();
  });

  it('does not show the child content when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.queryByText('Child content')).not.toBeInTheDocument();
  });

  it('renders retry button in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('retries rendering children when retry is clicked', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) {
        throw new Error('MFE load failed');
      }
      return <div>Loaded successfully</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Service unavailable. Retry?')).toBeInTheDocument();

    shouldThrow = false;

    await user.click(screen.getByRole('button', { name: /retry/i }));

    rerender(
      <ErrorBoundary>
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Loaded successfully')).toBeInTheDocument();
  });
});
