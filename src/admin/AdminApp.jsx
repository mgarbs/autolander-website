import { useEffect, useState } from 'react';
import { apiGet, setStoredToken } from './lib/api.js';
import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';

const STATE = {
  loading: 'loading',
  loggedOut: 'logged_out',
  loggedIn: 'logged_in',
};

export default function AdminApp() {
  const [state, setState] = useState(STATE.loading);

  useEffect(() => {
    if (state !== STATE.loading) return undefined;
    let cancelled = false;
    apiGet('/admin/me')
      .then(() => {
        if (!cancelled) setState(STATE.loggedIn);
      })
      .catch(() => {
        if (cancelled) return;
        setStoredToken('');
        setState(STATE.loggedOut);
      });
    return () => {
      cancelled = true;
    };
  }, [state]);

  if (state === STATE.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-slate-400 text-xs font-bold uppercase tracking-widest">
        Loading…
      </div>
    );
  }

  if (state === STATE.loggedOut) {
    return <Login onSuccess={() => setState(STATE.loggedIn)} />;
  }

  return <Dashboard onLogout={() => setState(STATE.loggedOut)} />;
}
