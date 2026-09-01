# Public Trust and Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make data quality, synchronization history, shipped changes, releases, and future intentions understandable from the public site.

**Architecture:** The web application consumes the additive provenance and status-history contracts produced by the data pipeline. Product updates live as typed, localized, versioned content in the web repository; `/status` remains operational and `/updates` remains editorial. Trust surfaces reuse current static loaders and never fetch GitHub or vendor APIs at runtime.

**Tech Stack:** Next.js 16.2 static export, React 19, strict TypeScript, Tailwind CSS 4, public schema-6 JSON artifacts, repository-backed Markdown and typed content.

---

## File map

- `lib/opportunities/api-types.ts`: optional status-history contract and manifest pointer.
- `lib/opportunities/types.ts`: optional field-provenance contract.
- `lib/opportunities/discovery-artifact-validation.ts`: strict additive parsing.
- `lib/opportunities/static-artifacts.ts`: versioned status-history loader.
- `lib/opportunities/status.ts`: current plus historical status facade.
- `lib/opportunities/trust.ts`: derives per-job verification and confidence labels.
- `app/status/_components/status-history/index.tsx`: recent runs and 30-day daily summary.
- `app/status/_components/status-screen/index.tsx`: integrates operational history.
- `app/opportunities/_components/opportunity-details/data-confidence/index.tsx`: provenance UI.
- `app/opportunities/_components/opportunity-details/index.tsx`: trust section placement.
- `app/jobs/[id]/page.tsx`: supplies verification derived from community status.
- `lib/updates/types.ts`: discriminated changelog/release/roadmap types.
- `lib/updates/content.ts`: stable localized update entries.
- `lib/updates/validation.ts`: content completeness and state rules.
- `app/updates/page.tsx`: metadata and static page.
- `app/updates/_components/updates-screen/index.tsx`: section navigation and cards.
- `METHODOLOGY.md` and `docs/methodology/*`: six public methodology documents.
- `app/methodology/page.tsx`: methodology route.
- `lib/content/*`, `lib/navigation/routes.ts`, footer and translations: navigation and localization.
- `tooling/validate-trust-surfaces.mjs`: deterministic contract/content assertions.

### Task 1: Consume additive provenance and status history

**Files:**
- Modify: `lib/opportunities/api-types.ts`
- Modify: `lib/opportunities/types.ts`
- Modify: `lib/opportunities/discovery-artifact-validation.ts`
- Modify: `lib/opportunities/static-artifacts.ts`
- Modify: `lib/opportunities/status.ts`
- Create: `tooling/validate-trust-surfaces.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing valid, invalid, and compatibility fixtures**

Assert schema 6 manifests both with and without optional
`files.statusHistory`; validate the new artifact shape; reject negative counts,
invalid outcomes, unsorted/duplicate run timestamps, more than 30-day-old runs,
and raw `error`/`message` keys.

```ts
export interface OpportunityDataProvenance {
  location: "declared" | "inferred" | "unknown";
  salary: "declared" | "inferred" | "unknown";
  seniority: "declared" | "inferred" | "unknown";
  workModel: "declared" | "inferred" | "unknown";
}

export interface StaticStatusHistoryRun {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  outcome: "healthy" | "partial";
  communities: number;
  successful: number;
  failed: number;
  noOpenings: number;
  openOpportunities: number;
}
```

- [ ] **Step 2: Run the new validator and verify failure**

Run: `node tooling/validate-trust-surfaces.mjs`

Expected: FAIL because the types and parser are absent.

- [ ] **Step 3: Add optional compatibility types**

Add `dataProvenance?: OpportunityDataProvenance` to `OpportunityItem` and
`statusHistory?: string` to `StaticManifest.files`. Define
`StaticStatusHistory` with `generatedAt`, `retentionDays: 30`, `runs`, and
daily aggregates. Optional fields keep the web deploy compatible with the
previous pipeline snapshot.

- [ ] **Step 4: Add the versioned loader**

Add a `STATUS_HISTORY_CACHE`, parser, and
`loadCommunityStatusHistory(manifest)`. `getCommunityStatusBundle()` loads
current status and returns `history: null` when the manifest pointer is absent
or the optional artifact fails, without hiding valid current status.

- [ ] **Step 5: Validate and commit**

Run: `node tooling/validate-trust-surfaces.mjs && npm run test:discovery && npm run lint`

Add `"test:trust": "node tooling/validate-trust-surfaces.mjs"` to package
scripts before committing.

```bash
git add lib/opportunities tooling/validate-trust-surfaces.mjs package.json
git commit -m "feat: consume trust and sync history contracts"
```

### Task 2: Add compact synchronization history to Status

**Files:**
- Create: `app/status/_components/status-history/index.tsx`
- Modify: `app/status/_components/status-screen/index.tsx`
- Modify: `app/status/page.tsx`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`
- Modify: `tooling/validate-trust-surfaces.mjs`

- [ ] **Step 1: Add typed status-history copy**

