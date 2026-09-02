const routeBuckets = [
  [/^\/jobs\/[^/]+/u, "/jobs/:id"],
  [/^\/reports\/\d{4}-\d{2}/u, "/reports/:month"],
  [/^\/authors\/[^/]+/u, "/authors/:handle"],
  [/^\/users\/[^/]+/u, "/users/:handle"],
  [/^\/communities\/[^/]+\/[^/]+/u, "/communities/:owner/:repo"],
  [/^\/community\/[^/]+/u, "/community/:slug"],
];

function cleanText(value) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/gu, "").trim();
}

function metric(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

function dateFrom(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new TypeError("Traffic timestamp is invalid.");
  return date.toISOString().slice(0, 10);
}

function normalizeSeries(series) {
  if (!Array.isArray(series)) return [];
  return series.map((entry) => ({
    date: dateFrom(entry?.timestamp),
    count: metric(entry?.count),
    uniques: metric(entry?.uniques),
  }));
}

function sanitizePath(value) {
  const path = cleanText(value).split(/[?#]/u, 1)[0] || "/";
  const bucket = routeBuckets.find(([pattern]) => pattern.test(path));
  return bucket?.[1] ?? path.slice(0, 160);
}

function aggregate(items, keyName, sanitize) {
  const totals = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const key = sanitize(item?.[keyName]);
    if (!key) continue;
    const current = totals.get(key) ?? { count: 0, uniques: 0 };
    current.count += metric(item?.count);
    current.uniques += metric(item?.uniques);
    totals.set(key, current);
  }
  return [...totals].map(([key, totalsForKey]) => ({ [keyName]: key, ...totalsForKey }))
    .sort((left, right) => right.count - left.count || left[keyName].localeCompare(right[keyName]));
}

export function normalizeTrafficSnapshot(input) {
  const repository = cleanText(input?.repository);
  if (!/^[\w.-]+\/[\w.-]+$/u.test(repository)) throw new TypeError("Repository must be owner/name.");
  const collectedAt = new Date(input?.collectedAt);
  if (Number.isNaN(collectedAt.valueOf())) throw new TypeError("Collection timestamp is invalid.");

  const views = new Map(normalizeSeries(input?.views?.views).map((item) => [item.date, item]));
  const clones = new Map(normalizeSeries(input?.clones?.clones).map((item) => [item.date, item]));
  const dates = [...new Set([...views.keys(), ...clones.keys()])].sort();

  return {
    repository,
    collectedAt: collectedAt.toISOString(),
    collectedOn: collectedAt.toISOString().slice(0, 10),
    days: dates.map((date) => ({
      date,
      views: { count: views.get(date)?.count ?? 0, uniques: views.get(date)?.uniques ?? 0 },
      clones: { count: clones.get(date)?.count ?? 0, uniques: clones.get(date)?.uniques ?? 0 },
    })),
    referrers: aggregate(input?.referrers, "referrer", (value) => cleanText(value).toLowerCase().slice(0, 120)),
    paths: aggregate(input?.paths, "path", sanitizePath),
  };
}

export function mergeTrafficHistory(existing, snapshot) {
  if (existing?.repository && existing.repository !== snapshot.repository) {
    throw new TypeError("Traffic history belongs to another repository.");
  }
  const snapshots = new Map((existing?.snapshots ?? []).map((item) => [item.collectedOn, item]));
  snapshots.set(snapshot.collectedOn, snapshot);
  const orderedSnapshots = [...snapshots.values()].sort((left, right) => left.collectedOn.localeCompare(right.collectedOn));
  const days = new Map((existing?.days ?? []).map((item) => [item.date, item]));
  for (const day of snapshot.days) days.set(day.date, day);

  return {
    schemaVersion: 1,
    repository: snapshot.repository,
    updatedAt: orderedSnapshots.at(-1)?.collectedAt ?? snapshot.collectedAt,
    days: [...days.values()].sort((left, right) => left.date.localeCompare(right.date)),
    snapshots: orderedSnapshots,
  };
}
