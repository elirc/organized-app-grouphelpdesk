// Author: Sam Rivera
// Issue: #6 â€” Provide primary app navigation

import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/tickets/new', label: 'New ticket' },
  { to: '/knowledge-base', label: 'Knowledge base' },
  { to: '/admin', label: 'Admin' },
];

export function Sidebar() {
  return (
    <aside className="border-r border-line bg-white p-4">
      <h1 className="text-xl font-bold">HelpDesk</h1>
      <nav className="mt-6 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm ${isActive ? 'bg-focus text-white' : 'hover:bg-mist'}`
            }
            to={link.to}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
