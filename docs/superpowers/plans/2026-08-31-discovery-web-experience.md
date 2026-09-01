# Discovery Web Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consume the structured discovery API and deliver ranked search, controlled filters, local candidate tools, public status, comparison, and support reporting.

**Architecture:** Keep remote parsing and ranking in `lib/opportunities`, URL-owned discovery state in the opportunities controller, and browser-local conveniences behind small versioned client adapters. All new routes remain statically exportable and all visible copy is complete in six typed dictionaries.

**Tech Stack:** Next.js 16.2 static export, React 19, strict TypeScript, Tailwind CSS 4, native validation scripts.

---

### Task 1: Structured opportunity and artifact contracts

**Files:**
- Modify: `lib/opportunities/types.ts`
- Modify: `lib/opportunities/api-types.ts`
- Modify: `lib/opportunities/static-artifact-validation.ts`
- Modify: `lib/opportunities/static-artifacts.ts`
- Modify: `lib/opportunities/static-api.ts`
- Create: `tooling/validate-discovery-artifacts.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add a failing artifact validation fixture script**

The script imports the production validation boundary and verifies that schema 6 accepts structured location, taxonomy, sources, freshness, aliases, weighted search, and status while rejecting dangling aliases and invalid status enums.

```js
assert.equal(isStaticManifest(validManifest), true);
assert.equal(isStaticManifest({ ...validManifest, schemaVersion: 5 }), false);
assert.equal(isCommunityStatus({ ...status, items: [{ status: "unknown" }] }), false);
```

- [ ] **Step 2: Run the script and verify failure**

Run: `npm run test:discovery`

Expected: FAIL because the script or new types do not exist.

- [ ] **Step 3: Add explicit domain contracts**

```ts
export interface OpportunityJobLocation {
  country?: string;
  countryCode?: string;
  region?: string;
  subdivision?: string;
  city?: string;
  workModel?: OpportunityWorkModel;
  remoteScope?: OpportunityRemoteScope;
  displayText?: string;
  confidence: OpportunityLocationConfidence;
}

export interface OpportunityTaxonomy {
  areas: OpportunityArea[];
  technologies: string[];
  seniority: OpportunitySeniority[];
  employmentTypes: OpportunityEmploymentType[];
  workModels: OpportunityWorkModel[];
  languages: string[];
}
```

Add `sourceLocation`, `jobLocation`, `sourceTags`, `taxonomy`, `sources`, `deduplication`, and `freshness` to `OpportunityItem`. Keep legacy fields during migration.

- [ ] **Step 4: Load aliases, weighted search, and status artifacts through existing URL/version recovery**

Expose named functions `loadOpportunityAliases`, `loadOpportunitySearchIndex`, and `loadCommunityStatus` without React dependencies.

- [ ] **Step 5: Run validation and commit**

Run: `npm run test:discovery && npm run lint`

```bash
git add lib/opportunities tooling/validate-discovery-artifacts.mjs package.json
git commit -m "feat: support structured discovery artifacts"
```

### Task 2: Ranked search and structured filter semantics

**Files:**
- Create: `lib/opportunities/search-ranking.ts`
- Create: `lib/opportunities/search-aliases.ts`
- Modify: `lib/opportunities/index-operations.ts`
- Modify: `lib/opportunities/api.ts`
- Modify: `lib/opportunities/api-types.ts`
- Modify: `app/opportunities/_components/opportunities-screen/types.ts`
- Modify: `app/opportunities/_components/opportunities-screen/controller/server-filters.ts`
- Modify: `app/opportunities/_components/opportunities-screen/controller/url-filters.ts`
- Create: `tooling/validate-search-ranking.mjs`

- [ ] **Step 1: Write failing deterministic ranking cases**

Cover exact title, company, technology alias, unordered multi-token queries, accented text, conservative typo tolerance, and stable ID tie-breakers.

```js
assert.deepEqual(rank("recat senior", items).map(({ id }) => id), ["react-senior"]);
assert.ok(score(titleMatch) > score(excerptMatch));
```

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-search-ranking.mjs`

- [ ] **Step 3: Implement token scoring and controlled fuzzy matching**

