import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MfeRoute } from '../src/components/MfeRoute';

function FakeMfeApp() {
  return <div>Account MFE loaded</div>;
}

describe('MfeRoute', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the loaded MFE component', async () => {
    const loader = vi.fn().mockResolvedValue({ default: FakeMfeApp });
    render(<MfeRoute loader={loader} />);
    await waitFor(() => {
      expect(screen.getByText('Account MFE loaded')).toBeInTheDocument();
    });
  });

  it('shows loading state while the MFE is loading', () => {
    let resolveLoader: (value: { default: React.ComponentType }) => void;
    const loader = vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveLoader = resolve; }),
    );
    render(<MfeRoute loader={loader} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    resolveLoader!({ default: FakeMfeApp });
  });

  it('shows error boundary fallback when the MFE fails to load', async () => {
    const loader = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<MfeRoute loader={loader} />);
    await waitFor(() => {
      expect(screen.getByText('Service unavailable. Retry?')).toBeInTheDocument();
    });
  });

  it('retry re-triggers loading the MFE', async () => {
    const user = userEvent.setup();
    let callCount = 0;
    const loader = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ default: FakeMfeApp });
    });

    render(<MfeRoute loader={loader} />);

    await waitFor(() => {
      expect(screen.getByText('Service unavailable. Retry?')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText('Account MFE loaded')).toBeInTheDocument();
    });

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('does not show error fallback when MFE loads successfully', async () => {
    const loader = vi.fn().mockResolvedValue({ default: FakeMfeApp });
    render(<MfeRoute loader={loader} />);
    await waitFor(() => {
      expect(screen.getByText('Account MFE loaded')).toBeInTheDocument();
    });
    expect(screen.queryByText('Service unavailable. Retry?')).not.toBeInTheDocument();
  });
});
