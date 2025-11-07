import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

interface AuthGuardProps {
  isPrivate: boolean;
}

export function AuthGuard({ isPrivate }: AuthGuardProps) {
  const { signedIn, user } = useAuth();
  const location = useLocation();

  if (!signedIn && isPrivate) {
    return <Navigate to="/login" replace />;
  }

  if (signedIn && !isPrivate) {
    return <Navigate to="/" replace />;
  }

  // Proteger rotas administrativas apenas para admins
  if (isPrivate && (location.pathname === '/admin' || location.pathname.startsWith('/mentorado/')) && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
