# Trust Data Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the TinTin and Prime Leo sources, publish trustworthy field provenance, and retain 30 days of safe synchronization history.

**Architecture:** The data pipeline remains the only owner of source metadata, location inference, provenance, and sync-history generation. New opportunity fields and `api/status-history.json` are additive to schema 6 so the currently deployed web application can continue consuming snapshots while the trust UI is developed separately.

**Tech Stack:** Node.js 20+ ESM, native `node:test`, deterministic JSON artifacts, GitHub Actions.

---

## File map

- `src/modules/catalog/repositories.json`: source-of-truth entries for both communities.
- `src/modules/opportunities/location-country.mjs`: Nigeria aliases used only by explicit location extraction.
- `src/modules/opportunities/data-provenance.mjs`: maps extraction evidence to `declared`, `inferred`, or `unknown`.
- `src/modules/opportunities/opportunity-mapper.mjs`: attaches source-level provenance before deduplication.
- `src/modules/opportunities/canonical-opportunity.mjs`: merges provenance conservatively across duplicates.
- `src/modules/snapshot/static-api/status-history.mjs`: appends, prunes, and aggregates published sync runs.
- `src/modules/snapshot/static-api/paths.mjs`: owns the new artifact path.
- `src/modules/snapshot/static-api/build-static-api-files.mjs`: builds history beside current status.
- `src/modules/snapshot/static-api/manifest.mjs`: advertises and hashes history.
- `src/modules/snapshot/prepare-segmented-snapshot.mjs`: passes prior history and run timing into the builder.
- `src/app/run-build.mjs`: reads prior history and records start/completion timing.
- `test/catalog-sources.test.mjs`: exact catalog contract for the new sources.
- `test/job-location.test.mjs`: Nigeria and false-positive cases.
- `test/data-provenance.test.mjs`: declared/inferred/unknown and duplicate merge cases.
- `test/status-history.test.mjs`: append, prune, aggregation, and partial-run cases.
- `test/discovery-static-api.test.mjs`: manifest and artifact consistency.

### Task 1: Add the two label-free sources

**Files:**
- Modify: `src/modules/catalog/repositories.json`
- Create: `test/catalog-sources.test.mjs`

- [ ] **Step 1: Write the failing catalog test**

Read the real catalog with `readRepositoryCatalog` and assert these exact public
contracts:

```js
const EXPECTED = {
  "OurTinTinLand/TinTin-Job-Board": {
    country: "China",
    countryCode: "CN",
    region: "Asia",
    locale: "zh-CN",
    scope: "national",
  },
  "Prime-Leo-Enterprises/Jobs": {
    country: "Global",
    countryCode: "GLOBAL",
    region: "Global",
    locale: "en",
    scope: "global",
  },
};

for (const [repository, expected] of Object.entries(EXPECTED)) {
  const entry = catalog.repositories.find((item) => item.repository === repository);
  assert.ok(entry, `${repository} must be cataloged`);
  assert.deepEqual(
    Object.fromEntries(Object.keys(expected).map((key) => [key, entry[key]])),
    expected,
  );
  assert.equal(entry.requiredLabels, undefined);
}
```

In the same test, pass a representative label-free Issue from each repository
through `mapIssueToOpportunity`:

```js
const primeLeoRepository = catalog.repositories.find(
  (item) => item.repository === "Prime-Leo-Enterprises/Jobs",
);
const tintinRepository = catalog.repositories.find(
  (item) => item.repository === "OurTinTinLand/TinTin-Job-Board",
);
assert.ok(primeLeoRepository);
assert.ok(tintinRepository);

const primeLeo = mapIssueToOpportunity({
  id: 1,
  number: 1,
  title: "Hiring a Fractional CTO for Next-Gen Supply Chain Platform in Africa",
  body: "Location: Remote — Nigeria preferred",
  state: "open",
  html_url: "https://github.com/Prime-Leo-Enterprises/Jobs/issues/1",
  created_at: "2026-03-31T00:00:00.000Z",
  updated_at: "2026-03-31T00:00:00.000Z",
  labels: [],
  user: { login: "Prime-Leo-Enterprises", avatar_url: "" },
}, primeLeoRepository);
assert.equal(primeLeo.issueState, "open");
assert.equal(primeLeo.repository, "Prime-Leo-Enterprises/Jobs");

const tintin = mapIssueToOpportunity({
  id: 2,
  number: 87,
  title: "Senior Web3 Engineer",
  body: "Location: China\nRemote role in a blockchain team.",
  state: "open",
  html_url: "https://github.com/OurTinTinLand/TinTin-Job-Board/issues/87",
  created_at: "2026-08-01T00:00:00.000Z",
  updated_at: "2026-08-01T00:00:00.000Z",
  labels: [],
  user: { login: "OurTinTinLand", avatar_url: "" },
}, tintinRepository);
assert.equal(tintin.issueState, "open");
assert.equal(tintin.repository, "OurTinTinLand/TinTin-Job-Board");
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test test/catalog-sources.test.mjs`

Expected: FAIL because neither repository exists.

