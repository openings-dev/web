import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

function dataModule(source) {
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

const [robotsSource, sitemapSource] = await Promise.all([
  readFile("app/robots.ts", "utf8"),
  readFile("app/sitemap.ts", "utf8"),
]);
assert.match(robotsSource, /allow:\s*"\/"/u);
assert.match(robotsSource, /sitemap\.xml/u);
assert.match(robotsSource, /dynamic\s*=\s*"force-static"/u);
assert.match(sitemapSource, /dynamic\s*=\s*"force-static"/u);
assert.match(sitemapSource, /listStaticOpportunities/u);
assert.match(sitemapSource, /listSnapshotCommunities/u);
assert.match(sitemapSource, /CURATED_DISCOVERY_PRESETS/u);
assert.doesNotMatch(sitemapSource, /listStaticOpportunityRouteIds/u);
assert.doesNotMatch(sitemapSource, /[?&]repository=/u);
assert.doesNotMatch(sitemapSource, /LEGACY_ROUTES/u);

const jobPostingSource = await readFile("lib/metadata/job-posting.ts", "utf8");
const jobPosting = await import(dataModule(jobPostingSource));
const eligibleJob = {
  id: "job-1",
  issueState: "open",
  title: "Senior React Engineer",
  description: "Build accessible web products with a distributed team. This is a complete public role description.\n\n## How to apply\nApply at https://jobs.example.com/roles/123",
  companyName: "Acme",
  createdAt: "2026-08-25T12:00:00.000Z",
  freshness: { status: "fresh" },
  jobLocation: { country: "Brazil", countryCode: "BR", workModel: "hybrid", remoteScope: "unspecified" },
  dataProvenance: { location: "declared", salary: "unknown", seniority: "declared", workModel: "declared" },
  taxonomy: { employmentTypes: ["full-time"] },
};
assert.deepEqual(jobPosting.evaluateJobPostingEligibility(eligibleJob), {
  eligible: true,
  reasons: [],
});
for (const [overrides, reason] of [
  [{ issueState: "closed" }, "closed"],
  [{ freshness: { status: "stale" } }, "stale"],
  [{ title: "Job" }, "missing-title"],
  [{ description: "Short" }, "missing-description"],
  [{ companyName: undefined }, "missing-organization"],
  [{ jobLocation: undefined, dataProvenance: { ...eligibleJob.dataProvenance, location: "unknown", workModel: "unknown" } }, "missing-location"],
  [{ description: "A complete visible description about this role, team, responsibilities, and qualifications without any application instructions or external link." }, "missing-application-path"],
]) {
  assert.equal(
    jobPosting.evaluateJobPostingEligibility({ ...eligibleJob, ...overrides }).reasons.includes(reason),
    true,
    reason,
  );
}
const jsonLd = jobPosting.buildJobPostingJsonLd(eligibleJob);
assert.equal(jsonLd["@type"], "JobPosting");
assert.equal(jsonLd.hiringOrganization.name, "Acme");
assert.equal(jsonLd.jobLocation.address.addressCountry, "BR");
assert.equal("baseSalary" in jsonLd, false);
assert.equal("validThrough" in jsonLd, false);
assert.doesNotMatch(jobPosting.serializeJobPostingJsonLd({ unsafe: "</script>" }), /<\/script>/u);
const jobPageSource = await readFile("app/jobs/[id]/page.tsx", "utf8");
assert.match(jobPageSource, /application\/ld\+json/u);
assert.match(jobPageSource, /serializeJobPostingJsonLd/u);

const atomSource = await readFile("lib/feeds/atom.ts", "utf8");
const atom = await import(dataModule(atomSource));
const entries = Array.from({ length: 55 }, (_, index) => ({
  id: `https://openings.dev/jobs/${index}`,
  url: `https://openings.dev/jobs/${index}`,
  title: `Role <${index}> & team`,
  updated: new Date(Date.UTC(2026, 7, 31, 0, 0, 55 - index)).toISOString(),
  published: "2026-08-01T00:00:00.000Z",
  summary: `Summary "${index}" > details`,
}));
const xml = atom.serializeAtomFeed({
  id: "https://openings.dev/feed.xml",
  title: "Openings & jobs",
  subtitle: "Recent <jobs>",
  selfUrl: "https://openings.dev/feed.xml",
  siteUrl: "https://openings.dev/",
  updated: "2026-09-01T00:00:00.000Z",
  entries,
});
assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/u);
assert.equal((xml.match(/<entry>/gu) ?? []).length, 50);
assert.match(xml, /Openings &amp; jobs/u);
assert.match(xml, /Role &lt;0&gt; &amp; team/u);
assert.doesNotMatch(xml, /<jobs>|Summary "0"/u);
assert.throws(() => atom.serializeAtomFeed({
  id: "https://openings.dev/feed.xml", title: "Bad", subtitle: "Bad",
  selfUrl: "https://openings.dev/feed.xml", siteUrl: "https://openings.dev/",
  updated: "invalid", entries: [],
}));
const [recentFeedSource, updatesFeedSource, presetFeedSource, layoutSource] = await Promise.all([
  readFile("app/feed.xml/route.ts", "utf8"),
  readFile("app/updates.xml/route.ts", "utf8"),
  readFile("app/feeds/[slug]/route.ts", "utf8"),
  readFile("app/layout.tsx", "utf8"),
]);
for (const source of [recentFeedSource, updatesFeedSource, presetFeedSource]) {
  assert.match(source, /application\/atom\+xml/u);
  assert.match(source, /export async function GET/u);
}
assert.match(presetFeedSource, /generateStaticParams/u);
assert.match(presetFeedSource, /JOB_FEED_SLUGS/u);
assert.match(presetFeedSource, /slug:\s*`\$\{slug\}\.xml`/u);
assert.match(layoutSource, /"application\/atom\+xml"/u);

