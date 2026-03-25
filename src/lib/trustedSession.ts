const TRUSTED_SESSION_KEY = 'budget.auth.trustedSession.v1';
const TRUSTED_SESSION_VERSION = 1;
const TRUSTED_SESSION_TTL_MS = 30 * 60 * 1000;

interface TrustedSession {
  version: number;
  issuedAt: number;
  expiresAt: number;
}

function isStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function isValidTrustedSession(value: unknown): value is TrustedSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybe = value as Partial<TrustedSession>;
  if (maybe.version !== TRUSTED_SESSION_VERSION) {
    return false;
  }

  if (typeof maybe.issuedAt !== 'number' || typeof maybe.expiresAt !== 'number') {
    return false;
  }

  if (!Number.isFinite(maybe.issuedAt) || !Number.isFinite(maybe.expiresAt)) {
    return false;
  }

  if (maybe.issuedAt <= 0 || maybe.expiresAt <= 0 || maybe.expiresAt < maybe.issuedAt) {
    return false;
  }

  // Defend against malformed entries with unexpectedly long TTL.
  if (maybe.expiresAt - maybe.issuedAt > TRUSTED_SESSION_TTL_MS) {
    return false;
  }

  return true;
}

export function readTrustedSession(): TrustedSession | null {
  if (!isStorageAvailable()) {
    return null;
  }

  const raw = window.localStorage.getItem(TRUSTED_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidTrustedSession(parsed)) {
      window.localStorage.removeItem(TRUSTED_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.localStorage.removeItem(TRUSTED_SESSION_KEY);
    return null;
  }
}

export function isTrustedSessionValid(now: number = Date.now()): boolean {
  const session = readTrustedSession();
  if (!session) {
    return false;
  }

  if (now > session.expiresAt) {
    clearTrustedSession();
    return false;
  }

  return true;
}

export function writeTrustedSession(now: number = Date.now()): void {
  if (!isStorageAvailable()) {
    return;
  }

  const payload: TrustedSession = {
    version: TRUSTED_SESSION_VERSION,
    issuedAt: now,
    expiresAt: now + TRUSTED_SESSION_TTL_MS,
  };

  window.localStorage.setItem(TRUSTED_SESSION_KEY, JSON.stringify(payload));
}

export function clearTrustedSession(): void {
  if (!isStorageAvailable()) {
    return;
  }

  window.localStorage.removeItem(TRUSTED_SESSION_KEY);
}
