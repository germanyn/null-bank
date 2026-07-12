import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = document.getElementById('root');
if (root) {
  const accountNumber = new URLSearchParams(window.location.search).get('account') || '';
  createRoot(root).render(
    <StrictMode>
      <App accountNumber={accountNumber} />
    </StrictMode>,
  );
}
