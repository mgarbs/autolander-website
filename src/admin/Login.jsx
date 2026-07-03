import { useState } from 'react';
import { ApiError, apiPost, setStoredToken } from './lib/api.js';

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);
    try {
      const result = await apiPost('/admin/login', { password });
      if (result?.token) setStoredToken(result.token);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Wrong password.');
      } else if (err instanceof ApiError && err.reason === 'admin_not_configured') {
        setError('Admin is not configured yet. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in the worker.');
      } else {
        setError(err?.message || 'Login failed. Try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-slate-100 px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-10 shadow-2xl"
      >
        <h1 className="text-2xl font-black uppercase italic tracking-tight">AutoLander Admin</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to manage chatbot messages, Stripe links, and account links.</p>

        <label className="mt-8 block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Password
        </label>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-blue-500/60"
        />

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !password}
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-black uppercase italic tracking-tight text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
