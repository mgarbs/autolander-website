import { Mail, RefreshCw } from 'lucide-react';

export default function SupportInbox({ requests, loading, error }) {
  const rows = Array.isArray(requests) ? requests.slice(0, 25) : [];

  return (
    <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-emerald-300" aria-hidden="true" />
          <h2 className="text-sm font-black uppercase italic tracking-tight text-white">Chatbot Messages</h2>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {loading ? 'Loading' : rows.length ? `${rows.length} recent` : 'No messages'}
        </p>
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
          Messages submitted through the chatbot support form will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((request) => (
            <article key={request.id || `${request.at}-${request.email}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">{request.name || 'No name provided'}</p>
                  <a
                    href={`mailto:${request.email}`}
                    className="mt-1 block truncate text-xs font-bold text-emerald-200 hover:text-emerald-100"
                  >
                    {request.email}
                  </a>
                  {request.phone && (
                    <a
                      href={`tel:${request.phone}`}
                      className="mt-1 block truncate text-xs font-bold text-slate-400 hover:text-slate-200"
                    >
                      {request.phone}
                    </a>
                  )}
                </div>
                <p className="shrink-0 font-mono text-[10px] text-slate-500">{formatTime(request.at)}</p>
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
            </article>
          ))}
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
