import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      const stored = localStorage.getItem('pm_user');
      const u = stored ? (JSON.parse(stored) as { mustChangePassword?: boolean }) : null;
      navigate(u?.mustChangePassword ? '/inbox' : '/');
      return;
    }
    else setError(result.error ?? 'Login failed');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--auth-page-bg)' }}>
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)] tracking-tight">TaskFlow</h1>
          <p className="text-[color:var(--text-muted)] mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[color:var(--bg-modal)]/90 backdrop-blur border border-[color:var(--border-subtle)] rounded-2xl p-8 shadow-xl animate-fade-in animation-delay-100"
        >
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm animate-fade-in"
            >
              {error}
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[color:var(--text-primary)] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:border-[color:var(--accent)] transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[color:var(--text-primary)] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[color:var(--bg-page)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/50 focus:border-[color:var(--accent)] transition"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[color:var(--bg-page)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="mt-6 text-center text-[color:var(--text-muted)] text-sm">
            <Link to="/forgot-password" className="text-indigo-500 hover:text-indigo-600 font-medium">
              Forgot password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
