# Organic and Recurring Growth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve qualified organic discovery and account-free return visits through crawlable metadata, eligible job structured data, feeds, curated localized pages, similar jobs, and shareable search states.

**Architecture:** Every acquisition surface is generated during the existing static build from the same validated opportunity artifacts and typed filters. Canonical job pages remain the only `JobPosting` leaves; arbitrary query results stay non-indexed. Locale-prefixed curated pages are the only new localized URL family, so `hreflang` is emitted only where reciprocal localized URLs actually exist.

**Tech Stack:** Next.js 16.2 static metadata routes and static GET route handlers, React 19, schema.org JSON-LD, XML sitemap, Atom 1.0, typed schema-6 opportunity data.

---

## File map

- `app/robots.ts`: public crawl policy and sitemap pointer.
- `app/sitemap.ts`: canonical static, profile, job, update, methodology, and curated URLs.
- `lib/metadata/localized-alternates.ts`: reciprocal locale URL map.
- `lib/metadata/job-posting.ts`: strict eligibility and JSON-LD builder.
- `app/jobs/[id]/page.tsx`: safe JSON-LD and similar-job section.
- `lib/feeds/atom.ts`: escaped deterministic Atom serialization.
- `lib/feeds/jobs.ts`: recent and preset feed selection.
- `app/feed.xml/route.ts`: recent jobs feed.
- `app/updates.xml/route.ts`: product updates feed.
- `app/feeds/[slug]/route.ts`: bounded preset feeds whose slug includes `.xml`.
- `lib/discovery/curated-pages.ts`: six stable filter presets and six-locale editorial copy.
- `app/[locale]/discover/[slug]/page.tsx`: localized crawlable discovery landing page.
- `app/[locale]/discover/[slug]/_components/locale-route-sync.tsx`: aligns client UI locale after hydration.
- `lib/opportunities/similar.ts`: deterministic similarity scoring.
- `app/opportunities/_components/opportunity-details/similar-opportunities/index.tsx`: related jobs.
- `app/opportunities/_components/opportunities-screen/share-discovery/index.tsx`: copy/share current supported URL.
- `tooling/validate-growth-surfaces.mjs`: metadata, XML, eligibility, locale, and static-output checks.

### Task 1: Publish crawl policy and a truthful canonical sitemap

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Create: `tooling/validate-growth-surfaces.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing sitemap contract**

Assert one canonical URL per open canonical job ID, no alias IDs, no query
strings, no `/community` or `/users` legacy URLs, unique absolute HTTPS URLs,
and valid `lastModified` values based on significant content timestamps.

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-growth-surfaces.mjs`

Expected: FAIL because robots and sitemap metadata routes do not exist.

- [ ] **Step 3: Add `robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/metadata/site-metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_ORIGIN).toString(),
    host: SITE_ORIGIN.toString(),
  };
}
```

- [ ] **Step 4: Build the sitemap from validated loaders**

Include `/`, `/communities`, canonical community pages, `/authors`, canonical
author pages, `/status`, `/updates`, `/methodology`, `/privacy`, `/terms`,
canonical job pages, and every curated locale/slug pair. Exclude comparison,
design-system, arbitrary filtered URLs, alias routes, feeds, and social images.

Static product pages use their release/content date; communities use
`lastPostedAt ?? generatedAt`; jobs use `updatedAt`; curated pages use the
newest matching job timestamp. Use `changeFrequency` and `priority` only as
stable hints, never current-clock values.

- [ ] **Step 5: Validate and commit**

Run: `node tooling/validate-growth-surfaces.mjs && npm run lint`

Add `"test:growth": "node tooling/validate-growth-surfaces.mjs"` to package
scripts before committing.

```bash
git add app/robots.ts app/sitemap.ts tooling/validate-growth-surfaces.mjs package.json
git commit -m "feat: publish crawl policy and sitemap"
```

### Task 2: Emit `JobPosting` only for eligible job pages

**Files:**
- Create: `lib/metadata/job-posting.ts`
- Modify: `app/jobs/[id]/page.tsx`
- Modify: `tooling/validate-growth-surfaces.mjs`

- [ ] **Step 1: Add failing eligibility fixtures**

