import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  cancelLoginEmailChange,
  emailsMatch,
  getLoginEmailStatus,
  isLast4,
  LOGIN_EMAIL_COPY as COPY,
  normalizeEmail,
  operatorNameError,
  reasonText,
  runStartWithEmailCheck,
  sendLoginEmailReset,
  startLoginEmailChange,
} from './lib/login-email.js';

const INPUT = 'mt-1 block w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/60 disabled:opacity-50';
const BUTTON = 'rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-50';

function copy(key, values) {
  return COPY[key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

function localTime(value) {
  return new Date(value).toLocaleString();
}

function failureText(result) {
  return reasonText(result?.reasons?.[0] || result?.reason || result?.code);
}

function rememberedOperator() {
  try {
    return localStorage.getItem('al_admin_operator') || '';
  } catch {
    return '';
  }
}

export default function LoginEmailChange({ orgId, user, onClose, onChanged }) {
  const id = useId();
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const statusController = useRef(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [method, setMethod] = useState('phone_callback');
  const [phoneAttested, setPhoneAttested] = useState(false);
  const [cardLast4, setCardLast4] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [repeatEmail, setRepeatEmail] = useState('');
  const [by, setBy] = useState(rememberedOperator);
  const [note, setNote] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [nameError, setNameError] = useState(null);
  // Notion #201: the last address the cloud checked, with its warnings ({ email, warnings }).
  const [checked, setChecked] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    statusController.current = controller;
    getLoginEmailStatus(orgId, user.id, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!result?.ok) throw result;
        setStatus(result);
        if (!result.verification?.phoneOnFile) setMethod('card_last4');
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(failureText(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [orgId, user.id]);

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
      if (event.key !== 'Tab') return;
      const controls = dialog.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const currentUser = status?.user || user;
  const currentEmail = currentUser.email || '';
  const verification = status?.verification || {};
  const pending = status?.pending;
  const lastChange = status?.lastChange;
  const fences = status?.fences || [];
  const cardDisabled = !verification.cardCheckAvailable || verification.cardCheckLocked;
  const verificationReady = method === 'phone_callback'
    ? Boolean(verification.phoneOnFile && phoneAttested)
    : !cardDisabled && isLast4(cardLast4);
  const mismatch = Boolean(repeatEmail) && !emailsMatch(newEmail, repeatEmail);

  async function refreshStatus() {
    setLoading(true);
    setLoadError('');
    try {
      const result = await getLoginEmailStatus(orgId, user.id, {
        signal: statusController.current?.signal,
      });
      if (!result?.ok) throw result;
      setStatus(result);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setStatus(null);
        setLoadError(failureText(error));
      }
    } finally {
      setLoading(false);
    }
  }

  function saveOperator() {
    const error = operatorNameError(by);
    setNameError(error);
    if (error) {
      document.getElementById(`${id}-operator`)?.focus();
      return false;
    }
    try {
      localStorage.setItem('al_admin_operator', by.trim());
    } catch {
      // Storage may be disabled in the browser.
    }
    return true;
  }

  async function runAction(action) {
    if (busy || loading || !status || !saveOperator()) return;
    if ((action === 'check' || action === 'send') && !emailsMatch(newEmail, repeatEmail)) {
      setFeedback({ error: true, text: COPY.emailMismatch });
      return;
    }
    if ((action === 'check' || action === 'send') && (!verificationReady || fences.length)) return;
    setBusy(true);
    setFeedback(null);
    const base = { orgId, userId: user.id, by: by.trim() };
    // True when Send stopped on an address warning: nothing was sent, keep the form as is.
    let stopped = false;
    try {
      let result;
      if (action === 'cancel') {
        result = await cancelLoginEmailChange({ ...base, pendingId: pending.id, apply: true });
      } else if (action === 'reset') {
        result = await sendLoginEmailReset({ ...base, expectCurrentEmail: currentEmail, apply: true });
      } else {
        // Notion #201: Send checks first (the cloud dry-run) whenever this exact address
        // was not checked yet. A warning stops this Send; pressing Send again sends it.
        const outcome = await runStartWithEmailCheck({
          action,
          checked,
          start: startLoginEmailChange,
          input: {
            ...base,
            expectCurrentEmail: currentEmail,
            newEmail,
            verification: method === 'phone_callback'
              ? { method, phoneAttested }
              : { method, cardLast4 },
            note: note.trim(),
          },
        });
        setChecked(outcome.checked);
        if (outcome.stopped) {
          stopped = true;
          setFeedback({ error: true, text: COPY.emailCheckStopped });
          return;
        }
        result = outcome.result;
      }
      if (!result?.ok) throw result;
      if (action === 'check') {
        setFeedback({ text: copy('ready', { to: result.to || normalizeEmail(newEmail) }) });
      } else if (action === 'send') {
        setFeedback(result.sent?.confirmation === false
          ? { error: true, text: COPY.sendFailed }
          : { text: copy('sent', { to: normalizeEmail(newEmail) }) });
      } else if (action === 'cancel') {
        setFeedback({ text: COPY.cancelled });
      } else {
        setFeedback(result.sent === true
          ? { text: copy('resetSent', { email: currentEmail }) }
          : { error: true, text: failureText(result) });
      }
    } catch (error) {
      setFeedback({ error: true, text: failureText(error) });
    } finally {
      if (action === 'send' && !stopped) setCardLast4('');
      if (action !== 'check' && !stopped) {
        await refreshStatus();
        onChanged?.();
      }
      setBusy(false);
    }
  }

  const shownWarnings = checked && checked.email === normalizeEmail(newEmail) ? checked.warnings : [];
  const suggestion = shownWarnings.find((warning) => warning.suggestion)?.suggestion || '';
  function applySuggestion() {
    setNewEmail(suggestion);
    setRepeatEmail(suggestion);
    setFeedback(null);
  }

  function submit(event) {
    event.preventDefault();
    void runAction(event.nativeEvent.submitter?.value === 'send' ? 'send' : 'check');
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6">
      <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} className="max-h-full w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-5 text-sm text-slate-300 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h2 id={`${id}-title`} className="text-lg font-bold text-white">{COPY.title}</h2>
            <p className="break-words font-bold text-white">{currentUser.displayName || user.displayName}</p>
            <p className="break-words text-slate-400">{currentUser.username || user.username}</p>
            <p className="break-words">{copy('currentEmail', { email: currentEmail })}</p>
          </div>
          <button ref={closeButton} type="button" className={BUTTON} onClick={onClose}>{COPY.close}</button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">{COPY.hint}</p>
        {loading && <p role="status" className="mt-4">{COPY.loading}</p>}
        {loadError && (
          <div className="mt-4 space-y-2">
            <p role="alert" className="text-red-300">{loadError}</p>
            <button type="button" className={BUTTON} disabled={loading || busy} onClick={refreshStatus}>{COPY.refresh}</button>
          </div>
        )}
        {pending && (
          <div className="mt-4 space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
            <p className="break-words">{copy('pending', { ...pending, time: localTime(pending.expiresAt) })}</p>
            <button type="button" className={BUTTON} disabled={busy || loading} onClick={() => runAction('cancel')}>{COPY.cancel}</button>
          </div>
        )}
        {lastChange && <p className="mt-4 break-words text-xs text-slate-400">{copy('lastChange', { ...lastChange, time: localTime(lastChange.at) })}</p>}
        {fences.map((reason) => <p key={reason} className="mt-3 text-amber-300">{reasonText(reason)}</p>)}
        <form onSubmit={submit} onChange={() => setFeedback(null)} className="mt-5 space-y-5">
          <fieldset disabled={busy || loading || !status || fences.length > 0} className="space-y-3 disabled:opacity-60">
            <legend className="mb-3 font-bold text-white">1. {COPY.verify}</legend>
            <div className="space-y-2 rounded-xl border border-white/10 p-3">
              <label className="flex items-center gap-2 font-bold text-white">
                <input type="radio" name={`${id}-method`} value="phone_callback" checked={method === 'phone_callback'} onChange={() => setMethod('phone_callback')} disabled={!verification.phoneOnFile} className="accent-blue-500" />
                {COPY.phone}
              </label>
              <p className="text-xs text-slate-400">{verification.phoneOnFile ? copy('phoneOnFile', verification) : COPY.noPhone}</p>
              {verification.phoneOnFile && (
                <label className="flex items-start gap-2 text-xs leading-relaxed">
                  <input type="checkbox" checked={phoneAttested} onChange={(event) => setPhoneAttested(event.target.checked)} disabled={method !== 'phone_callback'} className="mt-1 accent-blue-500" />
                  {COPY.phoneAttestation}
                </label>
              )}
            </div>
            <div className="space-y-2 rounded-xl border border-white/10 p-3">
              <label className="flex items-center gap-2 font-bold text-white">
                <input type="radio" name={`${id}-method`} value="card_last4" checked={method === 'card_last4'} onChange={() => setMethod('card_last4')} disabled={cardDisabled} className="accent-blue-500" />
                {COPY.card}
              </label>
              {!verification.cardCheckAvailable && <p className="text-xs text-slate-400">{COPY.noCard}</p>}
              {verification.cardCheckLocked && <p className="text-xs text-amber-300">{COPY.cardLocked}</p>}
              <label className="block text-xs">
                {COPY.last4}
                <input type="text" inputMode="numeric" autoComplete="off" maxLength={4} pattern="[0-9]{4}" value={cardLast4} onChange={(event) => setCardLast4(event.target.value)} disabled={cardDisabled || method !== 'card_last4'} aria-describedby={`${id}-card-help`} className={INPUT} />
              </label>
              <p id={`${id}-card-help`} className="text-xs leading-relaxed text-slate-400">{COPY.cardHelp}</p>
            </div>
          </fieldset>
          <fieldset disabled={busy || loading || !status} className="space-y-3 disabled:opacity-60">
            <legend className="mb-3 font-bold text-white">2. {COPY.newEmail}</legend>
            <label className="block text-xs">
              {COPY.newEmail}
              <input type="email" autoComplete="off" required maxLength={254} value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className={INPUT} />
            </label>
            <label className="block text-xs">
              {COPY.repeatEmail}
              <input type="email" autoComplete="off" required maxLength={254} value={repeatEmail} onChange={(event) => setRepeatEmail(event.target.value)} aria-invalid={mismatch} aria-describedby={mismatch ? `${id}-mismatch` : undefined} className={INPUT} />
            </label>
            {mismatch && <p id={`${id}-mismatch`} className="text-xs text-red-300">{COPY.emailMismatch}</p>}
            <label className="block text-xs">
              {COPY.operator}
              <input id={`${id}-operator`} type="text" autoComplete="name" value={by} onChange={(event) => { setBy(event.target.value); setNameError(null); }} aria-required="true" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? `${id}-name-error` : undefined} className={INPUT} />
            </label>
            {nameError && <p id={`${id}-name-error`} role="alert" className="text-xs text-red-300">{nameError}</p>}
            <label className="block text-xs">
              {COPY.note}
              <textarea maxLength={200} rows={2} value={note} onChange={(event) => setNote(event.target.value)} className={INPUT} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" value="check" className={BUTTON} disabled={!verificationReady || fences.length > 0}>{COPY.check}</button>
              <button type="submit" value="send" className={`${BUTTON} bg-blue-600 text-white hover:bg-blue-500`} disabled={!verificationReady || fences.length > 0}>{COPY.send}</button>
            </div>
            {shownWarnings.length > 0 && (
              <div role="alert" className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="font-bold text-amber-200">{COPY.emailCheckHeading}</p>
                {shownWarnings.map((warning) => <p key={warning.code || warning.message} className="break-words text-amber-100">{warning.message}</p>)}
                {suggestion && (
                  <button type="button" className={BUTTON} onClick={applySuggestion}>{copy('useSuggestion', { suggestion })}</button>
                )}
              </div>
            )}
          </fieldset>
        </form>
        {feedback && <p role={feedback.error ? 'alert' : 'status'} className={`mt-4 break-words text-sm ${feedback.error ? 'text-red-300' : 'text-emerald-300'}`}>{feedback.text}</p>}
        {status && !pending && currentUser.emailVerified === true && (
          <button type="button" className={`${BUTTON} mt-4`} disabled={busy || loading} onClick={() => runAction('reset')}>{COPY.reset}</button>
        )}
      </section>
    </div>,
    document.body,
  );
}
