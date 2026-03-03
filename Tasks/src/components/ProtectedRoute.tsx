import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

const FIRST_LOGIN_ALLOWED = ['/inbox', '/profile', '/projects'];

export default function ProtectedRoute() {
  const { token, user, loading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-page)]">
        <div className="animate-pulse text-[color:var(--text-muted)]">Loading…</div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const mustChangePassword = user?.mustChangePassword ?? false;
  const allowed = FIRST_LOGIN_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (mustChangePassword && !allowed) {
    return <Navigate to="/inbox" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
