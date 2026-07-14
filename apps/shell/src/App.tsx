import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MfeRoute } from './components/MfeRoute';
import { loaderMap } from './mfe-loaders';
import { routes } from './routes';

export function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '2rem' }}>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<MfeRoute loader={loaderMap[route.path]} />}
              />
            ))}
            <Route path="*" element={<Navigate to="/accounts" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