Eligible fixtures require: open issue, non-stale freshness, job-only title,
complete visible description, parsed hiring organization, original posting
date, real job location or supported remote scope, and a direct application
instruction/link in the visible description. Reject missing company,
source-only geography, closed/stale records, generic titles, empty summaries,
and records whose only URL is the GitHub issue without application guidance.

```ts
export interface JobPostingEligibility {
  eligible: boolean;
  reasons: Array<
    | "closed"
    | "stale"
    | "missing-title"
    | "missing-description"
    | "missing-organization"
    | "missing-location"
    | "missing-application-path"
  >;
}
```

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-growth-surfaces.mjs`

- [ ] **Step 3: Implement conservative eligibility**

Use explicit structured fields only. `hasApplicationPath` accepts a visible
non-GitHub HTTPS application URL, an explicit application email, or a visible
section headed `Apply`, `How to apply`, `Candidatura`, `Aplicar`, `Postuler`,
`Candidarsi`, or `Bewerben`. It never treats the Openings.dev/GitHub source link
alone as an application path.

- [ ] **Step 4: Build safe JSON-LD**

Emit `@context`, `@type`, `title`, full HTML-safe description, `datePosted`,
`hiringOrganization`, `employmentType` when known, and either physical
`jobLocation` or `jobLocationType: "TELECOMMUTE"` with
`applicantLocationRequirements` when a country restriction is known. Do not
emit guessed salary, `validThrough`, `directApply`, employer logo, or source
community geography.

Serialize with `JSON.stringify(value).replace(/</gu, "\\u003c")` before placing
it in `<script type="application/ld+json">`.

- [ ] **Step 5: Render only eligible markup**

Call the pure builder in `app/jobs/[id]/page.tsx`. The visible page and JSON-LD
must use the same opportunity object. When ineligible, render no empty script
and keep the normal page fully indexable.

- [ ] **Step 6: Validate and commit**

Run: `node tooling/validate-growth-surfaces.mjs && npm run lint`

```bash
git add lib/metadata/job-posting.ts app/jobs/'[id]'/page.tsx tooling/validate-growth-surfaces.mjs
git commit -m "feat: add eligible job posting metadata"
```

### Task 3: Generate recent-job, preset, and updates feeds

**Files:**
- Create: `lib/feeds/atom.ts`
- Create: `lib/feeds/jobs.ts`
- Create: `app/feed.xml/route.ts`
- Create: `app/updates.xml/route.ts`
- Create: `app/feeds/[slug]/route.ts`
- Modify: `app/layout.tsx`
- Modify: `tooling/validate-growth-surfaces.mjs`

- [ ] **Step 1: Add failing Atom serialization tests**

Assert deterministic entry order, maximum 50 entries, canonical URLs, unique
IDs, accurate `updated`, escaped `<`, `>`, `&`, quotes, valid XML declaration,
and no raw job description. Reject invalid dates and unknown preset slugs.

```ts
export const JOB_FEED_SLUGS = [
  "remote",
  "internships",
  "react",
  "data-ai",
  "devops",
  "salary",
] as const;
```

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-growth-surfaces.mjs`

- [ ] **Step 3: Implement one Atom serializer**

`serializeAtomFeed({ id, title, subtitle, selfUrl, siteUrl, updated, entries })`
returns UTF-8 Atom 1.0. Entries contain canonical job/update URL, title,
updated, published when present, and a plain-text summary capped at 280
characters. No source body or analytics parameter enters a feed.

- [ ] **Step 4: Implement static GET handlers**

Each handler has only `GET`, reads build-time artifacts, and returns
`Content-Type: application/atom+xml; charset=utf-8`. The preset handler exports
`generateStaticParams()` for the six exact slugs. Map presets to the same
structured filters used by the product: remote work model, internship
employment/seniority, React technology, data-ai area, devops-sre area, and
salary disclosed.

- [ ] **Step 5: Advertise the primary feeds**

Add `alternates.types` to root metadata for `/feed.xml` and `/updates.xml`.
Preset feeds are linked from their corresponding curated page rather than the
global head.

- [ ] **Step 6: Validate and commit**

Run: `node tooling/validate-growth-surfaces.mjs && npm run lint`

```bash
git add lib/feeds app/feed.xml app/updates.xml app/feeds app/layout.tsx tooling/validate-growth-surfaces.mjs
git commit -m "feat: publish jobs and updates feeds"
```

