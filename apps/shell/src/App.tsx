import { Routes, Route, NavLink } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

function Placeholder({ domain }: { domain: string }) {
  return <div>{domain} — coming soon</div>;
}

function DomainContent({ domain }: { domain: string }) {
  return (
    <ErrorBoundary domain={domain}>
      <Placeholder domain={domain} />
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 200, background: '#f5f5f5', padding: 16 }}>
        <h2>Null Bank</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>
            <NavLink to="/accounts">Accounts</NavLink>
          </li>
          <li>
            <NavLink to="/customers">Customers</NavLink>
          </li>
          <li>
            <NavLink to="/transfers">Transfers</NavLink>
          </li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: 16 }}>
        <Routes>
          <Route path="/accounts/*" element={<DomainContent domain="Accounts" />} />
          <Route path="/customers/*" element={<DomainContent domain="Customers" />} />
          <Route path="/transfers/*" element={<DomainContent domain="Transfers" />} />
          <Route path="*" element={<div>Select a domain from the sidebar</div>} />
        </Routes>
      </main>
    </div>
  );
}
