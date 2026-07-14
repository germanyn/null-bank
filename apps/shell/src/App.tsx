import { Routes, Route, NavLink } from 'react-router-dom';

function Placeholder({ domain }: { domain: string }) {
  return <div>{domain} — coming soon</div>;
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
          <Route path="/accounts/*" element={<Placeholder domain="Accounts" />} />
          <Route path="/customers/*" element={<Placeholder domain="Customers" />} />
          <Route path="/transfers/*" element={<Placeholder domain="Transfers" />} />
          <Route path="*" element={<div>Select a domain from the sidebar</div>} />
        </Routes>
      </main>
    </div>
  );
}
