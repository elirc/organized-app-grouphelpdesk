// Author: Sam Rivera
// Issue: #6 â€” Compose application shell

import { Outlet } from 'react-router-dom';

import { ErrorBoundary } from '../shared/ErrorBoundary';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <Sidebar />
      <div>
        <Header />
        <main className="p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
