import { NavLink } from 'react-router-dom';
import { routes } from '../routes';

export function Sidebar() {
  return (
    <aside style={{ width: 200, background: '#1a1a2e', color: '#fff', padding: '1rem 0' }}>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {routes.map((route) => (
            <li key={route.path}>
              <NavLink
                to={route.path}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '0.75rem 1rem',
                  color: isActive ? '#fff' : '#aaa',
                  textDecoration: 'none',
                  background: isActive ? '#16213e' : 'transparent',
                })}
              >
                {route.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
