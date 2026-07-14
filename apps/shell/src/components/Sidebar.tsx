import { NavLink } from 'react-router-dom';

const links = [
  { to: '/accounts', label: 'Accounts' },
  { to: '/customers', label: 'Customers' },
  { to: '/transfers', label: 'Transfers' },
];

export function Sidebar() {
  return (
    <aside style={{ width: 200, background: '#1a1a2e', color: '#fff', padding: '1rem 0' }}>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '0.75rem 1rem',
                  color: isActive ? '#fff' : '#aaa',
                  textDecoration: 'none',
                  background: isActive ? '#16213e' : 'transparent',
                })}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
