import { useEffect, useId, useRef, useState } from 'react';
import { Loader2, MessageSquareText, Phone, Search } from 'lucide-react';
import {
  candidateContacts,
  candidateLabel,
  dialablePhone,
  displayReferralCode,
  searchSupportCandidates,
} from './lib/support-adjustments.js';

const MIN_QUERY_LENGTH = 2;
const SEARCH_DELAY_MS = 100;

export default function CustomerSearch({
  value,
  onChange,
  onSelectCandidate,
  disabled = false,
}) {
  const [candidates, setCandidates] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchSeq = useRef(0);
  const abortRef = useRef(null);
  const selectedOrgQuery = useRef('');
  const listId = useId();

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    const query = String(value || '').trim();
    const seq = searchSeq.current + 1;
    searchSeq.current = seq;
    const wasCandidateSelection = selectedOrgQuery.current === query;
    if (wasCandidateSelection) selectedOrgQuery.current = '';
    const shouldSearch = !wasCandidateSelection && query.length >= MIN_QUERY_LENGTH && !disabled;

    const timeoutId = window.setTimeout(async () => {
      if (searchSeq.current !== seq) return;
      if (!shouldSearch) {
        setCandidates([]);
        setSearching(false);
        setSearchError('');
        setOpen(false);
        setActiveIndex(-1);
        return;
      }

      setSearching(true);
      setSearchError('');
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const rows = await searchSupportCandidates(query, { signal: controller.signal });
        if (searchSeq.current !== seq) return;
        setCandidates(rows);
        setOpen(rows.length > 0);
        setActiveIndex(rows.length > 0 ? 0 : -1);
      } catch (err) {
        if (searchSeq.current !== seq) return;
        if (err?.name === 'AbortError') return;
        setCandidates([]);
        setOpen(false);
        setActiveIndex(-1);
        setSearchError('Customer lookup is unavailable. Direct account search is still active.');
      } finally {
        if (searchSeq.current === seq) {
          abortRef.current = null;
          setSearching(false);
        }
      }
    }, shouldSearch ? SEARCH_DELAY_MS : 0);

    return () => {
      window.clearTimeout(timeoutId);
      abortRef.current?.abort();
    };
  }, [disabled, value]);

  function changeValue(nextValue) {
    selectedOrgQuery.current = '';
    setOpen(false);
    setActiveIndex(-1);
    onChange?.(nextValue);
  }

  function selectCandidate(candidate) {
    const orgId = String(candidate?.orgId || '').trim();
    if (!orgId) return;
    searchSeq.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    selectedOrgQuery.current = orgId;
    setCandidates([]);
    setOpen(false);
    setActiveIndex(-1);
    setSearchError('');
    onChange?.(orgId);
    onSelectCandidate?.(orgId, candidate);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!open || candidates.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % candidates.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? candidates.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectCandidate(candidates[activeIndex]);
    }
  }

  return (
    <div
      className="relative min-w-0 flex-[2_1_280px]"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label className="relative block min-w-0">
        <span className="sr-only">Search customers and accounts</span>
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-activedescendant={open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          value={value}
          disabled={disabled}
          onChange={(event) => changeValue(event.target.value)}
          onFocus={() => {
            if (candidates.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search name, username, email, phone, account, slug, or org ID..."
          className="h-10 w-full min-w-0 rounded-xl border border-white/10 bg-black/50 pl-9 pr-9 text-xs text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {searching && (
          <Loader2
            size={14}
            aria-label="Searching customers"
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
          />
        )}
      </label>

      {searchError && (
        <p className="mt-1.5 text-[10px] font-bold text-amber-300" role="status">
          {searchError}
        </p>
      )}

      {open && candidates.length > 0 && (
        <div
          id={listId}
          role="listbox"
          aria-label="Matching customers"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-white/15 bg-slate-950 p-1 shadow-2xl"
        >
          {candidates.map((candidate, index) => {
            const contacts = candidateContacts(candidate).slice(0, 3);
            const contactPhones = uniquePhones(contacts, candidate.phone);
            return (
              <div
                key={candidate.orgId}
                role="presentation"
                className={`rounded-lg border ${
                  activeIndex === index
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-transparent hover:bg-white/[0.05]'
                }`}
              >
                <button
                  id={`${listId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectCandidate(candidate)}
                  className="block w-full px-3 py-2.5 text-left"
                >
                  <span className="flex min-w-0 items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-white">
                        {candidateLabel(candidate)}
                      </span>
                      <span className="mt-0.5 block truncate text-[9px] font-black uppercase tracking-widest text-slate-600">
                        {[candidate.slug, candidate.orgId].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    {candidate.plan && (
                      <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {candidate.plan}
                      </span>
                    )}
                  </span>
                  {contacts.length > 0 && (
                    <span className="mt-2 block space-y-1">
                      {contacts.map((contact, contactIndex) => (
                        <span
                          key={contact.id || contact.email || contact.username || contact.phone || contactIndex}
                          className="block min-w-0 text-[10px] text-slate-400"
                        >
                          <span className="block min-w-0 truncate">
                            <span className="font-bold text-slate-200">{contactName(contact)}</span>
                            {contactDetails(contact) && <span> · {contactDetails(contact)}</span>}
                          </span>
                          <span className="mt-0.5 block min-w-0 truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Referral code:{' '}
                            <span
                              className={contact.referralCode ? 'font-mono text-blue-200' : 'text-slate-600'}
                              title={contact.referralCode || 'No referral code'}
                            >
                              {displayReferralCode(contact)}
                            </span>
                          </span>
                        </span>
                      ))}
                    </span>
                  )}
                </button>
                {contactPhones.length > 0 && (
                  <div className="flex flex-wrap gap-2 border-t border-white/5 px-3 py-2">
                    {contactPhones.map(({ phone, label }) => (
                      <ContactPhoneActions key={`${label}:${phone}`} phone={phone} label={label} compact />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ContactPhoneActions({ phone, label = 'customer', compact = false }) {
  const dial = dialablePhone(phone);
  if (!dial) return null;
  const actionClass = compact
    ? 'inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[8px] font-black uppercase tracking-wider text-slate-300 transition hover:border-blue-400/40 hover:text-white'
    : 'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-300 transition hover:border-blue-400/40 hover:text-white';

  return (
    <span
      className="inline-flex min-w-0 flex-wrap items-center gap-1.5"
      onClick={(event) => event.stopPropagation()}
    >
      <span className="max-w-36 truncate text-[10px] font-bold text-slate-400" title={phone}>{phone}</span>
      <a href={`tel:${dial}`} aria-label={`Call ${label} at ${phone}`} className={actionClass}>
        <Phone size={compact ? 10 : 12} aria-hidden="true" />
        Call
      </a>
      <a href={`sms:${dial}`} aria-label={`Text ${label} at ${phone}`} className={actionClass}>
        <MessageSquareText size={compact ? 10 : 12} aria-hidden="true" />
        Text
      </a>
    </span>
  );
}

function contactName(contact) {
  return contact.displayName || contact.email || contact.username || contact.phone || 'Customer';
}

function contactDetails(contact) {
  return [
    contact.displayName && contact.email,
    contact.username && `@${contact.username}`,
    contact.phone,
  ].filter(Boolean).join(' · ');
}

function uniquePhones(contacts, accountPhone) {
  const rows = contacts
    .filter((contact) => contact.phone)
    .map((contact) => ({
      phone: contact.phone,
      label: contact.displayName || contact.email || contact.username || 'customer',
    }));
  if (accountPhone) rows.push({ phone: accountPhone, label: 'customer' });
  return rows.filter((row, index) => (
    rows.findIndex((item) => dialablePhone(item.phone) === dialablePhone(row.phone)) === index
  )).slice(0, 3);
}