### Task 4: Build six-locale curated discovery pages

**Files:**
- Create: `lib/discovery/curated-pages.ts`
- Create: `lib/metadata/localized-alternates.ts`
- Create: `app/[locale]/discover/[slug]/page.tsx`
- Create: `app/[locale]/discover/[slug]/_components/locale-route-sync.tsx`
- Modify: `app/_components/discovery-shortcuts/index.tsx`
- Modify: `tooling/validate-growth-surfaces.mjs`

- [ ] **Step 1: Add failing locale and reciprocity tests**

Assert 36 route pairs (six locales by six slugs), complete idiomatic titles and
descriptions, a self-reference plus all five alternates and `x-default`, no
query strings in canonical URLs, and a valid matching preset feed.

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-growth-surfaces.mjs`

- [ ] **Step 3: Define the six curated presets**

Each preset contains stable slug, server filters, feed slug, localized title,
description, explanatory paragraph, CTA, and empty state. The filter mapping is
identical to Task 3. Do not generate arbitrary technology/country combinations.

- [ ] **Step 4: Implement localized metadata**

```ts
export function localizedAlternates(locale: LocaleCode, path: string) {
  const languages = Object.fromEntries(AVAILABLE_LOCALES.map(({ code }) => [
    code,
    resolveCanonicalUrl(`/${code}${path}`),
  ]));
  return {
    canonical: languages[locale],
    languages: { ...languages, "x-default": languages.en },
  };
}
```

Use this only on locale-prefixed curated pages. Existing single-URL interactive
pages do not claim false localized alternates.

- [ ] **Step 5: Render useful static content**

`generateStaticParams` returns all locale/slug pairs. The server page loads the
first 20 matching canonical jobs, renders localized editorial copy, links to
canonical job pages, exposes its preset feed, and links to the interactive
search URL with the same supported filters. It does not mount the entire search
controller or create duplicate job URLs.

- [ ] **Step 6: Synchronize the client locale**

The small client child validates the locale and calls the existing locale
store on mount so header/footer controls follow the route after hydration. It
does not redirect or read IP/location. Main static content is already rendered
in the route locale.

- [ ] **Step 7: Point homepage discovery shortcuts to curated pages**

Use the current browser locale to form `/{locale}/discover/{slug}`. Keep the
interactive filtered-search CTA on each landing page for users who want the
full result controls.

- [ ] **Step 8: Validate and commit**

Run: `node tooling/validate-growth-surfaces.mjs && npm run lint`

```bash
git add lib/discovery lib/metadata/localized-alternates.ts app/'[locale]'/discover app/_components/discovery-shortcuts tooling/validate-growth-surfaces.mjs
git commit -m "feat: add localized discovery landing pages"
```

### Task 5: Add deterministic similar jobs

**Files:**
- Create: `lib/opportunities/similar.ts`
- Modify: `lib/opportunities/api.ts`
- Create: `app/opportunities/_components/opportunity-details/similar-opportunities/index.tsx`
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
- Modify: `tooling/validate-growth-surfaces.mjs`

- [ ] **Step 1: Write failing ranking cases**

Score shared technologies `+5` each, area `+4`, work model `+3`, job country
`+3`, seniority `+2`, employment type `+1`, and fresh status `+1`. Exclude the
current canonical ID and its aliases, closed items, and exact duplicate source
URLs. Break ties by newest `createdAt`, then canonical ID. Return at most four.

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-growth-surfaces.mjs`

- [ ] **Step 3: Implement pure scoring and bounded loading**

`findSimilarOpportunities(current, candidates, 4)` is pure. The API facade uses
facet indexes to load a bounded candidate union from matching technologies,
areas, work models, and job countries, then calls the scorer. It must not load
every job bucket independently per static job page.

- [ ] **Step 4: Render related jobs**

On canonical job pages, show up to four compact cards after the main detail.
Each card contains title, company/community, location, freshness, sponsored
badge when relevant, and a canonical internal link. Omit the entire section
when no candidate has a positive score.

- [ ] **Step 5: Add all locale copy and validate**

Run: `node tooling/validate-growth-surfaces.mjs && npm run lint`

- [ ] **Step 6: Commit**

