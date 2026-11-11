/**
 * KitabGhar Security & Cryptographic Hardening Utilities
 * - Zero plaintext credential storage (Salted SHA-256 verification)
 * - XSS / HTML Injection escaping for generated files & snippets
 * - Strict URL protocol validation (blocks javascript:, data:, vbscript:)
 * - Safe JSON parsing with Prototype Pollution protection
 * - Signed session token management
 */

const SECURITY_SALT = 'kg_v3_sec_salt_9f8a7b6c5d4e3f2a1b0c';
const SESSION_STORAGE_KEY = 'kitabghor_admin_session_v3';

// Salted SHA-256 hashes of default owner identifiers & passcode (no plaintext in bundle)
const DEFAULT_VALID_USER_HASHES = [
  '96a4142e5b88ac6ed4e9106d97ce2e97c50dc991fc3a00cf40f05de22b51bc71',
  '8ac9fc44ae4e2f1f5081a3ba02085f31a188ef136b5124e40ca14d31caf87e35',
  'dd0d53941cb68949a6221c4a73024692e5ddb38d23207039e000f4d4cc91b1a3'
];
const DEFAULT_PASSCODE_HASH = '3d8c52ea530e1b8f876e6f06c8c485a36c6ea634f12cf69942355380419d9852';

/**
 * Pure TypeScript synchronous SHA-256 implementation (works in all contexts,
 * including non-HTTPS local previews where crypto.subtle may be restricted).
 */
export function sha256Sync(ascii: string): string {
  const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';

  const words: number[] = [];
  // Encode UTF-8 string to byte string first
  const utf8 = unescape(encodeURIComponent(ascii));
  const asciiBitLength = utf8.length * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  let str = utf8 + '\x80';
  while ((str.length % 64) - 56) str += '\x00';
  for (let i = 0; i < str.length; i++) {
    const j = str.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    hash = hash.slice(0, 8);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Computes a salted SHA-256 hex digest for credential comparison.
 */
export function computeSaltedHash(value: string): string {
  return sha256Sync(`${SECURITY_SALT}:${value.trim()}`);
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifies admin username and password against stored or default salted hashes.
 */
export function verifyOwnerCredentials(
  usernameInput: string,
  passcodeInput: string,
  customUserHash?: string,
  customPassHash?: string
): boolean {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passcodeInput.trim();
  if (!cleanUser || !cleanPass) return false;

  const inputUserHash = computeSaltedHash(cleanUser);
  const inputPassHash = computeSaltedHash(cleanPass);

  const userMatchesDefault = DEFAULT_VALID_USER_HASHES.some((h) => timingSafeEqual(inputUserHash, h));
  const userMatchesCustom = customUserHash ? timingSafeEqual(inputUserHash, customUserHash) : false;
  const isUserValid = userMatchesCustom || userMatchesDefault;

  const activePassHash = customPassHash || DEFAULT_PASSCODE_HASH;
  const isPassValid = timingSafeEqual(inputPassHash, activePassHash);

  return isUserValid && isPassValid;
}

/**
 * Creates a signed session token stored in localStorage/sessionStorage.
 */
export function createAdminSession(customPassHash?: string): void {
  const issuedAt = Date.now().toString(36);
  const passRef = customPassHash || DEFAULT_PASSCODE_HASH;
  const signature = computeSaltedHash(`session:${issuedAt}:${passRef}`);
  const token = `${issuedAt}.${signature}`;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, token);
    sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    // Clean up legacy insecure session key
    localStorage.removeItem('kitabghor_admin_session_auth');
    sessionStorage.removeItem('kitabghor_admin_session_auth');
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Verifies whether the current browser holds a valid signed admin session token.
 */
export function hasValidAdminSession(customPassHash?: string): boolean {
  try {
    const token =
      localStorage.getItem(SESSION_STORAGE_KEY) ||
      sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!token || !token.includes('.')) return false;
    const [issuedAt, signature] = token.split('.');
    if (!issuedAt || !signature) return false;

    const passRef = customPassHash || DEFAULT_PASSCODE_HASH;
    const expectedSig = computeSaltedHash(`session:${issuedAt}:${passRef}`);
    return timingSafeEqual(signature, expectedSig);
  } catch {
    return false;
  }
}

/**
 * Clears the admin session token on logout.
 */
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('kitabghor_admin_session_auth');
    sessionStorage.removeItem('kitabghor_admin_session_auth');
  } catch {
    // ignore
  }
}

/**
 * Escapes HTML special characters to prevent Stored/Reflected XSS in generated files and snippets.
 */
export function escapeHtml(unsafe: string | number | undefined | null): string {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes URLs to block dangerous protocols (javascript:, vbscript:, data:text/html).
 */
export function sanitizeUrl(url: string | undefined | null, fallback = ''): string {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Strip control characters and whitespace tricks
  const normalized = trimmed.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
  if (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('data:text/') ||
    normalized.startsWith('data:application/')
  ) {
    return fallback;
  }

  // Allow relative paths (/..., ./..., #), https://, http://, and safe data:image/
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('#') ||
    /^https?:\/\//i.test(trimmed) ||
    /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/i.test(trimmed)
  ) {
    return trimmed;
  }

  return fallback;
}

/**
 * Sanitizes plain text input by trimming and stripping dangerous script tags or control chars.
 */
export function sanitizeText(input: string | undefined | null, maxLength = 2000): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<\s*\/?\s*script[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Safely parses JSON while stripping Prototype Pollution keys (__proto__, constructor, prototype).
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    }) as T;
  } catch {
    return null;
  }
}