const curatedSource = await readFile("lib/discovery/curated-pages.ts", "utf8");
const curated = await import(dataModule(curatedSource));
assert.equal(curated.CURATED_DISCOVERY_PRESETS.length, 6);
for (const preset of curated.CURATED_DISCOVERY_PRESETS) {
  assert.equal(Object.keys(preset.copy).sort().join(","), "de,en,es,fr,it,pt");
  for (const content of Object.values(preset.copy)) {
    for (const field of ["title", "description", "explanation", "cta", "empty"]) {
      assert.equal(typeof content[field] === "string" && content[field].trim().length > 0, true);
    }
  }
  assert.equal(preset.feedSlug, preset.slug);
}
const [alternatesSource, curatedPageSource, localeSyncSource, shortcutsSource] = await Promise.all([
  readFile("lib/metadata/localized-alternates.ts", "utf8"),
  readFile("app/[locale]/discover/[slug]/page.tsx", "utf8"),
  readFile("app/[locale]/discover/[slug]/_components/locale-route-sync.tsx", "utf8"),
  readFile("app/opportunities/_components/opportunities-screen/opportunities-quick-filters/discovery-shortcuts/index.tsx", "utf8"),
]);
assert.match(alternatesSource, /"x-default"/u);
assert.match(alternatesSource, /AVAILABLE_LOCALES/u);
assert.match(curatedPageSource, /generateStaticParams/u);
assert.match(curatedPageSource, /listStaticOpportunities/u);
assert.match(curatedPageSource, /slice\(0, 20\)/u);
assert.match(curatedPageSource, /localizedAlternates/u);
assert.match(curatedPageSource, /application\/atom\+xml/u);
assert.match(localeSyncSource, /setStoredLocale/u);
assert.doesNotMatch(localeSyncSource, /redirect|geolocation/iu);
assert.match(shortcutsSource, /\/discover\//u);

const similarSource = await readFile("lib/opportunities/similar.ts", "utf8");
const similar = await import(dataModule(similarSource));
const currentJob = {
  id: "current", issueState: "open", url: "https://github.com/a/1",
  createdAt: "2026-09-01T00:00:00.000Z",
  taxonomy: { technologies: ["react", "typescript"], areas: ["frontend"], workModels: ["remote"], seniority: ["senior"], employmentTypes: ["full-time"] },
  jobLocation: { countryCode: "BR" }, freshness: { status: "fresh" },
};
const candidates = [
  { ...currentJob, id: "best", url: "https://github.com/b/2", createdAt: "2026-08-31T00:00:00.000Z" },
  { ...currentJob, id: "duplicate-url", createdAt: "2026-09-02T00:00:00.000Z" },
  { ...currentJob, id: "closed", url: "https://github.com/c/3", issueState: "closed" },
  { ...currentJob, id: "technology-only", url: "https://github.com/d/4", taxonomy: { technologies: ["react"], areas: [], workModels: [], seniority: [], employmentTypes: [] } },
  { ...currentJob, id: "none", url: "https://github.com/e/5", taxonomy: { technologies: [], areas: [], workModels: [], seniority: [], employmentTypes: [] }, jobLocation: {}, freshness: { status: "aging" } },
];
assert.deepEqual(
  similar.findSimilarOpportunities(currentJob, candidates, 4).map((item) => item.id),
  ["best", "technology-only"],
);
assert.equal(similar.scoreSimilarOpportunity(currentJob, candidates[0]), 24);
const [similarApiSource, similarComponentSource] = await Promise.all([
  readFile("lib/opportunities/api.ts", "utf8"),
  readFile("app/opportunities/_components/opportunity-details/similar-opportunities/index.tsx", "utf8"),
]);
assert.match(similarApiSource, /loadOpportunityFacetIndex/u);
assert.match(similarApiSource, /fetchSimilarOpportunities/u);
assert.doesNotMatch(similarApiSource, /loadOpportunityItems\(await loadOpportunityJobIds/u);
assert.match(similarComponentSource, /buildOpportunityPath/u);
assert.match(similarComponentSource, /item\.freshness/u);
assert.match(jobPageSource, /fetchSimilarOpportunities/u);

const socialTextSource = await readFile("lib/metadata/sanitize-social-text.ts", "utf8");
const socialText = await import(dataModule(socialTextSource));
assert.equal(
  socialText.sanitizeSocialText("QuestDB \b salary\nremote"),
  "QuestDB salary remote",
);
assert.doesNotMatch(socialText.sanitizeSocialText("A\u007fB\u0085C"), /[\u0000-\u001f\u007f-\u009f]/u);

const shareUrlSource = await readFile(
  "app/opportunities/_components/opportunities-screen/share-discovery/share-url.ts",
  "utf8",
);
const shareUrl = await import(dataModule(shareUrlSource));
const shared = shareUrl.buildShareableDiscoveryUrl(
  "https://openings.dev/?technologies=react,typescript&technologyMatch=all&country=all&job=private-id&saved=true&new=true&page=1&utm_source=test&savedIds=a,b",
  ["technologies", "technologyMatch", "country", "job", "saved", "new", "page"],
  { selectedKey: "job", localOnlyKeys: ["saved", "new"] },
);
assert.equal(shared, "https://openings.dev/?technologies=react%2Ctypescript&technologyMatch=all");
const shareComponentSource = await readFile(
  "app/opportunities/_components/opportunities-screen/share-discovery/index.tsx",
  "utf8",
);
assert.match(shareComponentSource, /navigator\.share/u);
assert.match(shareComponentSource, /clipboard\.writeText/u);
assert.doesNotMatch(shareComponentSource, /utm_/iu);
const toolbarSource = await readFile(
  "app/opportunities/_components/opportunities-screen/opportunities-toolbar/index.tsx",
  "utf8",
);
assert.match(toolbarSource, /<ShareDiscovery/u);

const newForYouVisibilitySource = await readFile(
  "app/opportunities/_components/opportunities-screen/new-for-you/visibility.ts",
  "utf8",
);
const newForYouVisibility = await import(dataModule(newForYouVisibilitySource));
const returningCandidate = {
  hasForcedScope: false,
  previousVisitAt: "2026-08-31T12:00:00.000Z",
  hasPersistedPreferences: true,
  newOnly: false,
  dismissed: false,
};
assert.equal(newForYouVisibility.shouldShowNewForYou(returningCandidate), true);
for (const overrides of [
  { hasForcedScope: true },
  { previousVisitAt: null },
  { previousVisitAt: "invalid" },
  { hasPersistedPreferences: false },
  { newOnly: true },
  { dismissed: true },
]) {
  assert.equal(
    newForYouVisibility.shouldShowNewForYou({ ...returningCandidate, ...overrides }),
    false,
  );
}
const newForYouSource = await readFile(
  "app/opportunities/_components/opportunities-screen/new-for-you/index.tsx",
  "utf8",
);
assert.match(newForYouSource, /previousVisitAt/u);
assert.match(newForYouSource, /hasPersistedPreferences/u);
assert.match(newForYouSource, /onShowNew/u);
assert.match(newForYouSource, /localNote/u);

console.log("Organic growth surface contracts are valid.");
