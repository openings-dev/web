# Sponsored Opportunities Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the global 30-day advertiser banner, validate promotion data, disclose sponsored jobs, and preserve sponsored-first ordering under every filter and date direction.

**Architecture:** A shared AppShell component owns the normal-flow advertiser banner. The opportunity domain gains an optional enum-backed promotion record and a promotions-index artifact. One pure comparator is reused by remote API ordering and client-side filtering, while UI components only render disclosure from the typed domain record.

**Tech Stack:** Next.js 16 App Router static export, React 19, TypeScript, Tailwind CSS 4, Node validation scripts

---

### Task 1: Extend and validate the schema-v5 opportunity contract

**Files:**
- Modify: `lib/opportunities/enums.ts`
- Modify: `lib/opportunities/types.ts`
- Modify: `lib/opportunities/api-types.ts`
- Modify: `lib/opportunities/static-artifact-validation.ts`
- Modify: `lib/opportunities/static-artifacts.ts`
- Create: `tooling/validate-sponsored-opportunities.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing validation script**

The script imports artifact parsers and asserts that schema 5 accepts `promotion: { type: "sponsored" }`, rejects unknown promotion types, accepts organic records without promotion, and validates a unique promotions ID artifact.

- [ ] **Step 2: Run it and confirm failure**

Run: `npm run test:sponsored`

Expected: FAIL because the script or new schema types do not exist.

- [ ] **Step 3: Add the domain contract**

Define `OpportunityPromotionType.Sponsored = "sponsored"` and:

```ts
export interface OpportunityPromotion {
  type: OpportunityPromotionType;
}

export interface OpportunityItem {
  // existing fields
  promotion?: OpportunityPromotion;
}
```

Advance the manifest schema to 5, add `totals.sponsoredOpportunities`, add `files.promotions`, and type the promotions artifact as `{ generatedAt: string; ids: string[] }`.

- [ ] **Step 4: Validate promotion artifacts and cache them**

Add a strict parser and `loadOpportunityPromotions(manifest)` beside order loading. Include the promotions artifact in consistency checks and cache invalidation.

- [ ] **Step 5: Run checks and commit**

Run: `npm run test:sponsored && npm run lint`

Expected: both pass.

Commit: `feat: support sponsored opportunity artifacts`

### Task 2: Preserve sponsored-first sorting under all filters

**Files:**
- Create: `lib/opportunities/sort-opportunities.ts`
- Modify: `lib/opportunities/api.ts`
- Modify: `app/opportunities/_components/opportunities-screen/controller/filtering.ts`
- Extend: `tooling/validate-sponsored-opportunities.mjs`

- [ ] **Step 1: Add failing comparator assertions**

Assert that sponsored records remain before organic records for both recent and oldest modes, dates sort in the selected direction inside each group, and IDs break equal-date ties.

- [ ] **Step 2: Implement the pure comparator**

Export `compareOpportunities(left, right, sortOrder)` and `sortOpportunityIdsByPromotion(ids, sponsoredIds, sortOrder)`. Do not mutate input arrays.

- [ ] **Step 3: Integrate server and client sorting**

The static API loads the promotions set and partitions filtered IDs before pagination. Client filtering uses `compareOpportunities` after applying filters. Sponsored priority must not bypass filter matching.

- [ ] **Step 4: Run checks and commit**

Run: `npm run test:sponsored && npm run lint`

Expected: all sponsored sorting assertions and lint pass.

Commit: `feat: prioritize sponsored matching jobs`

### Task 3: Add the localized global advertiser banner

**Files:**
- Create: `components/sponsored-opportunities-banner/index.tsx`
- Modify: `app/_components/app-shell/index.tsx`
- Modify: `lib/navigation/routes.ts`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`
- Extend: `tooling/validate-sponsored-opportunities.mjs`

- [ ] **Step 1: Add failing source assertions**

Assert the route equals `https://github.com/openings-dev/jobs/issues/new?template=sponsored-job.yml`, AppShell renders the banner between Header and main, and all dictionary files contain `sponsorship.banner.message`, `detail`, and `action`.

- [ ] **Step 2: Implement the server-safe shared banner**

Use `Megaphone` and `ExternalLink`, a mint normal-flow section, one concise message, `30 days` detail, and a dark pill action. The component may use `useI18n` but owns no local state or effects.

- [ ] **Step 3: Add six natural translations**

Portuguese uses `Faça sua vaga chegar primeiro.`, `Destaque por 30 dias no Openings.`, and `Anunciar uma vaga`. Other locales preserve the same factual meaning without literal awkwardness.

- [ ] **Step 4: Run checks and commit**

Run: `npm run test:sponsored && npm run lint`

Expected: dictionary and placement assertions pass; lint passes.

Commit: `feat: add sponsored jobs banner`

### Task 4: Disclose sponsorship on cards and details

**Files:**
- Create: `app/opportunities/_components/opportunities-screen/sponsored-badge/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunity-card/index.tsx`
- Modify: `app/opportunities/_components/opportunity-details/index.tsx`
- Modify: `lib/translations/types.ts`
- Modify: all six `lib/translations/*.ts` dictionaries
- Extend: `tooling/validate-sponsored-opportunities.mjs`

- [ ] **Step 1: Add failing disclosure assertions**

Assert the card and shared details component render `SponsoredBadge` only from `item.promotion?.type === Sponsored`, and all locales expose a sponsored label and explanation.

- [ ] **Step 2: Implement the badge**

Render visible localized text with a compact mint background and accessible dark foreground. The badge is not interactive and does not rely on color alone.

- [ ] **Step 3: Place disclosure without changing information hierarchy**

Put the badge before the card title and near the source context in shared job details. Retain the current card trigger, focus contract, and dialog behavior.

- [ ] **Step 4: Run checks and commit**

Run: `npm run test:sponsored && npm run lint`

Expected: disclosure assertions and lint pass.

Commit: `feat: disclose sponsored job placements`

### Task 5: Export and visually verify the full experience

**Files:**
- Modify only files required by fixes found during verification

- [ ] **Step 1: Run all repository validation**

Run:

```bash
npm run lint
npm run test:sponsored
npm run test:job-header
npm run test:metadata
npm run test:communities
npm run build
```

Expected: every command exits 0 and the static export completes.

- [ ] **Step 2: Inspect responsive routes**

Run the local app with Node 24 and inspect `/`, `/communities`, `/docs`, and a sponsored `/jobs/<id>` fixture served through a temporary local static-artifact override. Verify desktop/mobile and light/dark banner composition, card disclosure, focus, and details disclosure.

- [ ] **Step 3: Commit verification fixes**

Commit only if verification required source changes, using `fix: polish sponsored opportunity experience`.
