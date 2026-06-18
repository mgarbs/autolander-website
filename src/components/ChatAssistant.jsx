import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Calendar,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

const DEFAULT_CHAT_API_URL = 'https://autolander-chatbot.michaelegarber.workers.dev';
const CHAT_API_BASE = (import.meta.env.VITE_CHAT_API_URL || DEFAULT_CHAT_API_URL).replace(/\/$/, '');
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

const starterMessages = [
  {
    role: 'assistant',
    content:
      'Ask me about AutoLander setup, pricing, inventory feeds, AI Studio, posting limits, or the free trial.',
  },
];

const quickPrompts = [
  'How does AutoLander work?',
  'Which inventory feeds are supported?',
  'Help me set up my feed',
  'My posts are failing',
];

const supportDefaults = {
  name: '',
  email: '',
  phone: '',
  details: '',
};

function endpoint(path) {
  if (!CHAT_API_BASE) return '';
  return `${CHAT_API_BASE}${path}`;
}

function mailtoUrl(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ChatAssistant({ demoUrl, supportEmail = 'sales@autolander.ai', onOpen, onBookDemo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportForm, setSupportForm] = useState(supportDefaults);
  const [supportStatus, setSupportStatus] = useState('');
  const [supportFallbackUrl, setSupportFallbackUrl] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const messagesEndRef = useRef(null);
  const turnstileRef = useRef(null);
  const turnstileWidgetRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen, showSupportForm]);

  useEffect(() => {
    if (!isOpen || !TURNSTILE_SITE_KEY || !turnstileRef.current) return;

    const renderTurnstile = () => {
      if (!window.turnstile || turnstileWidgetRef.current !== null) return;
      turnstileWidgetRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        size: 'flexible',
        callback: setTurnstileToken,
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      });
    };

    if (!window.turnstile) {
      const existingScript = document.querySelector('script[data-turnstile]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        script.onload = renderTurnstile;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', renderTurnstile, { once: true });
      }
      return;
    }

    renderTurnstile();
  }, [isOpen]);

  const resetTurnstile = () => {
    setTurnstileToken('');
    if (window.turnstile && turnstileWidgetRef.current !== null) {
      window.turnstile.reset(turnstileWidgetRef.current);
    }
  };

  const addAssistantMessage = (content, meta = {}) => {
    setMessages((current) => [...current, { role: 'assistant', content, ...meta }]);
  };

  const sendMessage = async (messageText = draft) => {
    const message = messageText.trim();
    if (!message || isSending) return;

    setError('');
    setDraft('');
    setShowSupportForm(false);

    const conversation = messages
      .filter((item) => item.role === 'user' || item.role === 'assistant')
      .slice(-8)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, { role: 'user', content: message }]);

    if (!CHAT_API_BASE) {
      addAssistantMessage(
        `The chat backend is not connected yet. For now, email ${supportEmail} or book a live demo and we will help directly.`,
        { handoff: true }
      );
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(endpoint('/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation,
          turnstileToken,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fallback =
          data?.answer ||
          data?.message ||
          `Chat is temporarily unavailable. Email ${supportEmail} or book a demo for help.`;
        addAssistantMessage(fallback, { handoff: true });
        setError(response.status === 429 ? 'Chat limit reached for now.' : '');
        return;
      }

      addAssistantMessage(data.answer, {
        handoff: Boolean(data.handoff),
        handoffReason: data.handoffReason,
        suggestedAction: data.suggestedAction,
      });
      resetTurnstile();
    } catch {
      addAssistantMessage(
        `I could not reach chat support right now. Email ${supportEmail} or book a live demo and we will help directly.`,
        { handoff: true }
      );
    } finally {
      setIsSending(false);
    }
  };

  const submitSupportRequest = async (event) => {
    event.preventDefault();
    setSupportStatus('');
    setSupportFallbackUrl('');

    const details = supportForm.details.trim();
    if (!supportForm.email.trim() || !supportForm.phone.trim() || !details) {
      setSupportStatus('Add your email, phone, and a short description first.');
      return;
    }

    const transcript = messages
      .slice(-10)
      .map((item) => `${item.role}: ${item.content}`)
      .join('\n');

    const fallbackMailto = mailtoUrl(
      supportEmail,
      'AutoLander support request',
      `${details}\n\nName: ${supportForm.name}\nEmail: ${supportForm.email}\nPhone: ${supportForm.phone}\n\nRecent chat:\n${transcript}`
    );

    if (!CHAT_API_BASE) {
      setSupportFallbackUrl(fallbackMailto);
      setSupportStatus('Support backend is not connected. Use the email link below so we can help.');
      return;
    }

    setIsSendingSupport(true);
    try {
      const response = await fetch(endpoint('/support'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...supportForm,
          transcript,
          turnstileToken,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.mailFallback) {
        setSupportFallbackUrl(data.mailto || fallbackMailto);
        setSupportStatus(
          data?.message || 'Support request could not be sent automatically. Use the email link below so we can help.',
        );
        return;
      }

      setSupportStatus(
        data.delivery === 'stored'
          ? 'Support request saved. We will follow up by email.'
          : 'Support request sent. We will follow up by email.',
      );
      setSupportForm(supportDefaults);
      resetTurnstile();
    } catch {
      setSupportFallbackUrl(fallbackMailto);
      setSupportStatus('Support request could not be sent automatically. Use the email link below so we can help.');
    } finally {
      setIsSendingSupport(false);
    }
  };

  const toggleAssistant = () => {
    if (!isOpen) onOpen?.();
    setIsOpen((current) => !current);
  };

  return (
    <div className="fixed bottom-24 right-5 z-[70] flex flex-col items-end gap-4 md:bottom-5">
      {isOpen && (
        <div className="flex max-h-[calc(100dvh-12.5rem)] w-[calc(100vw-2.5rem)] max-w-[420px] flex-col overflow-hidden rounded-[32px] border border-blue-500/25 bg-[#05070d]/95 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/25">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-black uppercase italic tracking-tight text-white">
                  AutoLander Assistant
                </p>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  Rate limited
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                      <Bot className="h-4 w-4 text-blue-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm font-medium leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'border border-white/10 bg-white/[0.04] text-slate-200'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.handoff && (
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSupportForm(true)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black uppercase italic text-black transition hover:bg-blue-100"
                        >
                          <Mail className="h-4 w-4" />
                          Contact Support
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onBookDemo) onBookDemo();
                            else window.open(demoUrl, '_blank');
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs font-black uppercase italic text-white transition hover:bg-white/10"
                        >
                          <Calendar className="h-4 w-4" />
                          Book Demo
                        </button>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <UserRound className="h-4 w-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  Thinking
                </div>
              )}

              {showSupportForm && (
                <form
                  onSubmit={submitSupportRequest}
                  className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-4"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase italic tracking-tight text-emerald-300">
                    <AlertCircle className="h-4 w-4" />
                    Human Support
                  </div>
                  <div className="grid gap-2">
                    <input
                      value={supportForm.name}
                      onChange={(event) =>
                        setSupportForm((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Name"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                    />
                    <input
                      value={supportForm.email}
                      onChange={(event) =>
                        setSupportForm((current) => ({ ...current, email: event.target.value }))
                      }
                      placeholder="Email *"
                      type="email"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                    />
                    <input
                      value={supportForm.phone}
                      onChange={(event) =>
                        setSupportForm((current) => ({ ...current, phone: event.target.value }))
                      }
                      placeholder="Phone *"
                      type="tel"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                    />
                    <textarea
                      value={supportForm.details}
                      onChange={(event) =>
                        setSupportForm((current) => ({ ...current, details: event.target.value }))
                      }
                      placeholder="What do you need help with?"
                      rows={3}
                      className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingSupport}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-black uppercase italic text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                  >
                    {isSendingSupport && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSendingSupport ? 'Sending Request' : 'Send Support Request'}
                  </button>
                  {supportStatus && (
                    <p className="mt-3 text-xs font-medium text-slate-400">{supportStatus}</p>
                  )}
                  {supportFallbackUrl && (
                    <a
                      href={supportFallbackUrl}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs font-black uppercase italic text-white transition hover:bg-white/10"
                    >
                      <Mail className="h-4 w-4" />
                      Email Support
                    </a>
                  )}
                </form>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 p-4">
            <button
              type="button"
              onClick={() => setShowSupportForm(true)}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-[11px] font-black uppercase italic tracking-tight text-emerald-300 transition hover:bg-emerald-500/15"
            >
              <Mail className="h-4 w-4" /> Talk to our team
            </button>
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isSending}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition hover:border-blue-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="mb-3 min-h-16" />}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about AutoLander..."
                maxLength={600}
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/60"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                aria-label="Send message"
              >
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
            {error && <p className="mt-3 text-xs font-bold text-amber-300">{error}</p>}
            {!CHAT_API_BASE && (
              <p className="mt-3 text-xs font-medium text-slate-500">
                Chat API is not configured yet. Set VITE_CHAT_API_URL after deploying the Worker.
              </p>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleAssistant}
        className="group flex items-center gap-3 rounded-2xl border border-blue-400/30 bg-blue-600 px-5 py-4 text-white shadow-2xl shadow-blue-600/30 transition hover:-translate-y-1 hover:bg-blue-500"
        aria-label="Open AutoLander chat assistant"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden text-sm font-black uppercase italic tracking-tight sm:inline">
          Ask AutoLander
        </span>
      </button>
    </div>
  );
}
