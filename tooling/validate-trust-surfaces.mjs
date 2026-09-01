import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

function transpile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

function dataModule(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

async function loadValidationModules() {
  const enumsSource = await readFile("lib/opportunities/enums.ts", "utf8");
  const enumsUrl = dataModule(transpile(enumsSource));
  const artifactSource = await readFile(
    "lib/opportunities/static-artifact-validation.ts",
    "utf8",
  );
  const artifactUrl = dataModule(
    transpile(artifactSource).replace('from "./enums"', `from "${enumsUrl}"`),
  );
  const discoverySource = await readFile(
    "lib/opportunities/discovery-artifact-validation.ts",
    "utf8",
  );
  return {
    artifact: await import(artifactUrl),
    discovery: await import(dataModule(transpile(discoverySource))),
  };
}

function facets() {
  return Object.fromEntries([
    "repositories", "regions", "countries", "tags", "authors", "authorLabels",
    "jobCountries", "jobRegions", "workModels", "areas", "technologies",
    "seniority", "employmentTypes", "languages", "freshness", "salaryDisclosed",
  ].map((key) => [key, {}]));
}

function manifest(statusHistory) {
  return {
    schemaVersion: 6,
    generatedAt: "2026-09-01T12:00:00.000Z",
    dataHash: "a".repeat(64),
    pageSize: 24,
    totals: {
      openOpportunities: 1,
      pages: 1,
      repositories: 1,
      countries: 1,
      regions: 1,
      communities: 1,
    },
    files: {
      facets: "api/facets.json",
      pageLookup: "api/page-lookup.json",
      search: "api/search.json",
      jobIds: "api/job-ids.json",
      order: "api/order.json",
      communities: "api/communities.json",
      aliases: "api/aliases.json",
      status: "api/status.json",
      ...(statusHistory === undefined ? {} : { statusHistory }),
    },
    facets: facets(),
    pages: [{ page: 1, file: "api/pages/1.json", count: 1 }],
  };
}

const validHistory = {
  generatedAt: "2026-09-01T12:00:00.000Z",
  retentionDays: 30,
  runs: [
    {
      startedAt: "2026-09-01T11:59:00.000Z",
      completedAt: "2026-09-01T12:00:00.000Z",
      durationMs: 60_000,
      outcome: "healthy",
      communities: 2,
      successful: 2,
      failed: 0,
      noOpenings: 1,
      openOpportunities: 5,
    },
    {
      startedAt: "2026-08-31T11:59:00.000Z",
      completedAt: "2026-08-31T12:00:00.000Z",
      durationMs: 60_000,
      outcome: "partial",
      communities: 2,
      successful: 1,
      failed: 1,
      noOpenings: 0,
      openOpportunities: 4,
    },
  ],
  days: [
    {
      date: "2026-09-01",
      runs: 1,
      partialRuns: 0,
      failedCommunityRuns: 0,
      latestOpenOpportunities: 5,
    },
    {
      date: "2026-08-31",
      runs: 1,
      partialRuns: 1,
      failedCommunityRuns: 1,
      latestOpenOpportunities: 4,
    },
  ],
};

const { artifact, discovery } = await loadValidationModules();
assert.equal(typeof discovery.parseStaticCommunityStatusHistory, "function");
assert.doesNotThrow(() => artifact.parseStaticOpportunityManifest(manifest(), "manifest"));
assert.doesNotThrow(() => artifact.parseStaticOpportunityManifest(
  manifest("api/status-history.json"),
  "manifest",
));
assert.throws(() => artifact.parseStaticOpportunityManifest(manifest(""), "manifest"));
assert.throws(() => artifact.parseStaticOpportunityManifest(
  manifest("api/status.json"),
  "manifest",
));
assert.deepEqual(
  discovery.parseStaticCommunityStatusHistory(validHistory, "status-history"),
  validHistory,
);

for (const invalidHistory of [
  { ...validHistory, runs: [{ ...validHistory.runs[0], failed: -1 }] },
  { ...validHistory, runs: [{ ...validHistory.runs[0], outcome: "failed" }] },
  { ...validHistory, runs: [...validHistory.runs].reverse() },
  { ...validHistory, runs: [validHistory.runs[0], validHistory.runs[0]] },
  {
    ...validHistory,
    runs: [{
      ...validHistory.runs[0],
      startedAt: "2026-07-31T11:59:00.000Z",
      completedAt: "2026-07-31T12:00:00.000Z",
    }],
  },
  { ...validHistory, error: "private provider failure" },
  { ...validHistory, runs: [{ ...validHistory.runs[0], message: "private" }] },
]) {
  assert.throws(() =>
    discovery.parseStaticCommunityStatusHistory(invalidHistory, "status-history"));
}

const [typesSource, apiTypesSource] = await Promise.all([
  readFile("lib/opportunities/types.ts", "utf8"),
  readFile("lib/opportunities/api-types.ts", "utf8"),
]);
assert.match(typesSource, /dataProvenance\?:\s*OpportunityDataProvenance/u);
assert.match(apiTypesSource, /statusHistory\?:\s*string/u);

const [historyComponentSource, statusPageSource] = await Promise.all([
  readFile("app/status/_components/status-history/index.tsx", "utf8"),
  readFile("app/status/page.tsx", "utf8"),
]);
assert.match(historyComponentSource, /Array\.from\(\{ length: 30 \}/u);
assert.match(historyComponentSource, /aria-label=/u);
assert.match(historyComponentSource, /history\.runs\.slice\(0, 12\)/u);
assert.match(historyComponentSource, /partialRuns/u);
assert.match(statusPageSource, /getCommunityStatusBundle/u);
for (const locale of ["en", "pt", "es", "it", "fr", "de"]) {
  const translationSource = await readFile(`lib/translations/${locale}.ts`, "utf8");
  assert.match(translationSource, /history:\s*\{/u);
  assert.match(translationSource, /recurring:/u);
  assert.match(translationSource, /isolated:/u);
}

const trustSource = await readFile("lib/opportunities/trust.ts", "utf8");
const trust = await import(dataModule(transpile(trustSource)));
const trustItem = {
  repository: "community/one",
  freshness: { status: "stale" },
  dataProvenance: {
    location: "unknown",
    salary: "unknown",
    seniority: "inferred",
    workModel: "declared",
  },
  sources: [
    { repository: "community/one" },
    { repository: "community/two" },
  ],
};
const trustStatus = {
  items: [
    { repository: "community/one", lastSuccessfulSyncAt: "2026-08-30T12:00:00.000Z" },
    { repository: "community/two", lastSuccessfulSyncAt: "2026-09-01T12:00:00.000Z" },
    { repository: "unrelated/latest", lastSuccessfulSyncAt: "2026-09-02T12:00:00.000Z" },
  ],
};
assert.deepEqual(trust.buildOpportunityTrustSummary(trustItem, trustStatus), {
  lastVerifiedAt: "2026-09-01T12:00:00.000Z",
  sourceCount: 2,
  fields: [
    { field: "location", provenance: "unknown" },
    { field: "salary", provenance: "unknown" },
    { field: "seniority", provenance: "inferred" },
    { field: "workModel", provenance: "declared" },
  ],
  stale: true,
  incomplete: true,
});
assert.equal(
  trust.buildOpportunityTrustSummary(trustItem, {
    items: trustStatus.items.filter((item) => item.repository !== "community/two"),
  }).lastVerifiedAt,
  null,
);
assert.deepEqual(
  trust.buildOpportunityTrustSummary({ repository: "community/one" }, trustStatus),
  {
    lastVerifiedAt: "2026-08-30T12:00:00.000Z",
    sourceCount: 1,
    fields: [
      { field: "location", provenance: "unknown" },
      { field: "salary", provenance: "unknown" },
      { field: "seniority", provenance: "unknown" },
      { field: "workModel", provenance: "unknown" },
    ],
    stale: false,
    incomplete: false,
  },
);

const [confidenceSource, detailsSource, jobPageSource] = await Promise.all([
  readFile(
    "app/opportunities/_components/opportunity-details/data-confidence/index.tsx",
    "utf8",
  ),
  readFile("app/opportunities/_components/opportunity-details/index.tsx", "utf8"),
  readFile("app/jobs/[id]/page.tsx", "utf8"),
]);
assert.match(confidenceSource, /lastVerifiedAt/u);
assert.match(confidenceSource, /dataProvenance|summary\.fields/u);
assert.match(confidenceSource, /source\.url/u);
assert.match(confidenceSource, /originalAuthority/u);
assert.match(detailsSource, /buildOpportunityTrustSummary/u);
assert.match(detailsSource, /<DataConfidence/u);
assert.match(jobPageSource, /getCommunityStatus/u);
assert.match(jobPageSource, /buildOpportunityTrustSummary/u);
for (const locale of ["en", "pt", "es", "it", "fr", "de"]) {
  const translationSource = await readFile(`lib/translations/${locale}.ts`, "utf8");
  assert.match(translationSource, /dataConfidence:\s*\{/u);
  assert.match(translationSource, /originalAuthority:/u);
}

const [updatesContentSource, updatesValidationSource] = await Promise.all([
  readFile("lib/updates/content.ts", "utf8"),
  readFile("lib/updates/validation.ts", "utf8"),
]);
const updatesContent = await import(dataModule(transpile(updatesContentSource)));
const updatesValidation = await import(dataModule(transpile(updatesValidationSource)));
assert.doesNotThrow(() => updatesValidation.validateUpdateEntries(updatesContent.UPDATE_ENTRIES));
assert.equal(updatesContent.UPDATE_ENTRIES.some((entry) => entry.kind === "changelog"), true);
assert.equal(updatesContent.UPDATE_ENTRIES.some((entry) => entry.kind === "release"), true);
assert.deepEqual(
  updatesContent.UPDATE_ENTRIES
    .filter((entry) => entry.kind === "roadmap")
    .map((entry) => entry.lane),
  ["now", "next", "later"],
);
const baseUpdate = updatesContent.UPDATE_ENTRIES[0];
for (const invalidEntries of [
  [{ ...baseUpdate, id: "Invalid ID" }],
  [baseUpdate, { ...baseUpdate }],
  [{ ...baseUpdate, date: "09/01/2026" }],
  [{ ...baseUpdate, copy: { en: baseUpdate.copy.en } }],
  [{ ...baseUpdate, href: "javascript:alert(1)" }],
  [{ ...baseUpdate, kind: "roadmap", lane: "now", date: "2026-09-01" }],
  [{ ...baseUpdate, kind: "release", version: "v1", date: "2026-09-01" }],
]) {
  assert.throws(() => updatesValidation.validateUpdateEntries(invalidEntries));
}

const [updatesPageSource, updatesScreenSource, updatesTelemetrySource,
  routesSource, footerSource] = await Promise.all([
  readFile("app/updates/page.tsx", "utf8"),
  readFile("app/updates/_components/updates-screen/index.tsx", "utf8"),
  readFile("app/updates/_components/updates-telemetry.tsx", "utf8"),
  readFile("lib/navigation/routes.ts", "utf8"),
  readFile("components/footer/index.tsx", "utf8"),
]);
assert.match(updatesPageSource, /UPDATE_ENTRIES/u);
assert.match(updatesScreenSource, /id="changelog"/u);
assert.match(updatesScreenSource, /id="releases"/u);
assert.match(updatesScreenSource, /id="roadmap"/u);
assert.match(updatesTelemetrySource, /trackProductEvent\("Updates Viewed"/u);
assert.match(updatesTelemetrySource, /hashchange/u);
assert.match(routesSource, /updates:\s*"\/updates"/u);
assert.match(footerSource, /PUBLIC_ROUTES\.updates/u);

const methodologyPaths = [
  "METHODOLOGY.md",
  "docs/methodology/METHODOLOGY.pt.md",
  "docs/methodology/METHODOLOGY.es.md",
  "docs/methodology/METHODOLOGY.it.md",
  "docs/methodology/METHODOLOGY.fr.md",
  "docs/methodology/METHODOLOGY.de.md",
];
const methodologyDocuments = await Promise.all(
  methodologyPaths.map((path) => readFile(path, "utf8")),
);
for (const document of methodologyDocuments) {
  assert.equal((document.match(/^## /gmu) ?? []).length, 12);
  assert.match(document, /support@openings\.dev/u);
  assert.match(document, /Sentry/u);
  assert.match(document, /Mixpanel/u);
}
assert.match(methodologyDocuments[0], /every three hours/iu);
assert.match(methodologyDocuments[0], /original GitHub issue is authoritative/iu);
const [documentTypesSource, documentConfigSource, methodologyPageSource] = await Promise.all([
  readFile("lib/content/document-types.ts", "utf8"),
  readFile("lib/content/document-config.ts", "utf8"),
  readFile("app/methodology/page.tsx", "utf8"),
]);
assert.match(documentTypesSource, /Methodology\s*=\s*"methodology"/u);
assert.match(documentConfigSource, /METHODOLOGY\.md/u);
assert.match(methodologyPageSource, /ProjectDocumentKey\.Methodology/u);
assert.match(routesSource, /methodology:\s*"\/methodology"/u);
assert.equal(
  footerSource.indexOf("PUBLIC_ROUTES.updates") <
    footerSource.indexOf("PUBLIC_ROUTES.methodology"),
  true,
);
assert.equal(
  footerSource.indexOf("PUBLIC_ROUTES.methodology") <
    footerSource.indexOf("PUBLIC_ROUTES.privacy"),
  true,
);

console.log("Public trust surface contracts are valid.");
