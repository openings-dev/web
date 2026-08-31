# Sponsored Data Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish only approved `openings-dev/jobs` issues as sponsored opportunities and expose a validated schema-v5 promotions index.

**Architecture:** Optional catalog flags drive label-gated collection and one structured Issue Form parser. Sponsored metadata is carried on opportunity records. Static output orders sponsored records before organic records and publishes an explicit promotions index for frontend sorting.

**Tech Stack:** Node.js ES modules, GitHub REST API, JSON static artifacts, Node test runner

---

### Task 1: Add label-gated collection

**Files:**
- Create: `test/sponsored-collection.test.mjs`
- Modify: `src/modules/catalog/catalog-repository.mjs`
- Modify: `src/modules/github/github-client.mjs`
- Modify: `src/modules/build/process-repository.mjs`

- [ ] **Step 1: Write failing tests**

Test that `processRepository` passes `requiredLabels` to the GitHub client and defensively excludes returned issues without every required label. Test that invalid non-array `requiredLabels` catalog data throws.

```js
const sponsoredRepository = {
  repository: "openings-dev/jobs",
  owner: "openings-dev",
  url: "https://github.com/openings-dev/jobs",
  country: "Global",
  countryCode: "GLOBAL",
  region: "Global",
  requiredLabels: ["sponsored"],
  promotionType: "sponsored",
};
const issue = (number, labels) => ({
  id: number,
  number,
  title: `Role ${number}`,
  body: "Role description",
  state: "open",
  html_url: `https://github.com/openings-dev/jobs/issues/${number}`,
  created_at: "2026-08-31T00:00:00.000Z",
  updated_at: "2026-08-31T00:00:00.000Z",
  labels: labels.map((name) => ({ name })),
  user: { login: "employer", avatar_url: "https://github.com/employer.png" },
});
const approvedIssue = issue(1, ["sponsored"]);
const requestIssue = issue(2, ["ad-request"]);

test("processRepository maps only issues with every required label", async () => {
  const githubClient = {
    async fetchRecentIssues(repository, labels) {
      assert.equal(repository, "openings-dev/jobs");
      assert.deepEqual(labels, ["sponsored"]);
      return [approvedIssue, requestIssue];
    },
  };
  const result = await processRepository({
    repository: sponsoredRepository,
    githubClient,
  });
  assert.deepEqual(result.items.map((item) => item.sourceId), ["openings-dev/jobs#1"]);
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test test/sponsored-collection.test.mjs`

Expected: FAIL because required labels are not passed or enforced.

- [ ] **Step 3: Implement optional required-label validation and filtering**

The GitHub client signature becomes `fetchRecentIssues(repositoryFullName, requiredLabels = [])` and adds `labels=<comma-separated>` when present. `processRepository` checks normalized issue label names again before mapping.

- [ ] **Step 4: Run tests and commit**

Run: `node --test test/sponsored-collection.test.mjs && npm test`

Expected: all tests pass.

Commit: `feat: gate sponsored issues by approval label`

### Task 2: Parse the sponsored Issue Form and map promotion metadata

**Files:**
- Create: `src/modules/opportunities/sponsored-issue-metadata.mjs`
- Create: `test/sponsored-opportunity-mapper.test.mjs`
- Modify: `src/modules/opportunities/opportunity-mapper.mjs`

- [ ] **Step 1: Write failing parser and mapper tests**

Use the GitHub Issue Form body headings `### Company`, `### Country`, `### Region`, `### Location details`, `### Work model`, `### Seniority`, and `### Stack`. Assert that the mapper overrides repository geography, sets company name, adds normalized tag values, and emits:

```js
promotion: { type: "sponsored" }
```

Also assert that ordinary repositories omit `promotion` and preserve existing mapping.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test test/sponsored-opportunity-mapper.test.mjs`

Expected: FAIL because the parser and promotion mapping do not exist.

- [ ] **Step 3: Implement a focused heading parser**

Export `parseSponsoredIssueMetadata(body)` and `applySponsoredIssueMetadata(opportunity, issue, repository)`. Normalize blank or `_No response_` values to absent data. Split stack on commas and combine it with work model and seniority using a stable unique list.

- [ ] **Step 4: Integrate through catalog flags**

When `issueMetadataFormat === "openings-sponsored-job-v1"`, apply structured metadata. When `promotionType === "sponsored"`, attach the promotion record. Unknown configuration is rejected by catalog validation.

- [ ] **Step 5: Run tests and commit**

Run: `node --test test/sponsored-opportunity-mapper.test.mjs && npm test`

Expected: all tests pass.

Commit: `feat: map sponsored job metadata`

### Task 3: Publish schema-v5 promotion artifacts and stable ordering

**Files:**
- Create: `src/modules/snapshot/static-api/promotions.mjs`
- Create: `test/sponsored-static-api.test.mjs`
- Modify: `src/modules/snapshot/static-api/paths.mjs`
- Modify: `src/modules/snapshot/static-api/build-static-api-files.mjs`
- Modify: `src/modules/opportunities/opportunity-mapper.mjs`

- [ ] **Step 1: Write failing static API tests**

Build with one recent organic item, one older sponsored item, and one newer sponsored item. Assert page and order IDs are both sponsored first and date-descending within the sponsored group. Assert:

```js
manifest.schemaVersion === 5
manifest.totals.sponsoredOpportunities === 2
manifest.files.promotions === "api/promotions.json"
promotions.ids === [olderSponsored.id, newerSponsored.id].sort(/* canonical recent order */)
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --test test/sponsored-static-api.test.mjs`

Expected: FAIL on schema version, ordering, and missing promotions file.

- [ ] **Step 3: Implement the shared recent comparator**

Update `sortOpportunitiesByDate` to compare sponsored state first, created date descending second, and ID ascending last. Keep the function immutable.

- [ ] **Step 4: Build the promotions artifact and manifest fields**

Publish `{ generatedAt, ids }` at `api/promotions.json`, include the file in the manifest hash, add `totals.sponsoredOpportunities`, and advance `schemaVersion` to `5`.

- [ ] **Step 5: Run tests and commit**

Run: `node --test test/sponsored-static-api.test.mjs && npm test`

Expected: all tests pass.

Commit: `feat: publish sponsored opportunity index`

### Task 4: Add the Openings jobs catalog source

**Files:**
- Modify: `src/modules/catalog/repositories.json`
- Modify: `test/static-api-communities.test.mjs`

- [ ] **Step 1: Add a failing catalog assertion**

Assert the `openings-dev/jobs` entry contains the exact required labels, issue format, and promotion type.

- [ ] **Step 2: Add the catalog entry**

Use Global geography and the exact configuration from the design specification. Do not include `sponsored` in `queryHints` or general search keywords.

- [ ] **Step 3: Run full validation**

Run: `npm run validate`

Expected: all Node tests and repository validation checks pass.

- [ ] **Step 4: Commit**

Commit: `feat: add Openings sponsored jobs source`
