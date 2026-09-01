interface ShareableDiscoveryOptions {
  selectedKey: string;
  localOnlyKeys: string[];
}

const DEFAULT_VALUES: Record<string, string> = {
  country: "all",
  repository: "all",
  region: "all",
  freshness: "all",
  technologyMatch: "any",
  sort: "recent",
  view: "list",
  page: "1",
};

export function buildShareableDiscoveryUrl(
  currentUrl: string,
  allowedKeys: string[],
  options: ShareableDiscoveryOptions,
) {
  const current = new URL(currentUrl);
  const allowed = new Set(allowedKeys);
  const excluded = new Set([options.selectedKey, ...options.localOnlyKeys]);
  const result = new URL(current.pathname, current.origin);

  for (const [key, value] of current.searchParams) {
    if (!allowed.has(key) || excluded.has(key) || DEFAULT_VALUES[key] === value) continue;
    result.searchParams.append(key, value);
  }
  return result.toString();
}
