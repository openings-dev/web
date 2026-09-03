import { openingsDataUrl } from "./data-source";
import { fetchJson } from "./fetch-json";

// force-cache reuses a matching browser HTTP cache entry indefinitely,
// ignoring the origin's Cache-Control max-age. That is the right behavior
// during `next build`, where it keeps one static-export process reading a
// consistent snapshot for its whole run, but wrong for a browser tab, where
// it would keep serving a snapshot fetched on a prior visit forever instead
// of revalidating once the origin's max-age (5 minutes for this data) lapses.
const DEFAULT_STATIC_JSON_CACHE: RequestCache =
  typeof window === "undefined" ? "force-cache" : "default";

export async function fetchStaticJson(
  path: string,
  options: { cache?: RequestCache } = {},
): Promise<unknown> {
  const url = openingsDataUrl(path);
  const cache = options.cache ?? DEFAULT_STATIC_JSON_CACHE;
  return fetchJson(url, { cache });
}
