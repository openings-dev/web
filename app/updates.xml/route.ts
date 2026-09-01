import { serializeAtomFeed } from "@/lib/feeds/atom";
import { resolveCanonicalUrl } from "@/lib/metadata/site-metadata";
import { UPDATE_ENTRIES } from "@/lib/updates/content";

export const dynamic = "force-static";

export async function GET() {
  const published = UPDATE_ENTRIES.filter((entry) => entry.kind !== "roadmap");
  const updated = `${published.map((entry) => entry.date).sort().at(-1)}T00:00:00.000Z`;
  const body = serializeAtomFeed({
    id: resolveCanonicalUrl("/updates.xml"),
    title: "openings.dev — Product updates",
    subtitle: "Verified product changes and releases.",
    selfUrl: resolveCanonicalUrl("/updates.xml"),
    siteUrl: resolveCanonicalUrl("/updates"),
    updated,
    entries: published.map((entry) => {
      const url = `https://openings.dev/updates#update-${entry.id}`;
      return {
        id: url,
        url,
        title: entry.copy.en.title,
        updated: `${entry.date}T00:00:00.000Z`,
        published: `${entry.date}T00:00:00.000Z`,
        summary: entry.copy.en.summary,
      };
    }),
  });
  return new Response(body, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
