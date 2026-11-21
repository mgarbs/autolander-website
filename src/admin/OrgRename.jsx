import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { operatorNameError } from './lib/login-email.js';
import { ORG_RENAME_COPY as COPY, orgRenameFailureText, renameOrg } from './lib/org-rename.js';

const INPUT = 'mt-1 block w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/60 disabled:opacity-50';
const BUTTON = 'rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-50';

function copy(key, values) {
  return COPY[key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

function rememberedOperator() {
  try {
    return localStorage.getItem('al_admin_operator') || '';
  } catch {
    return '';
  }
}

// Notion #198 (2026-11-21): Clay renames a standalone dealership (the name the AI replies
// sign with). Check runs the cloud dry-run; Rename applies it. The cloud refuses a dealer
// group store and a name that changed since this page loaded.
export default function OrgRename({ orgId, currentName, onClose, onChanged }) {
  const id = useId();
  const closeButton = useRef(null);
  const [name, setName] = useState(currentName || '');
  const [by, setBy] = useState(rememberedOperator);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [nameError, setNameError] = useState(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeButton.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function saveOperator() {
    const error = operatorNameError(by);
    setNameError(error);
    if (error) return false;
    try {
      localStorage.setItem('al_admin_operator', by.trim());
    } catch {
      // Storage may be disabled in the browser.
    }
    return true;
  }

  async function run(apply) {
    if (busy || !saveOperator()) return;
    setBusy(true);
    setFeedback(null);
    const to = name.trim().replace(/\s+/g, ' ');
    try {
      const result = await renameOrg({
        orgId,
        expectCurrentName: (currentName || '').trim(),
        name: to,
        by: by.trim(),
        ...(apply ? { apply: true } : {}),
      });
      if (!result?.ok) throw result;
      if (result.alreadyApplied) {
        setFeedback({ text: COPY.alreadyApplied });
      } else if (result.wouldChange === false) {
        setFeedback({ text: COPY.same });
      } else if (apply) {
        setFeedback({ text: copy('renamed', { to: result.intended?.name || to }) });
        onChanged?.();
      } else {
        setFeedback({ text: copy('ready', { from: currentName, to: result.intended?.name || to }) });
      }
    } catch (error) {
      setFeedback({ error: true, text: orgRenameFailureText(error) });
    } finally {
      setBusy(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    void run(event.nativeEvent.submitter?.value === 'rename');
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-5 text-sm text-slate-300 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h2 id={`${id}-title`} className="text-lg font-bold text-white">{COPY.title}</h2>
            <p className="break-words">{copy('current', { name: currentName || '' })}</p>
          </div>
          <button ref={closeButton} type="button" className={BUTTON} onClick={onClose}>{COPY.close}</button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">{COPY.hint}</p>
        <form onSubmit={submit} onChange={() => setFeedback(null)} className="mt-5 space-y-3">
          <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
            <label className="block text-xs">
              {COPY.newName}
              <input type="text" autoComplete="off" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className={INPUT} />
            </label>
            <label className="block text-xs">
              {COPY.operator}
              <input type="text" autoComplete="name" value={by} onChange={(event) => { setBy(event.target.value); setNameError(null); }} aria-required="true" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? `${id}-name-error` : undefined} className={INPUT} />
            </label>
            {nameError && <p id={`${id}-name-error`} role="alert" className="text-xs text-red-300">{nameError}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="submit" value="check" className={BUTTON} disabled={name.trim().length < 2}>{COPY.check}</button>
              <button type="submit" value="rename" className={`${BUTTON} bg-blue-600 text-white hover:bg-blue-500`} disabled={name.trim().length < 2}>{COPY.rename}</button>
            </div>
          </fieldset>
        </form>
        {feedback && <p role={feedback.error ? 'alert' : 'status'} className={`mt-4 break-words text-sm ${feedback.error ? 'text-red-300' : 'text-emerald-300'}`}>{feedback.text}</p>}
      </section>
    </div>,
    document.body,
  );
}
