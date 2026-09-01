import {
  TELEMETRY_EVENT_FIELDS,
  type TelemetryEventMap,
  type TelemetryEventName,
} from "./contracts";

const FORBIDDEN_KEYS = new Set([
  "query", "search", "title", "description", "email", "url", "referrer",
]);
const SAFE_IDENTIFIER = /^[A-Za-z0-9_./-]+$/u;
const MAX_IDENTIFIER_LENGTH = 96;

function stableSlug(value: string) {
  return value.toLowerCase().normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function safeString(value: unknown) {
  if (typeof value !== "string" || value.length > MAX_IDENTIFIER_LENGTH) {
    return undefined;
  }
  if (value.includes("@") || value.includes("://") || /\s/u.test(value)) {
    return undefined;
  }
  return SAFE_IDENTIFIER.test(value) ? value : undefined;
}

function safeProperty(name: string, key: string, value: unknown) {
  if (FORBIDDEN_KEYS.has(key.toLowerCase())) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  }
  const normalized = name === "Filter Applied" && key === "value" &&
    typeof value === "string" ? stableSlug(value) : value;
  return safeString(normalized);
}

export function sanitizeProductEvent<Name extends TelemetryEventName>(
  name: Name | string,
  properties: TelemetryEventMap[Name] | Record<string, unknown>,
): { name: Name; properties: Partial<TelemetryEventMap[Name]> } | null {
  if (!(name in TELEMETRY_EVENT_FIELDS)) return null;
  const eventName = name as Name;
  const allowed = TELEMETRY_EVENT_FIELDS[eventName] as readonly string[];
  const input = properties as Record<string, unknown>;
  const sanitized = Object.fromEntries(allowed.flatMap((key) => {
    const value = safeProperty(name, key, input[key]);
    return value === undefined ? [] : [[key, value]];
  })) as Partial<TelemetryEventMap[Name]>;
  return { name: eventName, properties: sanitized };
}

export function stripUrlDetails(value: string): string {
  try {
    const url = new URL(value, "https://openings.dev");
    return `${url.origin}${url.pathname}`;
  } catch {
    return "https://openings.dev/";
  }
}

function normalizeErrorText(value: unknown) {
  if (typeof value !== "string") return undefined;
  return value
    .replace(/https?:\/\/[^\s]+/giu, (url) => stripUrlDetails(url))
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/gu, "[redacted]")
    .slice(0, 240);
}

function safeTags(tags: unknown) {
  if (!tags || typeof tags !== "object") return undefined;
  const values = Object.entries(tags).flatMap(([key, value]) => {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) return [];
    const safeKey = safeString(key);
    const safeValue = safeString(value);
    return safeKey && safeValue ? [[safeKey, safeValue]] : [];
  });
  return values.length > 0 ? Object.fromEntries(values) : undefined;
}

export function sanitizeSentryEvent(event: Record<string, unknown>) {
  const exception = event.exception && typeof event.exception === "object"
    ? event.exception as { values?: Array<Record<string, unknown>> }
    : undefined;
  const values = exception?.values?.map((value) => ({
    ...(safeString(value.type) ? { type: value.type } : {}),
    ...(normalizeErrorText(value.value) ? { value: normalizeErrorText(value.value) } : {}),
    ...(value.stacktrace ? { stacktrace: value.stacktrace } : {}),
  }));
  return {
    ...(safeString(event.environment) ? { environment: event.environment } : {}),
    ...(safeString(event.release) ? { release: event.release } : {}),
    ...(normalizeErrorText(event.message) ? { message: normalizeErrorText(event.message) } : {}),
    ...(values?.length ? { exception: { values } } : {}),
    ...(safeTags(event.tags) ? { tags: safeTags(event.tags) } : {}),
  };
}

export function sanitizeSentryBreadcrumb(breadcrumb: Record<string, unknown>) {
  return {
    ...(safeString(breadcrumb.category) ? { category: breadcrumb.category } : {}),
    ...(safeString(breadcrumb.type) ? { type: breadcrumb.type } : {}),
    ...(safeString(breadcrumb.level) ? { level: breadcrumb.level } : {}),
    ...(normalizeErrorText(breadcrumb.message)
      ? { message: normalizeErrorText(breadcrumb.message) }
      : {}),
  };
}
