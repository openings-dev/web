import type { UpdateEntry } from "./types";

const LOCALES = ["en", "pt", "es", "it", "fr", "de"];
const CATEGORIES = new Set(["discovery", "data", "trust", "operations", "growth"]);
const ROADMAP_LANES = new Set(["now", "next", "later"]);

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function hasCompleteCopy(copy: unknown): boolean {
  if (!copy || typeof copy !== "object" || Array.isArray(copy)) return false;
  const record = copy as Record<string, unknown>;
  if (Object.keys(record).sort().join(",") !== [...LOCALES].sort().join(",")) return false;
  return LOCALES.every((locale) => {
    const item = record[locale];
    return item !== null && typeof item === "object" && !Array.isArray(item) &&
      typeof (item as Record<string, unknown>).title === "string" &&
      String((item as Record<string, unknown>).title).trim().length > 0 &&
      typeof (item as Record<string, unknown>).summary === "string" &&
      String((item as Record<string, unknown>).summary).trim().length > 0;
  });
}

function isSafeHref(href: unknown): boolean {
  if (href === undefined) return true;
  if (typeof href !== "string" || href.trim() !== href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEntry(entry: unknown): entry is UpdateEntry {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
  const item = entry as Record<string, unknown>;
  if (typeof item.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(item.id) ||
    !CATEGORIES.has(String(item.category)) || !hasCompleteCopy(item.copy) ||
    !isSafeHref(item.href)) return false;

  if (item.kind === "changelog") {
    return isIsoDate(item.date) && item.version === undefined && item.lane === undefined;
  }
  if (item.kind === "release") {
    return isIsoDate(item.date) && typeof item.version === "string" &&
      /^\d{4}\.\d{2}$/u.test(item.version) &&
      item.version === item.date.slice(0, 7).replace("-", ".") && item.lane === undefined;
  }
  if (item.kind === "roadmap") {
    return ROADMAP_LANES.has(String(item.lane)) &&
      item.date === undefined && item.version === undefined;
  }
  return false;
}

export function validateUpdateEntries(entries: unknown): asserts entries is UpdateEntry[] {
  if (!Array.isArray(entries) || !entries.every(isValidEntry)) {
    throw new Error("Invalid public update content");
  }
  const ids = entries.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate public update id");
}
