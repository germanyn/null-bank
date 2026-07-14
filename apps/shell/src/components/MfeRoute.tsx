import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface MfeRouteProps {
  loader: () => Promise<{ default: React.ComponentType }>;
}

export function MfeRoute({ loader }: MfeRouteProps) {
  const [retryKey, setRetryKey] = useState(0);

  const LazyComponent = useMemo(() => React.lazy(loader), [retryKey, loader]);

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  return (
    <ErrorBoundary onRetry={handleRetry}>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
