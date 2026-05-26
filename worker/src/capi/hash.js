export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

const HEX64 = /^[a-f0-9]{64}$/i;

export function passthroughIfHashed(value) {
  if (typeof value !== 'string') return '';
  return HEX64.test(value.trim()) ? value.trim().toLowerCase() : '';
}

export async function hashEmail(raw) {
  if (typeof raw !== 'string') return '';
  const passthrough = passthroughIfHashed(raw);
  if (passthrough) return passthrough;
  const normalized = raw.trim().toLowerCase();
  if (!normalized.includes('@')) return '';
  return sha256Hex(normalized);
}

export async function hashPhone(raw, defaultCountryCode = '1') {
  if (typeof raw !== 'string') return '';
  const passthrough = passthroughIfHashed(raw);
  if (passthrough) return passthrough;
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  const normalized = digits.length === 10 ? `${defaultCountryCode}${digits}` : digits;
  return sha256Hex(normalized);
}

export async function hashName(raw) {
  if (typeof raw !== 'string') return '';
  const passthrough = passthroughIfHashed(raw);
  if (passthrough) return passthrough;
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return '';
  return sha256Hex(normalized);
}

export async function hashLowercase(raw) {
  if (typeof raw !== 'string') return '';
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return '';
  return sha256Hex(normalized);
}
