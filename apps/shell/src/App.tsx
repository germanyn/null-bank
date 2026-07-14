import { Routes, Route, NavLink } from 'react-router-dom';
import { MfeRoute } from './components/MfeRoute';
import { routes } from './routes';
import { loaderMap } from './mfe-loaders';

export function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 200, background: '#f5f5f5', padding: 16 }}>
        <h2>Null Bank</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {routes.map((route) => (
            <li key={route.path}>
              <NavLink to={route.path}>{route.title}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main style={{ flex: 1, padding: 16 }}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={`${route.path}/*`}
              element={<MfeRoute loader={loaderMap[route.path]} />}
            />
          ))}
          <Route path="*" element={<div>Select a domain from the sidebar</div>} />
        </Routes>
      </main>
    </div>
  );
}
