const MAX_COMPARISON_ITEMS = 3;
const SAFE_OPPORTUNITY_ID = /^[A-Za-z0-9_-]{3,96}$/;

export function parseComparisonIds(value: string | null) {
  const ids = String(value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => SAFE_OPPORTUNITY_ID.test(id));
  return [...new Set(ids)].slice(0, MAX_COMPARISON_ITEMS);
}

export function serializeComparisonIds(ids: string[]) {
  return parseComparisonIds(ids.join(",")).join(",");
}

export function buildComparisonHref(ids: string[]) {
  const serialized = serializeComparisonIds(ids);
  return serialized ? `/compare?jobs=${encodeURIComponent(serialized)}` : "/compare";
}