Add labels for last 30 days, published runs, healthy, partial, duration,
communities synchronized, failed communities, open jobs, no history, isolated
failure, and recurring failures in all dictionaries.

- [ ] **Step 2: Render recent run health**

Show the latest 12 published runs as a semantic list. Each row contains the
completion time, `healthy`/`partial` badge, duration, successful/total sources,
failed source count, and open jobs. Do not render raw failure details.

- [ ] **Step 3: Render the daily summary without a chart dependency**

Use a 30-column CSS grid of proportional bars with text accessible names. The
visible bar represents `partialRuns / runs`; the adjacent summary reports days
with partial syncs and total failed-community occurrences. When history is
missing, render a neutral compatibility message and retain the current table.

- [ ] **Step 4: Distinguish isolated from recurring partial syncs**

If the last run is partial and the previous two are healthy, label it isolated.
If two or more of the last three are partial, label it recurring. This is a
display interpretation, not a new public status enum.

- [ ] **Step 5: Validate and commit**

Run: `node tooling/validate-trust-surfaces.mjs && npm run lint`

```bash
git add app/status lib/translations tooling/validate-trust-surfaces.mjs
git commit -m "feat: show synchronization history"
```

### Task 3: Add job-level provenance and verification

**Files:**
- Create: `lib/opportunities/trust.ts`
- Create: `app/opportunities/_components/opportunity-details/data-confidence/index.tsx`
- Modify: `app/opportunities/_components/opportunity-details/types.ts`
- Modify: `app/opportunities/_components/opportunity-details/index.tsx`
- Modify: `app/jobs/[id]/page.tsx`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`
- Modify: `tooling/validate-trust-surfaces.mjs`

- [ ] **Step 1: Write failing trust-summary cases**

```ts
export interface OpportunityTrustSummary {
  lastVerifiedAt: string | null;
  sourceCount: number;
  fields: Array<{
    field: "location" | "salary" | "seniority" | "workModel";
    provenance: "declared" | "inferred" | "unknown";
  }>;
  stale: boolean;
  incomplete: boolean;
}
```

Assert `lastVerifiedAt` is the newest `lastSuccessfulSyncAt` among the job's
actual `sources[].repository`, never the global snapshot date. An unavailable
repository status yields `null`. Unknown location/salary plus stale freshness
sets `incomplete`.

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-trust-surfaces.mjs`

- [ ] **Step 3: Implement the pure summary builder**

`buildOpportunityTrustSummary(item, status)` uses the pipeline provenance when
present and otherwise returns `unknown`; it never infers declared status in the
browser. For legacy items, source count falls back to one and verification
uses the primary repository's status only.

- [ ] **Step 4: Pass verification into the detail page**

`app/jobs/[id]/page.tsx` loads opportunity and current status together through
the existing cached loaders. The detail component receives the derived summary
as a prop. Drawer mode derives a summary without status and displays
`verification unavailable` rather than the global generated date.

- [ ] **Step 5: Render the data-confidence section**

Place it after metadata and before the report/original actions. Show last
verification, original publication, source count and links, and four labeled
field states. `declared` uses a positive-neutral tone, `inferred` informational,
and `unknown` muted. Explain that the original listing remains authoritative.
Keep stale/incomplete warnings visible without blocking the outbound action.

- [ ] **Step 6: Validate and commit**

Run: `node tooling/validate-trust-surfaces.mjs && npm run test:job-header && npm run test:report && npm run lint`

```bash
git add app/jobs app/opportunities/_components/opportunity-details lib/opportunities/trust.ts lib/translations tooling/validate-trust-surfaces.mjs
git commit -m "feat: explain opportunity data confidence"
```

### Task 4: Define typed localized update content

**Files:**
- Create: `lib/updates/types.ts`
- Create: `lib/updates/content.ts`
- Create: `lib/updates/validation.ts`
- Modify: `tooling/validate-trust-surfaces.mjs`

- [ ] **Step 1: Add failing content rules**

Require stable kebab-case IDs, six locales, unique IDs, valid ISO dates for
changelog/releases, calendar versions matching `YYYY.MM`, roadmap lane without a date,
and safe internal or HTTPS links.