Use field weights `title: 10`, `company: 8`, `taxonomy: 7`, `location: 5`, `excerpt: 2`, `source: 1`. Require every query token to match an exact/alias token or an edit-distance-one token of length at least five.

- [ ] **Step 4: Add filter fields**

Add `dateWindow`, `salaryDisclosed`, `workModels`, `areas`, `technologies`, `seniority`, `employmentTypes`, `languages`, and `technologyMatch: any | all`. Add stable URL keys and validation defaults.

- [ ] **Step 5: Make relevance the active-search default while retaining explicit sort choices**

`OpportunitySortOrder` gains `relevance`, `updated`, and `salary`; relevance normalizes back to recent when the search becomes empty.

- [ ] **Step 6: Run validation and commit**

Run: `node tooling/validate-search-ranking.mjs && npm run test:discovery && npm run lint`

```bash
git add lib/opportunities app/opportunities/_components/opportunities-screen tooling/validate-search-ranking.mjs
git commit -m "feat: rank structured opportunity search"
```

### Task 3: Structured quick and advanced filters

**Files:**
- Modify: `app/opportunities/_components/opportunities-screen/controller/build-filter-options.ts`
- Modify: `app/opportunities/_components/opportunities-screen/controller/filtering.ts`
- Modify: `app/opportunities/_components/opportunities-screen/controller/active-filters.ts`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-quick-filters/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-filters/filter-taxonomy-group/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-filters/filter-display-group/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-filters/index.tsx`
- Create: `app/opportunities/_components/opportunities-screen/opportunities-filters/filter-freshness-group/index.tsx`
- Create: `app/opportunities/_components/opportunities-screen/opportunities-filters/filter-employment-group/index.tsx`

- [ ] **Step 1: Replace raw `Other tags` with controlled groups**

Quick controls remain search, job country, technologies, and advanced filters. Advanced controls add work model, role area, seniority, employment type, language, date window, salary disclosed, source repository, and author.

- [ ] **Step 2: Add Any/All technology semantics**

```ts
const matchesTechnologies = filters.technologyMatch === TechnologyMatchMode.All
  ? filters.technologies.every((value) => item.taxonomy.technologies.includes(value))
  : filters.technologies.some((value) => item.taxonomy.technologies.includes(value));
```

- [ ] **Step 3: Add 7/30/90-day and salary-disclosed controls**

Use generated freshness age rather than the browser clock to keep static results deterministic.

- [ ] **Step 4: Remove results-per-page from display filters**

Keep view mode and sort only. Remove `perPage` from new URLs while continuing to parse old URLs safely.

- [ ] **Step 5: Run lint and commit**

Run: `npm run lint`

```bash
git add app/opportunities/_components/opportunities-screen
git commit -m "feat: add structured opportunity filters"
```

### Task 4: Explicit load-more behavior

**Files:**
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-list/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-list/list-footer/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/types.ts`
- Modify: `app/opportunities/_components/opportunities-screen/controller/defaults.ts`
- Modify: `app/opportunities/_components/opportunities-screen/controller/use-derived-opportunities.ts`

- [ ] **Step 1: Remove `IntersectionObserver` automatic loading**

The list never fetches because the footer becomes visible.

- [ ] **Step 2: Render an explicit accessible action**

```tsx
<Button type="button" disabled={isFetchingMore} onClick={onLoadMore}>
  {isFetchingMore ? loadingMoreLabel : loadMoreLabel}
</Button>
```

Restore focus to the first newly appended result after keyboard activation and keep the page count in the URL.

- [ ] **Step 3: Fix the batch at 20 and remove per-page state from active filters**

- [ ] **Step 4: Run lint and commit**

Run: `npm run lint`

```bash
git add app/opportunities/_components/opportunities-screen
git commit -m "feat: add explicit opportunity loading"
```

### Task 5: Discovery presets and global initial scope

**Files:**
- Create: `app/_components/discovery-shortcuts/index.tsx`
- Modify: `app/page.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/controller/defaults.ts`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`

- [ ] **Step 1: Change the unparameterized default country to `all`**

Profile routes retain their forced scope.

- [ ] **Step 2: Add six URL-backed preset links**

Remote, Internship, React, Data & AI, DevOps, and Salary disclosed must use the same query keys as filters and scroll to `#opportunity-results`.

