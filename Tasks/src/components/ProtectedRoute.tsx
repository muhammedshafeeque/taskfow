import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

/** Auth + customer check only; renders child routes (e.g. app shell or standalone pages). */
export function TaskflowAuthGuard() {
  const { token, user, loading } = useAuth();
  const location = useLocation();

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

  if (user?.userType === 'customer') return <Navigate to="/portal" replace />;

  return <Outlet />;
}

/** Main TaskFlow chrome: sidebar + header + outlet. */
export default function TaskflowAppShell() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
