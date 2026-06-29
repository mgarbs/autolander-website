// Phone + email normalization/validation for the demo application form.
// Audience is US/Canada car dealerships, so we default to North American
// formatting and also accept an explicit +<country> international number.
// The worker (worker/src/booking/router.js) mirrors normalizePhone/isValidEmail
// so the client and server agree on what counts as valid.

// NANP: 10 digits, NPA (area) + NXX (exchange) each start 2-9. This rejects the
// common junk ("0000000000", "1234567890", "(234) 012-3456", a missing digit).
const NANP_RE = /^[2-9]\d{2}[2-9]\d{6}$/;
// Domain must be DNS-style labels (no leading/trailing hyphen, no empty label)
// with a 2+ char alphabetic TLD; local part stays permissive.
const EMAIL_RE = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

// Live input mask: format the phone as the visitor types so they're forced into
// a clean, parseable shape. US/CA -> "(212) 555-0123". An explicit leading "+"
// switches to a light international mode ("+" followed by digits only).
export function formatPhoneInput(raw) {
  const s = String(raw ?? '');
  if (s.trim().startsWith('+')) {
    const digits = s.replace(/[^\d]/g, '').slice(0, 15);
    return digits ? `+${digits}` : '+';
  }
  let d = s.replace(/\D/g, '');
  // A pasted/typed US number with the country code 1 (e.g. "12125550123")
  // should fill the 10-digit mask, not be truncated to "(121) 255-50…".
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length === 0) return '';
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

// Strict normalize -> { ok, e164, pretty }.
//   ok     : whether this is a usable number
//   e164   : "+12125550123" form for SMS reminders / storage
//   pretty : human-friendly form shown to the sales team
export function normalizePhone(raw) {
  const s = String(raw ?? '').trim();
  const hasPlus = s.startsWith('+');
  const digits = s.replace(/\D/g, '');

  // North American first — handles a bare 10-digit number AND the country code
  // 1 (with or without a +), so a +1 number can't skip the NANP rule.
  let nat = digits;
  if (nat.length === 11 && nat.startsWith('1')) nat = nat.slice(1);
  if (NANP_RE.test(nat)) {
    return {
      ok: true,
      e164: `+1${nat}`,
      pretty: `(${nat.slice(0, 3)}) ${nat.slice(3, 6)}-${nat.slice(6)}`,
    };
  }

  // International only when explicitly prefixed with + (so a mistyped US number
  // isn't silently treated as international). Country code 1 is NANP, handled
  // above, so it's excluded here.
  if (hasPlus && !digits.startsWith('1') && /^[1-9]\d{7,14}$/.test(digits)) {
    const e164 = `+${digits}`;
    return { ok: true, e164, pretty: e164 };
  }

  return { ok: false, e164: '', pretty: '' };
}

export function isValidPhone(raw) {
  return normalizePhone(raw).ok;
}

// Rejects "a@b", "joe@gmail", "x@bad..com", "x@-bad.com" — the malformed
// addresses that would bounce follow-up email.
export function isValidEmail(raw) {
  return EMAIL_RE.test(String(raw ?? '').trim());
}