- [ ] **Step 3: Complete all dictionaries and run lint**

Run: `npm run lint`

- [ ] **Step 4: Commit**

```bash
git add app/_components/discovery-shortcuts app/page.tsx app/opportunities/_components/opportunities-screen/controller/defaults.ts lib/translations
git commit -m "feat: add discovery shortcuts"
```

### Task 6: Versioned browser-local candidate state

**Files:**
- Create: `lib/opportunities/local-candidate-state.ts`
- Create: `app/opportunities/_hooks/use-local-candidate-state.ts`
- Create: `tooling/validate-local-candidate-state.mjs`
- Modify: `package.json`
- Modify: `app/opportunities/_components/opportunities-screen/controller/use-opportunities-screen-controller.ts`

- [ ] **Step 1: Write storage migration and corruption tests**

```js
assert.deepEqual(parseCandidateState("not json"), EMPTY_CANDIDATE_STATE);
assert.deepEqual(migrateCandidateState({ version: 1, favorites: ["a"] }).saved.a.id, "a");
```

- [ ] **Step 2: Implement a versioned adapter**

Store saved IDs/timestamps, viewed IDs/timestamps, `lastVisitAt`, and preferences for country, work models, technologies, and seniority. Catch read/write exceptions and keep an in-memory session fallback.

- [ ] **Step 3: Apply preference precedence**

URL parameters override preferences. Preferences restore only on an unparameterized discovery route. Changing a supported filter persists it; `Reset preferences` clears preferences but not saved jobs.

- [ ] **Step 4: Run validation and commit**

Run: `node tooling/validate-local-candidate-state.mjs && npm run lint`

```bash
git add lib/opportunities/local-candidate-state.ts app/opportunities/_hooks app/opportunities/_components/opportunities-screen/controller/use-opportunities-screen-controller.ts tooling/validate-local-candidate-state.mjs package.json
git commit -m "feat: persist local candidate discovery state"
```

### Task 7: Saved, viewed, and new opportunity UI

**Files:**
- Create: `app/opportunities/_components/opportunities-screen/saved-jobs-filter/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunity-card/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunity-card/opportunity-card-header/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunity-drawer/drawer-action/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-quick-filters/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/types.ts`
- Modify: `lib/translations/*.ts`

- [ ] **Step 1: Add save/unsave actions to cards and details**

Actions have visible labels or accessible names, stop card propagation, and announce state changes.

- [ ] **Step 2: Mark viewed and new opportunities**

Opening a job records its viewed timestamp. A job created after the prior `lastVisitAt` shows a localized `New` badge until viewed. `lastVisitAt` advances after initial discovery state is captured, not before newness is calculated.

- [ ] **Step 3: Add Saved and New quick filters**

Empty saved state explains that saved jobs remain only in the current browser.

- [ ] **Step 4: Complete six dictionaries, run lint, and commit**

Run: `npm run lint`

```bash
git add app/opportunities lib/translations
git commit -m "feat: add saved and new job tools"
```

### Task 8: Community activity states and public status page

**Files:**
- Modify: `lib/opportunities/types.ts`
- Modify: `lib/opportunities/communities.ts`
- Create: `lib/opportunities/community-status.ts`
- Create: `app/status/page.tsx`
- Create: `app/status/_components/status-screen/index.tsx`
- Create: `app/status/_components/status-table/index.tsx`
- Modify: `app/community/_components/communities-screen/index.tsx`
- Modify: `app/community/_components/communities-screen/types.ts`
- Modify: `lib/navigation/routes.ts`
- Modify: `components/header/index.tsx`
- Modify: `components/footer/index.tsx`
- Modify: `lib/translations/*.ts`

- [ ] **Step 1: Add Active, No openings, With errors, and All directory filters**

Default to Active. Preserve text, geography, and sort controls.

- [ ] **Step 2: Build the static `/status` route**

Load `api/status.json` at build time and render summary cards plus a searchable/sortable client table with Community, Status, Last successful sync, Open jobs, and Latest posting.

- [ ] **Step 3: Add responsive row composition and safe failure state**

