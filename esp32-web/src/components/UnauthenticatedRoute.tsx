import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useSession } from '@hooks/useSession';

interface UnauthenticatedRouteProps {
  children: ReactNode;
}

export const UnauthenticatedRoute = ({
  children,
}: UnauthenticatedRouteProps) => {
  const { user } = useSession();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
