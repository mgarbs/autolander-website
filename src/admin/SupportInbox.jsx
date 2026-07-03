import { useMemo, useState } from 'react';
import { ChevronDown, Mail, RefreshCw, Search, Trash2 } from 'lucide-react';

export default function SupportInbox({ requests, loading, error, onDelete }) {
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState(() => new Set());
  const [deletingIds, setDeletingIds] = useState(() => new Set());

  const rows = useMemo(() => {
    const all = Array.isArray(requests) ? requests : [];
    const needle = query.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((request) => {
      const haystack = [
        request.name,
        request.email,
        request.phone,
        request.details,
        request.transcript,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, requests]);

  function rowId(request) {
    return request.id || `${request.at}-${request.email}`;
  }

  function toggleRow(id) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function deleteRow(request) {
    if (!request.id || !onDelete) return;
    const label = request.email || request.name || 'this message';
    if (!window.confirm(`Delete chatbot message from ${label}?`)) return;
    setDeletingIds((current) => new Set(current).add(request.id));
    try {
      await onDelete(request.id);
      setOpenIds((current) => {
        const next = new Set(current);
        next.delete(rowId(request));
        return next;
      });
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current);
        next.delete(request.id);
        return next;
      });
    }
  }

  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Chatbot Messages</h2>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {loading ? 'Loading' : rows.length ? `${rows.length} shown` : 'No messages'}
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block sm:max-w-md sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, phone, message..."
            className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60"
          />
        </label>
        {rows.length > 0 && (
          <button
            type="button"
            onClick={() => setOpenIds(new Set())}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
          >
            Collapse All
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading support requests
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm leading-6 text-slate-500">
          {query.trim() ? 'No chatbot messages match that search.' : 'Messages submitted through the chatbot support form will appear here.'}
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((request) => {
            const id = rowId(request);
            const open = openIds.has(id);
            const deleting = request.id && deletingIds.has(request.id);
            return (
              <article key={id} className="rounded-2xl border border-white/10 bg-black/20">
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleRow(id)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    aria-expanded={open}
                  >
                    <ChevronDown
                      className={`mt-0.5 h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-white">
                        {request.name || request.email || 'No name provided'}
                      </span>
                      <span className="mt-1 block truncate text-xs font-bold text-slate-400">
                        {request.email}
                        {request.phone ? ` · ${request.phone}` : ''}
                      </span>
                      <span className="mt-2 block line-clamp-1 text-sm text-slate-500">{request.details}</span>
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                    <p className="font-mono text-[10px] text-slate-500">{formatTime(request.at)}</p>
                    <button
                      type="button"
                      onClick={() => deleteRow(request)}
                      disabled={!request.id || deleting}
                      title="Delete message"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="sr-only">Delete message</span>
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="border-t border-white/10 px-4 pb-4 pt-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4">
                      {request.email && (
                        <a href={`mailto:${request.email}`} className="text-xs font-bold text-emerald-200 hover:text-emerald-100">
                          {request.email}
                        </a>
                      )}
                      {request.phone && (
                        <a href={`tel:${request.phone}`} className="text-xs font-bold text-slate-400 hover:text-slate-200">
                          {request.phone}
                        </a>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{request.details}</p>
                    {request.transcript && (
                      <details className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
                        <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Recent chat
                        </summary>
                        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-400">
                          {request.transcript}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