- [ ] **Step 3: Add the exact catalog entries**

Keep case-insensitive repository ordering and use these objects:

```json
{
  "repository": "OurTinTinLand/TinTin-Job-Board",
  "owner": "OurTinTinLand",
  "name": "TinTin-Job-Board",
  "url": "https://github.com/OurTinTinLand/TinTin-Job-Board",
  "country": "China",
  "countryCode": "CN",
  "region": "Asia",
  "locale": "zh-CN",
  "scope": "national",
  "source": "community-link",
  "queryHints": ["jobs", "web3", "blockchain", "opportunities"]
}
```

```json
{
  "repository": "Prime-Leo-Enterprises/Jobs",
  "owner": "Prime-Leo-Enterprises",
  "name": "Jobs",
  "url": "https://github.com/Prime-Leo-Enterprises/Jobs",
  "country": "Global",
  "countryCode": "GLOBAL",
  "region": "Global",
  "locale": "en",
  "scope": "global",
  "source": "community-link",
  "queryHints": ["jobs", "technology", "remote", "opportunities"]
}
```

- [ ] **Step 4: Run the focused and catalog-wide validation**

Run: `node --test test/catalog-sources.test.mjs test/static-api-communities.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the catalog addition**

```bash
git add src/modules/catalog/repositories.json test/catalog-sources.test.mjs
git commit -m "feat: add TinTin and Prime Leo job sources"
```

### Task 2: Recognize explicit Nigerian job locations

**Files:**
- Modify: `src/modules/opportunities/location-country.mjs`
- Modify: `test/job-location.test.mjs`

- [ ] **Step 1: Add failing positive and negative cases**

```js
test("recognizes an explicitly labeled Nigerian remote preference", () => {
  assert.deepEqual(extractJobLocation({
    title: "Fractional CTO",
    body: "Location: Remote — Nigeria preferred",
    sourceLocation: { country: "Global", countryCode: "GLOBAL", region: "Global" },
  }), {
    country: "Nigeria",
    countryCode: "NG",
    region: "Africa",
    workModel: "remote",
    remoteScope: "unspecified",
    displayText: "Nigeria · Remote",
    confidence: "explicit",
  });
});

test("does not turn incidental Nigerian market prose into a job location", () => {
  assert.deepEqual(extractJobLocation({
    title: "Platform Engineer",
    body: "Build software used by customers in Nigeria.",
    sourceLocation: { country: "Global", countryCode: "GLOBAL", region: "Global" },
  }), { confidence: "unknown" });
});
```

- [ ] **Step 2: Run the tests and verify the positive case fails**

Run: `node --test test/job-location.test.mjs`

Expected: FAIL because Nigeria is not canonicalized.

- [ ] **Step 3: Add the canonical alias**

Insert this entry in alphabetical country order:

```js
{ names: ["nigeria"], country: "Nigeria", countryCode: "NG", region: "Africa" },
```

Do not add the short token `ng`; two-letter codes are intentionally not parsed
from arbitrary prose.

- [ ] **Step 4: Run all location tests**

Run: `node --test test/job-location.test.mjs`

Expected: PASS, including the incidental-prose negative case.

- [ ] **Step 5: Commit the location support**

```bash
git add src/modules/opportunities/location-country.mjs test/job-location.test.mjs
git commit -m "feat: recognize explicit Nigerian job locations"
```

### Task 3: Publish conservative field provenance

**Files:**
- Create: `src/modules/opportunities/data-provenance.mjs`
- Modify: `src/modules/opportunities/opportunity-mapper.mjs`
- Modify: `src/modules/opportunities/normalize-discovery-opportunity.mjs`
- Modify: `src/modules/opportunities/canonical-opportunity.mjs`
- Create: `test/data-provenance.test.mjs`
- Modify: `test/discovery-static-api.test.mjs`

- [ ] **Step 1: Write failing provenance tests**

Use the public shape below and assert that absent values remain `unknown`,
sponsored structured fields are `declared`, parser-derived salary/seniority are
`inferred`, and a duplicate group keeps the strongest evidence.

```js
assert.deepEqual(buildDataProvenance({
  jobLocation: { confidence: "explicit", country: "Portugal" },
  salary: { currency: "EUR", min: 60000, period: "year" },
  taxonomy: { seniority: ["senior"], workModels: ["remote"] },
  declaredFields: new Set(["location", "workModel"]),
}), {
  location: "declared",
  salary: "inferred",
  seniority: "inferred",
  workModel: "declared",
});
```

- [ ] **Step 2: Run the test and verify the module is missing**

Run: `node --test test/data-provenance.test.mjs`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the provenance helper**

```js
const LEVEL = { unknown: 0, inferred: 1, declared: 2 };
const FIELDS = ["location", "salary", "seniority", "workModel"];

export function strongestProvenance(values) {
  return values.reduce(
    (best, value) => LEVEL[value] > LEVEL[best] ? value : best,
    "unknown",
  );
}

