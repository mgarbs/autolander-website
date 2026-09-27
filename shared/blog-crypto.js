const AES_KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const GCM_TAG_BITS = 128;
const GCM_TAG_BYTES = GCM_TAG_BITS / 8;
const encoder = new TextEncoder();

function cryptoApi() {
  const api = globalThis.crypto;
  if (!api?.subtle || typeof api.getRandomValues !== 'function') {
    throw new Error('Web Crypto API is unavailable');
  }
  return api;
}

function toStandardBase64(bytes) {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 1) {
    binary += String.fromCharCode(bytes[offset]);
  }
  return btoa(binary);
}

function fromStandardBase64(value) {
  if (
    typeof value !== 'string'
    || value.length === 0
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
  ) {
    throw new Error('invalid base64');
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let offset = 0; offset < binary.length; offset += 1) {
    bytes[offset] = binary.charCodeAt(offset);
  }
  if (toStandardBase64(bytes) !== value) throw new Error('invalid base64');
  return bytes;
}

function requirePlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('payload must be an object');
  }
}

async function importAesKey(keyB64, usage) {
  const rawKey = fromStandardBase64(keyB64);
  if (rawKey.length !== AES_KEY_BYTES) throw new Error('invalid AES key');
  return cryptoApi().subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM', length: AES_KEY_BYTES * 8 },
    false,
    [usage],
  );
}

export function newKeyB64() {
  const rawKey = new Uint8Array(AES_KEY_BYTES);
  cryptoApi().getRandomValues(rawKey);
  return toStandardBase64(rawKey);
}

export async function encryptPayload(obj, keyB64, aad) {
  requirePlainObject(obj);
  if (typeof aad !== 'string') throw new Error('AAD must be a string');

  const key = await importAesKey(keyB64, 'encrypt');
  const iv = new Uint8Array(GCM_IV_BYTES);
  cryptoApi().getRandomValues(iv);
  const plaintext = encoder.encode(JSON.stringify(obj));
  const encrypted = new Uint8Array(await cryptoApi().subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: encoder.encode(aad),
      tagLength: GCM_TAG_BITS,
    },
    key,
    plaintext,
  ));
  const envelope = new Uint8Array(iv.length + encrypted.length);
  envelope.set(iv);
  envelope.set(encrypted, iv.length);
  return toStandardBase64(envelope);
}

export async function decryptPayload(b64, keyB64, aad) {
  try {
    if (typeof aad !== 'string') throw new Error('invalid AAD');
    const envelope = fromStandardBase64(b64);
    if (envelope.length < GCM_IV_BYTES + GCM_TAG_BYTES) throw new Error('invalid envelope');

    const key = await importAesKey(keyB64, 'decrypt');
    const plaintext = await cryptoApi().subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: envelope.slice(0, GCM_IV_BYTES),
        additionalData: encoder.encode(aad),
        tagLength: GCM_TAG_BITS,
      },
      key,
      envelope.slice(GCM_IV_BYTES),
    );
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(plaintext));
    requirePlainObject(value);
    return value;
  } catch {
    throw new Error('blog payload: decrypt failed');
  }
}
