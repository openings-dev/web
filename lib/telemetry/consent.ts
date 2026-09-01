export type AnalyticsConsentState = "undecided" | "granted" | "denied";

export const ANALYTICS_CONSENT_KEY = "openings.analytics-consent.v1";
const ANALYTICS_CONSENT_VERSION = 1;

export interface ConsentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const listeners = new Set<() => void>();
let listeningForStorage = false;

function browserStorage(): ConsentStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function notifyConsentChanged() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key === ANALYTICS_CONSENT_KEY) notifyConsentChanged();
}

export function readAnalyticsConsent(
  storage: ConsentStorage | null = browserStorage(),
): AnalyticsConsentState {
  if (!storage) return "undecided";
  try {
    const raw = storage.getItem(ANALYTICS_CONSENT_KEY);
    if (!raw) return "undecided";
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value.version !== ANALYTICS_CONSENT_VERSION) return "undecided";
    return value.state === "granted" || value.state === "denied"
      ? value.state
      : "undecided";
  } catch {
    return "undecided";
  }
}

export function writeAnalyticsConsent(
  state: Exclude<AnalyticsConsentState, "undecided">,
  storage: ConsentStorage | null = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify({
      version: ANALYTICS_CONSENT_VERSION,
      state,
      updatedAt: new Date().toISOString(),
    }));
    notifyConsentChanged();
    return true;
  } catch {
    return false;
  }
}

export function subscribeAnalyticsConsent(listener: () => void) {
  listeners.add(listener);
  if (!listeningForStorage && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    listeningForStorage = true;
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && listeningForStorage && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
      listeningForStorage = false;
    }
  };
}