```ts
export type UpdateKind = "changelog" | "release" | "roadmap";
export type RoadmapLane = "now" | "next" | "later";
export type UpdateCategory = "discovery" | "data" | "trust" | "operations" | "growth";

export interface LocalizedUpdateCopy { title: string; summary: string }
export interface UpdateEntry {
  id: string;
  kind: UpdateKind;
  category: UpdateCategory;
  date?: string;
  version?: string;
  lane?: RoadmapLane;
  href?: string;
  copy: Record<LocaleCode, LocalizedUpdateCopy>;
}
```

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-trust-surfaces.mjs`

- [ ] **Step 3: Add truthful initial content**

Create changelog entries for the discovery platform release and this trust
program only after their respective features pass verification. Add release
`2026.09` summarizing structured discovery and public status. Seed the roadmap
with:

- Now: improve source coverage and field confidence;
- Next: normalize salary comparison and expand curated discovery;
- Later: local application tracking and a community-contribution workflow.

Translate each title and summary idiomatically into English, Portuguese,
Spanish, Italian, French, and German. Do not place delivery dates on roadmap
items or describe unshipped work as released.

- [ ] **Step 4: Validate and commit**

Run: `node tooling/validate-trust-surfaces.mjs && npm run lint`

```bash
git add lib/updates tooling/validate-trust-surfaces.mjs
git commit -m "feat: define public product updates"
```

### Task 5: Build `/updates` and navigation

**Files:**
- Create: `app/updates/page.tsx`
- Create: `app/updates/_components/updates-screen/index.tsx`
- Create: `app/updates/_components/update-card/index.tsx`
- Modify: `lib/navigation/routes.ts`
- Modify: `components/footer/index.tsx`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`
- Modify: `tooling/validate-trust-surfaces.mjs`

- [ ] **Step 1: Add page and navigation copy**

Add localized title, description, tabs, empty states, categories, roadmap lanes,
date/version labels, section navigation label, and footer link.

- [ ] **Step 2: Implement one page with three sections**

Use links `#changelog`, `#releases`, and `#roadmap` as the primary navigation;
all content remains in the document for crawling and no client state is needed
to reveal it. Each section has a heading and list; roadmap groups entries by
Now/Next/Later. Dates use the active locale and UTC.

- [ ] **Step 3: Add telemetry without a vendor import**

A tiny client child observes the current hash and calls
`trackProductEvent("Updates Viewed", { section })` once per section per page
visit. Without consent it is a no-op.

- [ ] **Step 4: Add route and footer link**

Add `PUBLIC_ROUTES.updates = "/updates"`. Place Updates next to Status in the
project footer group. Keep the primary header uncluttered at this stage.

- [ ] **Step 5: Validate and commit**

Run: `node tooling/validate-trust-surfaces.mjs && npm run lint`

```bash
git add app/updates components/footer lib/navigation/routes.ts lib/translations tooling/validate-trust-surfaces.mjs
git commit -m "feat: add public updates hub"
```

### Task 6: Publish methodology in six languages

**Files:**
- Create: `METHODOLOGY.md`
- Create: `docs/methodology/METHODOLOGY.pt.md`
- Create: `docs/methodology/METHODOLOGY.es.md`
- Create: `docs/methodology/METHODOLOGY.it.md`
- Create: `docs/methodology/METHODOLOGY.fr.md`
- Create: `docs/methodology/METHODOLOGY.de.md`
- Create: `app/methodology/page.tsx`
- Modify: `lib/content/document-types.ts`
- Modify: `lib/content/document-config.ts`
- Modify: `lib/navigation/routes.ts`
- Modify: `components/footer/index.tsx`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`
- Modify: `tooling/validate-trust-surfaces.mjs`

- [ ] **Step 1: Write the English methodology**

Cover source eligibility, three-hour sync cadence, issue-state handling,
source/job geography separation, taxonomy, duplicate grouping, freshness,
provenance definitions, sponsorship, current limitations, support corrections,
Sentry, and consented Mixpanel. State that the original issue is authoritative.

- [ ] **Step 2: Translate the complete document**

Create Portuguese, Spanish, Italian, French, and German files with identical
section structure and accurate technical meaning. Keep product names,
repository names, field enums, and email addresses unchanged.

- [ ] **Step 3: Register the document route**

Add `ProjectDocumentKey.Methodology`, its document config, localized document
messages, `/methodology`, and a permanent footer link between Updates and
Privacy.

- [ ] **Step 4: Validate and commit**

Run: `node tooling/validate-trust-surfaces.mjs && npm run lint`

```bash
git add METHODOLOGY.md docs/methodology app/methodology lib/content lib/navigation/routes.ts components/footer lib/translations tooling/validate-trust-surfaces.mjs
git commit -m "docs: publish data methodology"
```

### Task 7: Complete static and visual verification

- [ ] **Step 1: Run all deterministic checks**

Run: `npm run test:discovery`

Run: `node tooling/validate-trust-surfaces.mjs`

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 2: Build against the matching pipeline snapshot**

From `data-pipeline/snapshots/opportunities`, start:

`python3 -m http.server 8765 --bind 127.0.0.1`

From the web worktree, run:

`OPENINGS_DATA_BASE_URL=http://127.0.0.1:8765 npm run build`

Expected: `/status`, `/updates`, `/methodology`, job pages, and all social-image
routes export successfully.

- [ ] **Step 3: Inspect responsive and assistive behavior**

Check `/status`, `/updates`, `/methodology`, and a declared/inferred/unknown job
at 375, 768, and 1440 CSS pixels. Verify headings, hash focus, keyboard order,
screen-reader labels, no horizontal overflow, no color-only status, and
readable dark/light themes.

- [ ] **Step 4: Commit only necessary visual corrections**

```bash
git add app components lib tooling
git commit -m "fix: polish public trust surfaces"
```