export function mergeDataProvenance(items) {
  return Object.fromEntries(FIELDS.map((field) => [
    field,
    strongestProvenance(items.map((item) => item.dataProvenance?.[field] ?? "unknown")),
  ]));
}
```

`buildDataProvenance` returns `declared` only when the value came from a
structured sponsored field or an explicit labeled/title location. Generic
taxonomy and salary parser matches are `inferred`. No present value is ever
upgraded from inferred to declared merely because two duplicates agree.

- [ ] **Step 4: Attach and merge the contract**

Add this public shape to every normalized opportunity:

```js
dataProvenance: {
  location: "declared" | "inferred" | "unknown",
  salary: "declared" | "inferred" | "unknown",
  seniority: "declared" | "inferred" | "unknown",
  workModel: "declared" | "inferred" | "unknown",
}
```

`canonicalOpportunity` must call `mergeDataProvenance(sorted)` after choosing
the canonical values.

- [ ] **Step 5: Run provenance, mapper, deduplication, and API tests**

Run: `node --test test/data-provenance.test.mjs test/job-location.test.mjs test/deduplicate-opportunities.test.mjs test/discovery-static-api.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the provenance contract**

```bash
git add src/modules/opportunities test/data-provenance.test.mjs test/discovery-static-api.test.mjs
git commit -m "feat: publish opportunity data provenance"
```

### Task 4: Build a bounded sync-history artifact

**Files:**
- Create: `src/modules/snapshot/static-api/status-history.mjs`
- Modify: `src/modules/snapshot/static-api/paths.mjs`
- Modify: `src/modules/snapshot/static-api/build-static-api-files.mjs`
- Modify: `src/modules/snapshot/static-api/manifest.mjs`
- Modify: `src/modules/snapshot/prepare-segmented-snapshot.mjs`
- Modify: `src/app/run-build.mjs`
- Create: `test/status-history.test.mjs`
- Modify: `test/discovery-static-api.test.mjs`

- [ ] **Step 1: Write failing append and prune tests**

The artifact contract is:

```js
{
  generatedAt: "2026-09-01T12:00:00.000Z",
  retentionDays: 30,
  runs: [{
    startedAt: "2026-09-01T11:58:00.000Z",
    completedAt: "2026-09-01T12:00:00.000Z",
    durationMs: 120000,
    outcome: "healthy",
    communities: 188,
    successful: 188,
    failed: 0,
    noOpenings: 72,
    openOpportunities: 760,
  }],
  days: [{
    date: "2026-09-01",
    runs: 1,
    partialRuns: 0,
    failedCommunityRuns: 0,
    latestOpenOpportunities: 760,
  }],
}
```

Assert chronological ordering, replacement of an identical `completedAt`, a
30-day cutoff relative to the new `completedAt`, and `partial` whenever
`failed > 0`.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test test/status-history.test.mjs`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement deterministic history building**

Export:

```js
export function buildStatusHistory({
  startedAt,
  completedAt,
  repositories,
  synchronizedRepositories,
  failedRepositories,
  status,
  openOpportunities,
  previousHistory,
})
```

Calculate `durationMs` from valid timestamps, derive successful counts from the
case-sensitive repository sets already used by the collector, keep only runs
whose `completedAt` is within 30 calendar days, sort newest first, and derive
daily aggregates from retained runs. Never copy raw `error` values.

- [ ] **Step 4: Publish and hash the artifact**

Add `staticApiStatusHistoryPath()` returning `api/status-history.json`. Add
`files.statusHistory` to the manifest and include `statusHistory.runs` in
`dataHash`. Read the previous file in `runBuild`, capture `startedAt` before
collection, and use the single final `generatedAt` value as `completedAt`.

- [ ] **Step 5: Run focused static-contract tests**

Run: `node --test test/status-history.test.mjs test/community-status.test.mjs test/discovery-static-api.test.mjs`

Expected: PASS and no serialized raw failure message.

- [ ] **Step 6: Commit the history artifact**

```bash
git add src/app/run-build.mjs src/modules/snapshot test/status-history.test.mjs test/discovery-static-api.test.mjs
git commit -m "feat: publish synchronization history"
```

### Task 5: Rebuild and validate the complete data snapshot

**Files:**
- Modify: `snapshots/opportunities/**`

- [ ] **Step 1: Run the complete source suite**

Run: `npm run validate`

Expected: every test and repository validator passes.

- [ ] **Step 2: Build a fresh authenticated snapshot**

Run: `npm run build:snapshot`

Expected: when `GITHUB_TOKEN` is already present in the execution environment,
authenticated collection is used; otherwise the existing unauthenticated
fallback remains active. Both new repositories appear in
`api/communities.json`; Prime Leo's current opportunity has Nigeria job
geography without changing source geography; `api/status-history.json` exists;
manifest schema remains 6.

- [ ] **Step 3: Validate the rebuilt snapshot**

Run: `npm run validate`

Expected: PASS with catalog totals increased by two and no raw provider error
inside public status artifacts.

- [ ] **Step 4: Commit generated artifacts separately**

```bash
git add snapshots/opportunities
git commit -m "chore(data): index new sources and trust metadata"
```