```bash
git add lib/opportunities app/jobs app/opportunities/_components/opportunity-details lib/translations tooling/validate-growth-surfaces.mjs
git commit -m "feat: recommend similar opportunities"
```

### Task 6: Add shareable discovery controls

**Files:**
- Create: `app/opportunities/_components/opportunities-screen/share-discovery/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-toolbar/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/types.ts`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`
- Modify: `tooling/validate-growth-surfaces.mjs`

- [ ] **Step 1: Add URL safety fixtures**

Assert the shared URL contains only keys from `OPPORTUNITY_QUERY_KEYS`, removes
the selected drawer job, excludes default values, keeps any/all semantics, and
never includes local saved/viewed IDs.

- [ ] **Step 2: Implement copy/share behavior**

Use the current normalized URL state. Prefer `navigator.share` when available;
otherwise use the clipboard; otherwise show the localized failure message.
Keep focus on the trigger and announce success through the existing live-region
pattern. Do not append UTM or analytics identifiers.

- [ ] **Step 3: Place the action in the results toolbar**

Show it when at least one non-default discovery filter is active. The action is
separate from job sharing and does not create an indexable query-result page.

- [ ] **Step 4: Validate and commit**

Run: `node tooling/validate-growth-surfaces.mjs && npm run lint`

```bash
git add app/opportunities lib/translations tooling/validate-growth-surfaces.mjs
git commit -m "feat: share supported discovery states"
```

### Task 7: Surface local “new for you” recurrence

**Files:**
- Create: `app/opportunities/_components/opportunities-screen/new-for-you/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/controller/use-opportunities-screen-controller.ts`
- Modify: `app/opportunities/_components/opportunities-screen/types.ts`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`
- Modify: `tooling/validate-growth-surfaces.mjs`

- [ ] **Step 1: Add failing visibility cases**

Assert the prompt appears only on the global homepage when a previous visit
exists and at least one stored country, work-model, technology, or seniority
preference is active. It remains hidden on community/author profiles and when
the New filter is already active.

- [ ] **Step 2: Expose the existing local signals**

Return `previousVisitAt` and a boolean `hasPersistedPreferences` from the screen
controller without adding the preference values to telemetry or markup. Reuse
the existing versioned candidate-state adapter; do not create a second storage
key.

- [ ] **Step 3: Render an account-free recurrence prompt**

Place a compact panel above results with localized title, explanation that
preferences remain in this browser, and an action that sets `newOnly: true`.
The existing restored filters and prior-visit timestamp define the results.
Include a dismiss action valid for the current document only; dismissal is not
tracked or persisted.

- [ ] **Step 4: Validate and commit**

Run: `npm run test:growth && npm run test:local-state && npm run lint`

```bash
git add app/opportunities lib/translations tooling/validate-growth-surfaces.mjs
git commit -m "feat: highlight new matching opportunities"
```

### Task 8: Verify crawl, structured data, feeds, and rendering

- [ ] **Step 1: Run deterministic checks**

Run: `node tooling/validate-growth-surfaces.mjs`

Run: `npm run test:discovery`

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 2: Run the complete static build**

From `data-pipeline/snapshots/opportunities`, start:

`python3 -m http.server 8765 --bind 127.0.0.1`

From the web worktree, run:

`OPENINGS_DATA_BASE_URL=http://127.0.0.1:8765 npm run build`

Expected: `/robots.txt`, `/sitemap.xml`, three feed families, 36 curated pages,
canonical job pages, and social images are present in `out/`.

- [ ] **Step 3: Validate exported artifacts**

Run: `npm run test:metadata`

Parse every XML output with a standards-compliant XML parser. Run representative
eligible and ineligible pages through Google's Rich Results Test or its current
official validator. Confirm sitemap URLs return exported files and every
`hreflang` target references the same complete alternate set.

- [ ] **Step 4: Audit user experience**

Check a curated page in all six locales, a job with similar results, a job with
no similar results, and shared filters at 375/768/1440 CSS pixels. Verify
keyboard order, visible focus, reduced motion, no layout shift from JSON-LD,
and working pages with analytics/Sentry domains blocked.

- [ ] **Step 5: Commit only verified corrections**

```bash
git add app lib tooling
git commit -m "fix: harden organic discovery surfaces"
```
