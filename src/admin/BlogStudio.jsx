import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, apiGet, apiPost } from './lib/api.js';
import {
  blogFailureMessage,
  canSendRevision,
  canWriteDraft,
  hasNewPublishRun,
  isBlogSlugInFlight,
  promptExcerpt,
  publishPresentation,
  requestPresentation,
  sortBlogRequests,
} from './lib/blog-studio.js';

const OPTIMISTIC_MAX_MS = 15 * 60 * 1000;
const BUTTON = 'min-h-9 rounded-lg border px-3 py-2 text-[9px] font-black uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-40';

function stateChip(state) {
  if (state === 'drafted') return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300';
  if (state === 'needs_attention') return 'border-amber-400/30 bg-amber-500/15 text-amber-200';
  if (state === 'failed') return 'border-red-400/30 bg-red-500/15 text-red-300';
  if (state === 'discarded') return 'border-white/10 bg-white/[0.05] text-slate-400';
  return 'animate-pulse border-blue-400/30 bg-blue-500/15 text-blue-200';
}

function validationChip(valid) {
  return valid
    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300'
    : 'border-amber-400/30 bg-amber-500/15 text-amber-200';
}

function displayList(values) {
  return Array.isArray(values) && values.length ? values.join(', ') : 'Pending';
}

export default function BlogStudio({ data, reload, onUnauthorized, onBusyChange }) {
  const [prompt, setPrompt] = useState('');
  const [keyword, setKeyword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [revisionSlug, setRevisionSlug] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [optimistic, setOptimistic] = useState({});
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState('');
  const previewTriggerRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  const blogArticles = useMemo(
    () => (data?.articles || []).filter((article) => article.kind === 'blog'),
    [data],
  );
  const drafts = useMemo(
    () => blogArticles.filter((article) => article.status !== 'published'),
    [blogArticles],
  );
  const published = useMemo(
    () => blogArticles.filter((article) => article.status === 'published'),
    [blogArticles],
  );
  const requests = useMemo(
    () => {
      const runs = new Map((data?.blogRuns || []).map((run) => [run.requestId, run]));
      return sortBlogRequests(data?.blogRequests || []).map((request) => (
        request.run || !runs.has(request.requestId)
          ? request
          : { ...request, run: runs.get(request.requestId) }
      ));
    },
    [data],
  );
  const requestRows = useMemo(
    () => requests.map((request) => ({ request, view: requestPresentation(request, now) })),
    [now, requests],
  );
  const hasWritingRequest = requestRows.some(({ view }) => view.state === 'writing');
  const optimisticBusy = Object.keys(optimistic).length > 0;
  const optimisticSlugs = useMemo(() => new Set(
    Object.values(optimistic).map((entry) => entry.slug).filter(Boolean),
  ), [optimistic]);
  const locallyBusy = submitting || Boolean(pendingAction) || optimisticBusy;

  useEffect(() => {
    onBusyChange?.(locallyBusy);
  }, [locallyBusy, onBusyChange]);

  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);

  useEffect(() => {
    if (!hasWritingRequest) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [hasWritingRequest]);

  useEffect(() => {
    const reflectedRequestIds = new Set((data?.blogRequests || []).map((request) => request.requestId));
    const publishedSlugs = new Set(published.map((article) => article.slug));
    const checkedAt = Date.now();
    setNow(checkedAt);

    setOptimistic((current) => {
      const next = { ...current };
      for (const [key, entry] of Object.entries(next)) {
        const publishSlug = entry.kind === 'publish' ? entry.slug : '';
        const matchingPublishRun = publishSlug
          && hasNewPublishRun(data, publishSlug, entry.knownRunIds, entry.startedAt);
        const reflected = publishSlug
          ? publishedSlugs.has(publishSlug) || matchingPublishRun
          : reflectedRequestIds.has(key);
        if (reflected || checkedAt - entry.startedAt > OPTIMISTIC_MAX_MS) delete next[key];
      }
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [data, published]);

  const showError = useCallback((err, fallback) => {
    if (err instanceof ApiError && err.status === 401) {
      onUnauthorized?.();
      return;
    }
    setError(err?.serverMessage || err?.message || fallback);
  }, [onUnauthorized]);

  const refresh = useCallback(async () => {
    await reload?.({ silent: true });
  }, [reload]);

  const remember = useCallback((key, { kind, slug = '', knownRunIds = [] }) => {
    if (!key) return;
    setOptimistic((current) => ({
      ...current,
      [key]: {
        kind, slug, knownRunIds, startedAt: Date.now(),
      },
    }));
  }, []);

  const writeDraft = useCallback(async (event) => {
    event.preventDefault();
    if (!canWriteDraft(prompt, keyword) || submitting) return;
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const response = await apiPost('/admin/blog/generate', {
        prompt: prompt.trim(),
        keyword: keyword.trim(),
      });
      remember(response?.requestId, { kind: 'generate' });
      setPrompt('');
      setKeyword('');
      setNotice(response?.message || 'Draft request started.');
      await refresh();
    } catch (err) {
      showError(err, 'The draft request could not be started.');
    } finally {
      setSubmitting(false);
    }
  }, [keyword, prompt, refresh, remember, showError, submitting]);

  const sendRevision = useCallback(async (slug) => {
    if (!canSendRevision(revisionFeedback) || pendingAction) return;
    setPendingAction(`revise:${slug}`);
    setError('');
    setNotice('');
    try {
      const response = await apiPost('/admin/blog/revise', {
        slug,
        feedback: revisionFeedback.trim(),
      });
      remember(response?.requestId, { kind: 'revise', slug });
      setRevisionSlug('');
      setRevisionFeedback('');
      setNotice(response?.message || 'Revision request started.');
      await refresh();
    } catch (err) {
      showError(err, 'The revision request could not be started.');
    } finally {
      setPendingAction('');
    }
  }, [pendingAction, refresh, remember, revisionFeedback, showError]);

  const publishDraft = useCallback(async (slug) => {
    if (pendingAction) return;
    setConfirm(null);
    setPendingAction(`publish:${slug}`);
    setError('');
    setNotice('');
    try {
      const response = await apiPost('/admin/content/publish', { slug });
      const knownRunIds = (data?.runs || [])
        .filter((run) => String(run?.title || '').trim() === `publish: ${slug}`)
        .map((run) => run.id);
      remember(`publish:${slug}`, { kind: 'publish', slug, knownRunIds });
      setNotice(response?.message || 'Publish request started.');
      await refresh();
    } catch (err) {
      showError(err, 'The publish request could not be started.');
    } finally {
      setPendingAction('');
    }
  }, [data, pendingAction, refresh, remember, showError]);

  const discardDraft = useCallback(async (slug) => {
    if (pendingAction) return;
    setConfirm(null);
    setPendingAction(`discard:${slug}`);
    setError('');
    setNotice('');
    try {
      const response = await apiPost('/admin/blog/discard', { slug });
      remember(response?.requestId, { kind: 'discard', slug });
      setNotice('Discard request started.');
      await refresh();
    } catch (err) {
      showError(err, 'The discard request could not be started.');
    } finally {
      setPendingAction('');
    }
  }, [pendingAction, refresh, remember, showError]);

  const openPreview = useCallback(async (post, event) => {
    if (previewLoading) return;
    previewTriggerRef.current = event.currentTarget;
    setPreviewLoading(post.slug);
    setError('');
    try {
      const response = await apiGet(`/admin/blog/preview?slug=${encodeURIComponent(post.slug)}`);
      setPreview({ html: response?.html || '', title: post.title });
    } catch (err) {
      showError(err, 'The preview could not be loaded.');
    } finally {
      setPreviewLoading('');
    }
  }, [previewLoading, showError]);

  const closePreview = useCallback(() => {
    setPreview(null);
    window.setTimeout(() => previewTriggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!preview) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closePreview();
      if (event.key === 'Tab') {
        const focusable = [...(dialogRef.current?.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled])',
        ) || [])];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closePreview, preview]);

  return (
    <section aria-labelledby="blog-studio-heading" className="space-y-4 rounded-2xl border border-blue-400/20 bg-blue-500/[0.04] p-4 sm:p-5">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">AI Blog Studio</p>
        <h2 id="blog-studio-heading" className="mt-1 text-lg font-black text-white">Write and publish blog posts</h2>
      </div>

      <form onSubmit={writeDraft} className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
        <label htmlFor="blog-prompt" className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Post brief
        </label>
        <textarea
          id="blog-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={6000}
          rows={5}
          placeholder="What should the post cover? Audience, angle, anything it must include."
          className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/60"
        />
        <label htmlFor="blog-keyword" className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
          Target keyword <span className="text-slate-600">optional</span>
        </label>
        <input
          id="blog-keyword"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          maxLength={80}
          className="min-h-9 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-blue-400/60"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-[10px] font-bold leading-relaxed text-slate-500">
            Opus 5.5 · max effort · reads the whole site · uses your Claude subscription · usually 5 to 15 min
          </p>
          <button
            type="submit"
            disabled={!canWriteDraft(prompt, keyword) || submitting}
            className={`${BUTTON} shrink-0 border-blue-400/40 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25`}
          >
            Write draft
          </button>
        </div>
      </form>

      {error && <p role="alert" className="break-words rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">{error}</p>}
      {notice && !error && <p aria-live="polite" className="break-words rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-300">{notice}</p>}

      {requestRows.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent requests</h3>
          <ul className="space-y-2">
            {requestRows.map(({ request, view }) => {
              const run = request.run || (data?.blogRuns || []).find((item) => item.requestId === request.requestId);
              const failure = view.state === 'failed' || view.state === 'needs_attention'
                ? blogFailureMessage(request.errorKind, request.error)
                : '';
              const requestKind = request.mode === 'revise'
                ? 'Revision'
                : request.mode === 'discard' ? 'Discard' : 'New post';
              return (
                <li key={request.requestId} className="min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${stateChip(view.state)}`}>
                      {view.label}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {requestKind}
                    </span>
                    {run?.url && (
                      <a href={run.url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">
                        Workflow run ↗
                      </a>
                    )}
                  </div>
                  <p className="mt-2 break-words text-xs text-slate-300">{promptExcerpt(request) || request.slug}</p>
                  {failure && <p className="mt-2 break-words text-xs font-bold text-red-300">{failure}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drafts</h3>
        {drafts.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-xs text-slate-500">No blog drafts yet.</p>
        ) : drafts.map((post) => {
          const publishView = publishPresentation(data, post, now);
          const actionBusy = Boolean(pendingAction)
            || isBlogSlugInFlight(data, post.slug, optimisticSlugs, now);
          const revising = revisionSlug === post.slug;
          return (
            <article key={post.slug} className="min-w-0 space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h4 className="break-words text-base font-black text-white">{post.title}</h4>
                  <p className="mt-1 break-words text-[10px] font-bold uppercase tracking-widest text-slate-500">{post.slug}</p>
                  <p className="mt-1 break-words text-xs text-slate-400">{post.primaryKeyword || 'Keyword pending'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`w-fit rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${validationChip(post.validationOk)}`}>
                    {post.validationOk ? 'ready' : 'needs attention'}
                  </span>
                  {publishView.state === 'publishing' && (
                    <span className="w-fit rounded-full border border-blue-400/30 bg-blue-500/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-blue-200">publishing…</span>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3"><dt className="text-[9px] font-black uppercase tracking-widest text-slate-500">SEO title</dt><dd className="mt-1 break-words text-slate-200">{String(post.title || '').length}/60</dd></div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3"><dt className="text-[9px] font-black uppercase tracking-widest text-slate-500">Description</dt><dd className="mt-1 break-words text-slate-200">{String(post.description || '').length}/140 to 160</dd></div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3"><dt className="text-[9px] font-black uppercase tracking-widest text-slate-500">Words</dt><dd className="mt-1 text-slate-200">{post.wordCount ?? 'Pending'}</dd></div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3"><dt className="text-[9px] font-black uppercase tracking-widest text-slate-500">Internal links</dt><dd className="mt-1 text-slate-200">{post.outboundLinks ?? 'Pending'}</dd></div>
                <div className="min-w-0 rounded-lg border border-white/5 bg-white/[0.03] p-3"><dt className="text-[9px] font-black uppercase tracking-widest text-slate-500">Inbound targets</dt><dd className="mt-1 break-words text-slate-200">{displayList(post.inboundFrom)}</dd></div>
                <div className="min-w-0 rounded-lg border border-white/5 bg-white/[0.03] p-3"><dt className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hubs</dt><dd className="mt-1 break-words text-slate-200">{displayList(post.augmentKeys)}</dd></div>
              </dl>

              {Array.isArray(post.validationErrors) && post.validationErrors.length > 0 && (
                <ul className="space-y-1 rounded-lg border border-amber-400/20 bg-amber-500/[0.06] p-3 text-xs text-amber-100">
                  {post.validationErrors.map((validationError) => <li key={validationError} className="break-words">{validationError}</li>)}
                </ul>
              )}

              {publishView.state === 'failed' && (
                <p className="break-words rounded-lg border border-red-400/20 bg-red-500/[0.07] p-3 text-xs font-bold text-red-200">
                  Last publish failed.
                  {publishView.run?.url && <a href={publishView.run.url} target="_blank" rel="noreferrer" className="ml-2 text-red-300 underline">Open workflow run</a>}
                </p>
              )}

              {revising && (
                <div className="space-y-2 rounded-xl border border-blue-400/20 bg-blue-500/[0.05] p-3">
                  <label htmlFor={`revision-${post.slug}`} className="block text-[10px] font-black uppercase tracking-widest text-blue-300">Revision feedback</label>
                  <textarea
                    id={`revision-${post.slug}`}
                    value={revisionFeedback}
                    onChange={(event) => setRevisionFeedback(event.target.value)}
                    maxLength={4000}
                    rows={4}
                    className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-blue-400/60"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => sendRevision(post.slug)} disabled={!canSendRevision(revisionFeedback) || actionBusy} className={`${BUTTON} border-blue-400/40 bg-blue-500/15 text-blue-200`}>Send revision</button>
                    <button type="button" onClick={() => { setRevisionSlug(''); setRevisionFeedback(''); }} disabled={actionBusy} className={`${BUTTON} border-white/10 text-slate-400`}>Cancel</button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={(event) => openPreview(post, event)} disabled={actionBusy || Boolean(previewLoading)} className={`${BUTTON} border-white/10 bg-white/[0.03] text-slate-200`}>Preview</button>
                <button type="button" onClick={() => { setRevisionSlug(post.slug); setRevisionFeedback(''); setConfirm(null); }} disabled={actionBusy} className={`${BUTTON} border-blue-400/30 bg-blue-500/10 text-blue-200`}>Revise</button>
                {confirm?.action === 'publish' && confirm.slug === post.slug ? (
                  <>
                    <button type="button" onClick={() => publishDraft(post.slug)} disabled={!post.validationOk || !data?.canPublish || actionBusy} className={`${BUTTON} border-emerald-400/40 bg-emerald-500/15 text-emerald-200`}>Confirm publish</button>
                    <button type="button" onClick={() => setConfirm(null)} disabled={actionBusy} className={`${BUTTON} border-white/10 text-slate-400`}>Cancel</button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setConfirm({ action: 'publish', slug: post.slug }); setRevisionSlug(''); }} disabled={!post.validationOk || !data?.canPublish || actionBusy} className={`${BUTTON} border-emerald-400/40 bg-emerald-500/15 text-emerald-200`}>Publish</button>
                )}
                {confirm?.action === 'discard' && confirm.slug === post.slug ? (
                  <>
                    <button type="button" onClick={() => discardDraft(post.slug)} disabled={actionBusy} className={`${BUTTON} border-red-400/40 bg-red-500/15 text-red-200`}>Confirm discard</button>
                    <button type="button" onClick={() => setConfirm(null)} disabled={actionBusy} className={`${BUTTON} border-white/10 text-slate-400`}>Cancel</button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setConfirm({ action: 'discard', slug: post.slug }); setRevisionSlug(''); }} disabled={actionBusy} className={`${BUTTON} border-red-400/30 bg-red-500/10 text-red-200`}>Discard</button>
                )}
              </div>
              {!post.validationOk && <p className="text-[10px] font-bold text-amber-200">Resolve validation issues before publishing.</p>}
            </article>
          );
        })}
      </div>

      {published.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Published posts</h3>
          <ul className="space-y-2">
            {published.map((post) => {
              const publishView = publishPresentation(data, post, now);
              return (
                <li key={post.slug} className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <a href={post.url} target="_blank" rel="noreferrer" className="min-w-0 break-words text-sm font-bold text-white hover:text-blue-300">{post.title}</a>
                  <span className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {publishView.state === 'publishing' && <span className="text-blue-300">publishing…</span>}
                    {publishView.state === 'failed' && <span className="text-red-300">Last publish failed</span>}
                    {publishView.state === 'failed' && publishView.run?.url && <a href={publishView.run.url} target="_blank" rel="noreferrer" className="text-red-300 underline">Run ↗</a>}
                    <span>{post.publishedAt || 'Date pending'}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {preview && (
        <div ref={dialogRef} className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-950/90 p-2 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="blog-preview-title">
          <div className="flex min-h-0 w-full max-w-6xl flex-col rounded-xl border border-white/15 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <h3 id="blog-preview-title" className="min-w-0 truncate text-sm font-black text-white">{preview.title}</h3>
              <button ref={closeButtonRef} type="button" autoFocus aria-label="Close preview" onClick={closePreview} className={`${BUTTON} shrink-0 border-white/10 text-slate-200`}>Close</button>
            </div>
            <iframe sandbox="" srcDoc={preview.html} title="Preview" tabIndex={-1} onFocus={() => closeButtonRef.current?.focus()} className="h-[calc(100vh-7rem)] min-h-[24rem] w-full flex-1 rounded-b-xl bg-white" />
          </div>
        </div>
      )}
    </section>
  );
}
