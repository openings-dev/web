export interface AtomFeedEntry {
  id: string;
  url: string;
  title: string;
  updated: string;
  published?: string;
  summary: string;
}

interface AtomFeedInput {
  id: string;
  title: string;
  subtitle: string;
  selfUrl: string;
  siteUrl: string;
  updated: string;
  entries: AtomFeedEntry[];
}

function xml(value: string) {
  return value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&apos;");
}

function validDate(value: string) {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`Invalid Atom date: ${value}`);
  return new Date(value).toISOString();
}

function httpsUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`Invalid Atom URL: ${value}`);
  return url.toString();
}

export function serializeAtomFeed(input: AtomFeedInput) {
  const unique = new Map(input.entries.map((entry) => [entry.id, entry]));
  const entries = [...unique.values()]
    .sort((left, right) => Date.parse(right.updated) - Date.parse(left.updated) ||
      left.id.localeCompare(right.id))
    .slice(0, 50);
  const renderedEntries = entries.map((entry) => {
    const published = entry.published
      ? `<published>${xml(validDate(entry.published))}</published>` : "";
    return `<entry><id>${xml(httpsUrl(entry.id))}</id><title>${xml(entry.title)}</title>` +
      `<link href="${xml(httpsUrl(entry.url))}"/><updated>${xml(validDate(entry.updated))}</updated>` +
      `${published}<summary type="text">${xml(entry.summary.slice(0, 280))}</summary></entry>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<feed xmlns="http://www.w3.org/2005/Atom"><id>${xml(httpsUrl(input.id))}</id>` +
    `<title>${xml(input.title)}</title><subtitle>${xml(input.subtitle)}</subtitle>` +
    `<link rel="self" href="${xml(httpsUrl(input.selfUrl))}"/>` +
    `<link rel="alternate" href="${xml(httpsUrl(input.siteUrl))}"/>` +
    `<updated>${xml(validDate(input.updated))}</updated>${renderedEntries}</feed>`;
}
