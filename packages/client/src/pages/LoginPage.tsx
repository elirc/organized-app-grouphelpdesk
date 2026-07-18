// Author: Sam Rivera
// Issue: Learning Phase 4 - Add a learning-friendly login screen

import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { ApiError } from '../services/api';
import { useAuth } from '../auth/AuthProvider';

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('avery.agent@example.com');
  const [password, setPassword] = useState('agent123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname;
      navigate(redirectTo ?? '/', { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Unable to log in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">HelpDesk</p>
        <h1 className="mt-3 text-3xl font-bold">Sign in</h1>
        <p className="mt-3 text-sm text-slate-300">
          Seeded accounts: agent `avery.agent@example.com` / `agent123`, admin
          `casey.admin@example.com` / `admin123`, customer `riley.requester@example.com` /
          `customer123`.
        </p>

        <label className="mt-6 block text-sm font-medium text-slate-200" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
        />

        <label className="mt-4 block text-sm font-medium text-slate-200" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-300"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
        />

        {error ? (
          <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <button
          className="mt-6 w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
