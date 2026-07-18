// Author: Sam Rivera
// Issue: Learning Phase 4 - Protect routes in the client without replacing server authorization

import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
