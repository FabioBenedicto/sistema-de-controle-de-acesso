import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useSession } from '@hooks/useSession';

interface PrivateRouteProps {
  adminOnly?: boolean;
  children: ReactNode;
}

export function PrivateRoute({
  adminOnly = false,
  children,
}: PrivateRouteProps) {
  const { user } = useSession();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
