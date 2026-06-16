import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowLeft, Loader2, CalendarClock, Video, BadgeDollarSign } from 'lucide-react';
import { getAvailability, submitBooking, visitorTimezone } from '../lib/booking.js';
import { track } from '../lib/meta-pixel.js';

// Design + conversion copy from the Gemini "Instant Calendar" brief; data,
// timezone math, and the booking flow are wired here.

const TZ = visitorTimezone();
const ROLES = ['Owner', 'Manager', 'Sales Rep'];
// Only show the "🔥 N slots left" urgency line once availability is genuinely
// low — never at the start of the day when there are 20+ open.
const LOW_SLOT_THRESHOLD = 4;

function tzAbbr() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short', timeZone: TZ }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value || '';
  } catch {
    return '';
  }
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ });
}

function dayKey(iso) {
  // en-CA gives YYYY-MM-DD, stable for grouping in the visitor's timezone.
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
}

function dayLabel(iso) {
  const key = dayKey(iso);
  const todayKey = dayKey(new Date().toISOString());
  const tomorrowKey = dayKey(new Date(Date.now() + 86400000).toISOString());
  if (key === todayKey) return 'Today';
  if (key === tomorrowKey) return 'Tomorrow';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: TZ });
}

function monthDay(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: TZ });
}

export default function InstantCalendar({ onClose, onFallback }) {
  const [phase, setPhase] = useState('loading'); // loading | browse | capture | submitting | success | empty | error
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', textReminders: true });
  const [formError, setFormError] = useState('');
  const abbr = useMemo(() => tzAbbr(), []);

  const load = useCallback(async () => {
    try {
      const data = await getAvailability();
      const list = Array.isArray(data.slots) ? data.slots.filter(Boolean).sort() : [];
      setSlots(list);
      setSelectedDay(list.length ? dayKey(list[0]) : null);
      setPhase(list.length ? 'browse' : 'empty');
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const days = useMemo(() => {
    const map = new Map();
    for (const iso of slots) {
      const k = dayKey(iso);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(iso);
    }
    // dayLabel() does the Today/Tomorrow math in a module fn (keeps impure
    // new Date()/Date.now() out of this hook). It returns "Today" | "Tomorrow"
    // | "Mon, Jun 16" — split that into a strip label + date.
    return [...map.entries()].map(([key, isos]) => {
      const lbl = dayLabel(isos[0]);
      return {
        key,
        slots: isos,
        top: lbl.includes(',') ? lbl.split(',')[0] : lbl,
        md: monthDay(isos[0]),
      };
    });
  }, [slots]);

  const soonestDay = days[0];
  const activeDay = days.find((d) => d.key === selectedDay) || soonestDay;

  const chooseSlot = (iso) => {
    setSelectedSlot(iso);
    setFormError('');
    setPhase('capture');
    track('Lead', { content_name: 'demo_slot_selected', content_category: 'demo' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('Please fill in your name, email, and phone.');
      return;
    }
    if (!form.role) {
      setFormError('Please tell us your role.');
      return;
    }
    setPhase('submitting');
    setFormError('');
    try {
      const res = await submitBooking({ slotStartUTC: selectedSlot, ...form });
      if (res.ok) {
        setPhase('success');
        window.setTimeout(() => window.location.assign(res.redirectPath || '/thank-you'), 1400);
        return;
      }
      if (res.reason === 'slot_taken') {
        setFormError('That time was just grabbed — pick another below.');
        setSelectedSlot(null);
        setPhase('browse');
        load();
        return;
      }
      setFormError('Something went wrong booking that slot. Try another time.');
      setPhase('capture');
    } catch {
      setFormError('Network hiccup — please try again.');
      setPhase('capture');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 30 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a0f]/95 p-6 shadow-2xl shadow-black/60"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-5 pr-10">
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">Book your demo</h2>
            <p className="mt-1 text-sm font-medium text-slate-400">Pick a time — you're booked in seconds.</p>
          </div>

          {(phase === 'browse' || phase === 'capture') && (
            <div className="mb-4 flex items-end justify-between px-0.5">
              {soonestDay && soonestDay.slots.length > 0 && soonestDay.slots.length <= LOW_SLOT_THRESHOLD ? (
                <span className="text-xs font-bold uppercase italic tracking-widest text-orange-400">
                  🔥 {soonestDay.slots.length} slot{soonestDay.slots.length === 1 ? '' : 's'} left {soonestDay.top.toLowerCase()}
                </span>
              ) : <span />}
              {abbr && <span className="text-[10px] uppercase tracking-tight text-slate-500">Times in {abbr}</span>}
            </div>
          )}

          {/* Loading */}
          {phase === 'loading' && (
            <div className="grid place-items-center gap-3 py-14 text-slate-400">
              <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
              <p className="text-xs font-bold uppercase italic tracking-widest">Loading open times…</p>
            </div>
          )}

          {/* Browse — day strip + time grid, everything visible at once */}
          {phase === 'browse' && (
            <div className="space-y-4">
              {/* Day strip */}
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {days.map((d) => {
                  const isActive = activeDay?.key === d.key;
                  return (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDay(d.key)}
                      className={`flex h-[4.5rem] w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border transition-all ${
                        isActive
                          ? 'border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'border-white/[0.06] bg-white/[0.03] text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                        {d.top}
                      </span>
                      <span className="text-sm font-black italic uppercase tracking-tight">{d.md}</span>
                    </button>
                  );
                })}
              </div>

              {/* Times for the selected day */}
              <motion.div
                key={activeDay?.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="grid max-h-[18rem] grid-cols-3 gap-2 overflow-y-auto pr-1"
              >
                {(activeDay?.slots || []).map((iso) => (
                  <button
                    key={iso}
                    onClick={() => chooseSlot(iso)}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] py-3 text-sm font-bold text-slate-100 transition-all hover:border-blue-400 hover:bg-blue-600 hover:text-white active:scale-95"
                  >
                    {fmtTime(iso)}
                  </button>
                ))}
              </motion.div>
            </div>
          )}

          {/* Capture */}
          {phase === 'capture' && selectedSlot && (
            <form onSubmit={submit} className="space-y-3">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Reserving</div>
                <div className="text-base font-black italic uppercase text-white">
                  {dayLabel(selectedSlot)} · {fmtTime(selectedSlot)}
                </div>
              </div>
              <input
                required type="text" placeholder="Full name" autoComplete="name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30"
              />
              <input
                required type="email" placeholder="Email" autoComplete="email"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30"
              />
              <input
                required type="tel" placeholder="Mobile phone" autoComplete="tel"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/30"
              />

              {/* Role — segmented selector */}
              <div>
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">Are you a</span>
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
                  {ROLES.map((r) => {
                    const active = form.role === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setForm({ ...form, role: r })}
                        className={`flex min-h-[2.75rem] items-center justify-center rounded-lg px-1 text-center text-[11px] font-black uppercase leading-tight tracking-tight transition-all ${
                          active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-xs text-slate-400">
                <input
                  type="checkbox" checked={form.textReminders}
                  onChange={(e) => setForm({ ...form, textReminders: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-white/5 accent-blue-600"
                />
                Text me a reminder about my demo
              </label>

              {formError && <p className="text-xs font-semibold text-red-400">{formError}</p>}

              <button
                type="submit"
                className="w-full rounded-xl bg-green-600 p-4 text-sm font-black uppercase italic tracking-wider text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-500"
              >
                Confirm my demo
              </button>
              <button
                type="button" onClick={() => { setPhase('browse'); setSelectedSlot(null); }}
                className="flex w-full items-center justify-center gap-1 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300"
              >
                <ArrowLeft className="h-3 w-3" /> Back to times
              </button>
            </form>
          )}

          {/* Submitting */}
          {phase === 'submitting' && (
            <div className="grid place-items-center gap-3 py-14 text-slate-300">
              <Loader2 className="h-9 w-9 animate-spin text-blue-500" />
              <p className="text-xs font-bold uppercase italic tracking-widest">Securing your spot…</p>
            </div>
          )}

          {/* Success */}
          {phase === 'success' && (
            <div className="grid place-items-center gap-3 py-12 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-green-500/20 text-green-400">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black italic uppercase text-white">You're in!</h3>
              <p className="max-w-xs text-sm text-slate-400">
                Check your email for the Google Meet link. See you {selectedSlot ? `${dayLabel(selectedSlot).toLowerCase()} at ${fmtTime(selectedSlot)}` : 'soon'}.
              </p>
            </div>
          )}

          {/* Empty / Error → Calendly fallback so we never lose a booking */}
          {(phase === 'empty' || phase === 'error') && (
            <div className="grid place-items-center gap-4 py-10 text-center">
              <p className="text-sm font-bold uppercase italic text-slate-200">
                {phase === 'empty' ? 'No open times right now.' : "Couldn't load the calendar."}
              </p>
              <button
                onClick={() => { onFallback?.(); onClose?.(); }}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black uppercase italic text-white transition-colors hover:bg-blue-500"
              >
                Book the classic way
              </button>
            </div>
          )}

          {/* Reassurance bar */}
          {phase !== 'success' && (
            <div className="mt-5 flex items-center justify-center gap-4 border-t border-white/5 pt-4 text-[10px] font-bold uppercase tracking-tight text-slate-500">
              <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" /> 30 min</span>
              <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Google Meet</span>
              <span className="flex items-center gap-1"><BadgeDollarSign className="h-3 w-3" /> $39/mo</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