Mobile rows use visible `<dt>/<dd>` labels. A source load failure says status is temporarily unavailable and does not report all communities as failed.

- [ ] **Step 4: Add shell links and complete dictionaries**

- [ ] **Step 5: Run lint and commit**

Run: `npm run lint`

```bash
git add lib/opportunities app/status app/community lib/navigation components/header components/footer lib/translations
git commit -m "feat: add public community status"
```

### Task 9: Shareable comparison

**Files:**
- Create: `lib/opportunities/comparison.ts`
- Create: `tooling/validate-comparison.mjs`
- Create: `app/compare/page.tsx`
- Create: `app/compare/_components/comparison-screen/index.tsx`
- Create: `app/opportunities/_components/opportunities-screen/comparison-tray/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunity-card/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-screen-content/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/types.ts`
- Modify: `lib/translations/*.ts`

- [ ] **Step 1: Write comparison URL parsing tests**

Validate deduplication, max-three enforcement, invalid IDs, stable serialization, and partial availability.

- [ ] **Step 2: Add compare toggles and persistent tray**

The tray appears after one selection, lists selected titles, allows removal/clear, and enables `Compare` at two or three selections.

- [ ] **Step 3: Build `/compare?jobs=id,id`**

Compare title, company/community, salary, real location, work model, technologies, seniority, freshness, publication date, and sources. Display `Not supplied` for absent values.

- [ ] **Step 4: Complete dictionaries, run validation, and commit**

Run: `node tooling/validate-comparison.mjs && npm run lint`

```bash
git add lib/opportunities/comparison.ts tooling/validate-comparison.mjs app/compare app/opportunities lib/translations
git commit -m "feat: compare opportunities"
```

### Task 10: Support email reporting

**Files:**
- Create: `lib/opportunities/report-problem.ts`
- Create: `tooling/validate-report-problem.mjs`
- Modify: `app/opportunities/_components/opportunities-screen/opportunity-drawer/drawer-action/index.tsx`
- Modify: `app/opportunities/_components/opportunity-details/index.tsx`
- Modify: `lib/navigation/routes.ts`
- Modify: `lib/translations/*.ts`

- [ ] **Step 1: Write mailto generation tests**

Assert recipient `support@openings.dev`, encoded localized subject/body, canonical job URL, primary source URL, and the four categories without injecting newline headers.

- [ ] **Step 2: Implement `buildOpportunityReportMailto`**

Use `URLSearchParams` encoding and strip CR/LF from subject inputs.

- [ ] **Step 3: Add `Report a problem` to dialog and canonical detail actions**

The action opens the user's mail client and does not imply an internal ticket was created.

- [ ] **Step 4: Run tests and commit**

Run: `node tooling/validate-report-problem.mjs && npm run lint`

```bash
git add lib/opportunities/report-problem.ts tooling/validate-report-problem.mjs app/opportunities lib/navigation lib/translations
git commit -m "feat: add support email reporting"
```

### Task 11: Cross-feature verification and documentation

**Files:**
- Modify: `.knowledge/project_overview.md`
- Modify: `.knowledge/architecture/remote_data_flow.md`
- Modify: `.knowledge/architecture/state_management.md`
- Modify: `.knowledge/design_system/experience_patterns.md`
- Modify: `README.md`

- [ ] **Step 1: Document schema 6, status, canonical grouping, and local-only state**

State explicitly that saved jobs/preferences do not sync across devices and that unknown job locations remain unknown.

- [ ] **Step 2: Run every focused validator**

Run: `npm run test:discovery && node tooling/validate-search-ranking.mjs && node tooling/validate-local-candidate-state.mjs && node tooling/validate-comparison.mjs && node tooling/validate-report-problem.mjs`

Expected: PASS.

- [ ] **Step 3: Run repository validation**

Run: `npm run lint && npm run build`

Expected: PASS and static routes include `/status` and `/compare`.

- [ ] **Step 4: Inspect exported desktop and mobile behavior**

Verify filter wrapping, explicit loading focus, save/compare controls, status rows, and mailto content in both themes.

- [ ] **Step 5: Commit**

```bash
git add .knowledge README.md
git commit -m "docs: describe discovery platform features"
```
