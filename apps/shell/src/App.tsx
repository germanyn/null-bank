import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Placeholder } from './components/Placeholder';

export function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '2rem' }}>
          <Routes>
            <Route path="/accounts" element={<Placeholder title="Accounts" />} />
            <Route path="/customers" element={<Placeholder title="Customers" />} />
            <Route path="/transfers" element={<Placeholder title="Transfers" />} />
            <Route path="*" element={<Navigate to="/accounts" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
