export const CANDIDATE_STATE_STORAGE_KEY = "openings.candidate-state.v2";
export const LEGACY_SAVED_STORAGE_KEY = "openings.saved-jobs.v1";
export const LEGACY_LAST_VISIT_STORAGE_KEY = "openings.last-visit.v1";
export const LEGACY_PREFERENCES_STORAGE_KEY = "openings.discovery.preferences.v1";

export interface CandidatePreferences {
  country?: string;
  workModels?: string[];
  technologies?: string[];
  seniority?: string[];
}

export interface LocalCandidateState {
  version: 2;
  saved: Record<string, string>;
  viewed: Record<string, string>;
  lastVisitAt: string | null;
  preferences: CandidatePreferences;
}

export const EMPTY_CANDIDATE_STATE: LocalCandidateState = {
  version: 2,
  saved: {},
  viewed: {},
  lastVisitAt: null,
  preferences: {},
};

function validTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function timestampRecord(value: unknown) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([id, timestamp]) => Boolean(id) && validTimestamp(timestamp)));
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())))]
    : undefined;
}

function preferences(value: unknown): CandidatePreferences {
  if (!value || typeof value !== "object") return {};
  const candidate = value as Record<string, unknown>;
  return {
    ...(typeof candidate.country === "string" ? { country: candidate.country } : {}),
    ...(stringList(candidate.workModels) ? { workModels: stringList(candidate.workModels) } : {}),
    ...(stringList(candidate.technologies) ? { technologies: stringList(candidate.technologies) } : {}),
    ...(stringList(candidate.seniority) ? { seniority: stringList(candidate.seniority) } : {}),
  };
}

export function parseCandidateState(raw: string | null): LocalCandidateState {
  try {
    const value = JSON.parse(raw ?? "null") as Record<string, unknown> | null;
    if (!value || typeof value !== "object") return { ...EMPTY_CANDIDATE_STATE };
    const now = new Date().toISOString();
    if (value.version === 1 && Array.isArray(value.favorites)) {
      return {
        ...EMPTY_CANDIDATE_STATE,
        saved: Object.fromEntries(stringList(value.favorites)?.map((id) => [id, now]) ?? []),
      };
    }
    return {
      version: 2,
      saved: timestampRecord(value.saved),
      viewed: timestampRecord(value.viewed),
      lastVisitAt: validTimestamp(value.lastVisitAt) ? value.lastVisitAt : null,
      preferences: preferences(value.preferences),
    };
  } catch {
    return { ...EMPTY_CANDIDATE_STATE };
  }
}

function readRaw(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readCandidateState(): LocalCandidateState {
  const current = parseCandidateState(readRaw(CANDIDATE_STATE_STORAGE_KEY));
  if (Object.keys(current.saved).length > 0 || current.lastVisitAt || Object.keys(current.preferences).length > 0) {
    return current;
  }
  const now = new Date().toISOString();
  let saved: string[] = [];
  try {
    const legacySaved = JSON.parse(readRaw(LEGACY_SAVED_STORAGE_KEY) ?? "[]");
    saved = stringList(legacySaved) ?? [];
  } catch {
    saved = [];
  }
  let legacyPreferences: unknown = null;
  try {
    legacyPreferences = JSON.parse(readRaw(LEGACY_PREFERENCES_STORAGE_KEY) ?? "null");
  } catch {
    legacyPreferences = null;
  }
  const lastVisit = readRaw(LEGACY_LAST_VISIT_STORAGE_KEY);
  return {
    version: 2,
    saved: Object.fromEntries(saved.map((id) => [id, now])),
    viewed: {},
    lastVisitAt: validTimestamp(lastVisit) ? lastVisit : null,
    preferences: preferences(legacyPreferences),
  };
}

export function writeCandidateState(state: LocalCandidateState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CANDIDATE_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Browser-local tools keep their in-memory state if storage is blocked or full.
  }
}

export function updateCandidateState(update: (state: LocalCandidateState) => LocalCandidateState) {
  const next = update(readCandidateState());
  writeCandidateState(next);
  return next;
}

export function readCandidatePreferences() {
  return readCandidateState().preferences;
}

export function writeCandidatePreferences(next: CandidatePreferences) {
  updateCandidateState((state) => ({ ...state, preferences: next }));
}
