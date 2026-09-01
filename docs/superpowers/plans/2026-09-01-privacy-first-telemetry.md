# Privacy-First Telemetry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Sentry for technical failures and Mixpanel for consented product learning without collecting search text, job content, personal data, IP-derived geography, autocapture, or session replay.

**Architecture:** Vendor SDKs sit behind small telemetry adapters. Sentry initializes independently with an aggressive sanitizer; Mixpanel is dynamically imported only after versioned explicit consent. Product code calls a typed allowlist, and both vendors degrade to no-ops when configuration or network access is unavailable.

**Tech Stack:** Next.js 16.2 static export, React 19, TypeScript, `@sentry/nextjs`, `mixpanel-browser`, Node.js ESM, `@sentry/node`, native validation scripts, Sentry and Mixpanel free plans.

---

## File map

### Web repository

- `lib/telemetry/contracts.ts`: closed event/property vocabulary.
- `lib/telemetry/consent.ts`: versioned local consent parsing and storage.
- `lib/telemetry/sanitize.ts`: URL, breadcrumb, exception, and property sanitizers.
- `lib/telemetry/mixpanel-client.ts`: consent-gated lazy SDK lifecycle.
- `lib/telemetry/index.ts`: vendor-neutral public API.
- `instrumentation-client.ts`: early Sentry browser initialization.
- `sentry.server.config.ts`: build/server initialization used during static generation.
- `instrumentation.ts`: Next.js server instrumentation registration.
- `app/global-error.tsx`: last-resort client error capture.
- `components/providers/telemetry-provider/index.tsx`: consent store and client lifecycle.
- `components/privacy/analytics-consent-banner/index.tsx`: first-choice banner.
- `app/privacy/_components/analytics-preferences/index.tsx`: permanent preference control.
- `app/layout.tsx`: provider placement.
- `next.config.ts`: source-map upload integration without changing static export.
- `.env.example`: public variable names only.
- `tooling/validate-telemetry-contract.mjs`: privacy and initialization assertions.
- Existing discovery/detail/status components: explicit product-event call sites.

### Data-pipeline repository

- `src/modules/observability/sentry.mjs`: optional Node SDK adapter and safe context.
- `scripts/build-opportunities.mjs`: check-in lifecycle, fatal capture, bounded flush.
- `src/config/env.mjs`: observability environment parsing.
- `.github/workflows/update-opportunities.yml`: Sentry environment and release inputs.
- `test/sentry-observability.test.mjs`: no-op, sanitizer, check-in, and exit behavior.

### External configuration

- Sentry projects: `openings-web` and `openings-data-pipeline`.
- Sentry monitor: `opportunities-sync`, schedule `0 */3 * * *`, UTC.
- Mixpanel EU project: `Openings.dev Production`.
- Mixpanel board: `Qualified discovery`.

### Task 1: Install SDKs and define the public contract

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `lib/telemetry/contracts.ts`
- Create: `lib/telemetry/sanitize.ts`
- Create: `lib/telemetry/index.ts`
- Create: `tooling/validate-telemetry-contract.mjs`
- Modify: `.env.example`

- [ ] **Step 1: Install web dependencies**

Run: `npm install @sentry/nextjs mixpanel-browser`

Expected: both packages are in `dependencies`; no session-replay package is
added separately.

- [ ] **Step 2: Write the failing contract validator**

The validator imports pure TypeScript through `typescript.transpileModule` and
asserts that arbitrary keys, free text, URLs, emails, and oversized strings are
removed while the exact event map below is retained.

```ts
export interface TelemetryEventMap {
  "Search Submitted": {
    queryLength: "1-3" | "4-10" | "11-30" | "31+";
    resultCount: "0" | "1-10" | "11-50" | "51+";
    activeFilterCount: number;
    locale: string;
  };
  "Filter Applied": { dimension: TelemetryFilterDimension; value: string; locale: string };
  "Discovery Shortcut Opened": { shortcut: string; locale: string };
  "Job Viewed": { jobId: string; age: "0-7" | "8-30" | "31-90" | "91+"; sponsored: boolean; sourceCount: number };
  "Original Listing Opened": { jobId: string; sponsored: boolean; sourceCount: number };
  "Job Saved": { jobId: string; savedCount: "0" | "1-5" | "6-20" | "21+" };
  "Comparison Opened": { jobCount: 2 | 3; completeness: "low" | "medium" | "high" };
  "Community Viewed": { repository: string; activity: "active" | "no-openings" | "error" };
  "Status Viewed": { health: "healthy" | "partial" | "unavailable" };
  "Updates Viewed": { section: "changelog" | "releases" | "roadmap" };
}
```

- [ ] **Step 3: Run the validator and verify failure**

Run: `node tooling/validate-telemetry-contract.mjs`

Expected: FAIL because the telemetry modules do not exist.

- [ ] **Step 4: Implement the allowlist and sanitizers**

`sanitizeProductEvent(name, properties)` must reject an unknown event name,
retain only the keys declared for that event, limit identifiers to
`[A-Za-z0-9_./-]`, cap strings at 96 characters, and reject strings containing
`@`, `://`, whitespace runs, or query-like keys named `query`, `search`,
`title`, `description`, `email`, `url`, or `referrer`.
Human-readable facet values such as `United States` are normalized to stable
slugs such as `united-states` before sanitization.

```ts
export function stripUrlDetails(value: string): string {
  try {
    const url = new URL(value, "https://openings.dev");
    return `${url.origin}${url.pathname}`;
  } catch {
    return "https://openings.dev/";
  }
}
```

`sanitizeSentryEvent` deletes `user`, request headers, cookies, body, query
string, and arbitrary extras; strips URL query/hash; and keeps only
`environment`, `release`, normalized error information, and safe tags.

The facade initially exports typed `trackProductEvent` and
`captureTechnicalException`; both are safe no-ops until their respective SDK
adapter is configured. Feature code imports only this facade.

- [ ] **Step 5: Add public environment names**

```dotenv
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=
NEXT_PUBLIC_SENTRY_RELEASE=
NEXT_PUBLIC_MIXPANEL_TOKEN=
NEXT_PUBLIC_MIXPANEL_API_HOST=https://api-eu.mixpanel.com
```

- [ ] **Step 6: Run validation and commit**

Run: `node tooling/validate-telemetry-contract.mjs && npm run lint`

Add `"test:telemetry": "node tooling/validate-telemetry-contract.mjs"` to the
package scripts before committing.

```bash
git add package.json package-lock.json .env.example lib/telemetry tooling/validate-telemetry-contract.mjs
git commit -m "feat: define privacy-first telemetry contract"
```

### Task 2: Initialize sanitized Sentry monitoring for the static web app

**Files:**
- Create: `instrumentation-client.ts`
- Create: `sentry.server.config.ts`
- Create: `instrumentation.ts`
- Create: `app/global-error.tsx`
- Modify: `next.config.ts`
- Modify: `lib/opportunities/static-artifacts.ts`
- Modify: `tooling/validate-telemetry-contract.mjs`

- [ ] **Step 1: Add failing source assertions**

Assert `sendDefaultPii: false`, both replay sample rates equal zero, browser
trace sample rate is no more than `0.05`, `beforeSend` is present, and static
export remains configured.

- [ ] **Step 2: Run the validator and verify failure**

Run: `node tooling/validate-telemetry-contract.mjs`

Expected: FAIL because Sentry initialization files are absent.

- [ ] **Step 3: Add browser initialization**

Use Next.js 16's root `instrumentation-client.ts` convention:

```ts
import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from "@/lib/telemetry/sanitize";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: 0.05,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend: sanitizeSentryEvent,
    beforeBreadcrumb: sanitizeSentryBreadcrumb,
  });
}
```

- [ ] **Step 4: Add build/server initialization and error boundary**

Server configuration uses the same sanitizer, `sendDefaultPii: false`, and
`tracesSampleRate: 0`. `instrumentation.ts` imports it only for the Node
runtime. `app/global-error.tsx` calls `Sentry.captureException(error)` inside a
client effect and renders a localized-safe reload action without exposing the
error message.

Expose `captureTechnicalException(error, { category })` from the internal
telemetry facade. At the final exhausted static-artifact recovery boundary,
capture category `static-artifact-unavailable` without the artifact URL,
query, response body, or user filters, then preserve the existing thrown error.

- [ ] **Step 5: Preserve static export while enabling source maps**

Wrap the existing config with `withSentryConfig`. Keep `output: "export"`,
`trailingSlash`, Turbopack root, and image configuration byte-for-byte. Set
`silent: true`, `disableLogger: true`, and `hideSourceMaps: true`; upload only
when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` exist.

- [ ] **Step 6: Validate and commit**

Run: `node tooling/validate-telemetry-contract.mjs && npm run lint`

```bash
git add instrumentation-client.ts instrumentation.ts sentry.server.config.ts app/global-error.tsx next.config.ts tooling/validate-telemetry-contract.mjs
git commit -m "feat: add sanitized Sentry web monitoring"
```

### Task 3: Implement versioned analytics consent and lazy Mixpanel

**Files:**
- Create: `lib/telemetry/consent.ts`
- Create: `lib/telemetry/mixpanel-client.ts`
- Modify: `lib/telemetry/index.ts`
- Modify: `tooling/validate-telemetry-contract.mjs`

- [ ] **Step 1: Add failing consent cases**

```ts
export type AnalyticsConsentState = "undecided" | "granted" | "denied";
export const ANALYTICS_CONSENT_KEY = "openings.analytics-consent.v1";
```

Assert missing, malformed, wrong-version, and storage-error values resolve to
`undecided`; only an explicit version-1 `granted` value enables analytics.

- [ ] **Step 2: Run and verify failure**

Run: `node tooling/validate-telemetry-contract.mjs`

- [ ] **Step 3: Implement consent storage**

Persist exactly `{ version: 1, state, updatedAt }`, catch every storage access,
and expose `readAnalyticsConsent`, `writeAnalyticsConsent`, and
`subscribeAnalyticsConsent`. A storage write failure returns `false`; callers
must leave Mixpanel disabled because consent cannot be retained.

- [ ] **Step 4: Implement the lazy Mixpanel lifecycle**

Do not statically import `mixpanel-browser`. `enableAnalytics()` first confirms
stored `granted`, then dynamically imports and initializes once with:

```ts
{
  api_host: process.env.NEXT_PUBLIC_MIXPANEL_API_HOST ?? "https://api-eu.mixpanel.com",
  autocapture: false,
  track_pageview: false,
  record_sessions_percent: 0,
  persistence: "localStorage",
  ip: false,
  secure_cookie: true,
  stop_utm_persistence: true,
  debug: process.env.NODE_ENV === "development",
}
```

`trackProductEvent` runs the allowlist sanitizer before `mixpanel.track`.
`disableAnalytics` calls the installed SDK's opt-out and persistence-clearing
APIs supported by the installed version, resets its anonymous identity, clears
the local SDK keys, and drops the in-memory instance. Verify this sequence
against the installed package types rather than using an untyped cast.

- [ ] **Step 5: Prove no initialization before consent**

The validation script replaces the dynamic loader with a counter. Assert zero
loads for undecided/denied, one load for granted, zero events with absent token,
and no retained identity after revocation.

- [ ] **Step 6: Validate and commit**

Run: `node tooling/validate-telemetry-contract.mjs && npm run lint`

```bash
git add lib/telemetry tooling/validate-telemetry-contract.mjs
git commit -m "feat: gate Mixpanel behind explicit consent"
```

### Task 4: Add accessible consent and permanent privacy controls

**Files:**
- Create: `components/providers/telemetry-provider/index.tsx`
- Create: `components/providers/telemetry-provider/context.ts`
- Create: `components/providers/telemetry-provider/use-telemetry.ts`
- Create: `components/privacy/analytics-consent-banner/index.tsx`
- Create: `app/privacy/_components/analytics-preferences/index.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/privacy/page.tsx`
- Modify: `PRIVACY.md`
- Modify: `docs/privacy/PRIVACY.pt.md`
- Modify: `docs/privacy/PRIVACY.es.md`
- Modify: `docs/privacy/PRIVACY.it.md`
- Modify: `docs/privacy/PRIVACY.fr.md`
- Modify: `docs/privacy/PRIVACY.de.md`
- Modify: `lib/translations/types.ts`
- Modify: `lib/translations/en.ts`
- Modify: `lib/translations/pt.ts`
- Modify: `lib/translations/es.ts`
- Modify: `lib/translations/it.ts`
- Modify: `lib/translations/fr.ts`
- Modify: `lib/translations/de.ts`

- [ ] **Step 1: Add typed consent copy**

Add `analyticsConsent` messages for title, concise purpose, accept, decline,
current state, change preference, granted, denied, undecided, and saved
announcement. Each locale must say that metrics are optional and searches are
not recorded.

- [ ] **Step 2: Implement the provider**

Use `useSyncExternalStore` over the consent adapter. On `granted`, call
`enableAnalytics`; on `denied`, call `disableAnalytics`. The server snapshot is
always `undecided`. Mount the provider inside `I18nProvider` and outside
`AppShell` so all product surfaces share one lifecycle.

- [ ] **Step 3: Implement the first-choice banner**

Render only for `undecided`. Use a non-modal region with a heading, concise
copy, two equally legible buttons, a Privacy link, keyboard-visible focus, no
countdown, and no preselected choice. Failed persistence leaves the banner open
and announces that the preference could not be saved.

- [ ] **Step 4: Add permanent controls to Privacy**

Place the interactive control below the rendered privacy document. It shows
the current state and explicit Allow/Decline actions. Revocation must not clear
saved jobs, viewed jobs, theme, language, or discovery preferences.

- [ ] **Step 5: Update all privacy documents**

Document Sentry's technical purpose and default PII/IP/search exclusions;
Mixpanel's optional purpose, exact consent behavior, disabled autocapture and
replay, anonymous identity, revocation, and `support@openings.dev` contact.

- [ ] **Step 6: Validate and commit**

Run: `node tooling/validate-telemetry-contract.mjs && npm run lint`

```bash
git add app/layout.tsx app/privacy components/providers/telemetry-provider components/privacy lib/telemetry lib/translations PRIVACY.md docs/privacy tooling/validate-telemetry-contract.mjs
git commit -m "feat: add analytics consent controls"
```

### Task 5: Instrument the qualified-discovery funnel

**Files:**
- Create: `app/opportunities/_components/opportunities-screen/controller/use-discovery-telemetry.ts`
- Modify: `app/opportunities/_components/opportunities-screen/controller/use-opportunities-screen-controller.ts`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-quick-filters/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunities-quick-filters/discovery-shortcuts/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/opportunity-drawer/drawer-action/index.tsx`
- Modify: `app/opportunities/_components/opportunity-details/index.tsx`
- Modify: `app/opportunities/_components/opportunities-screen/controller/use-local-discovery.ts`
- Modify: `app/opportunities/_components/opportunities-screen/comparison-panel/index.tsx`
- Create: `app/communities/[owner]/[name]/_components/community-telemetry.tsx`
- Modify: `app/communities/[owner]/[name]/page.tsx`
- Create: `app/status/_components/status-telemetry.tsx`
- Modify: `app/status/_components/status-screen/index.tsx`
- Modify: `tooling/validate-telemetry-contract.mjs`

- [ ] **Step 1: Add failing call-site assertions**

Assert every initial event has exactly one explicit call site and no component
imports `mixpanel-browser` or `@sentry/*` outside telemetry/Sentry bootstrap
files.

- [ ] **Step 2: Track filter and search intent**

Wrap filter changes in `useDiscoveryTelemetry`. Never pass `searchText`; only
emit its length bucket after Enter or search-field blur when the value changed.
Filter events use the controlled field name and normalized facet value. Do not
track repository/author free text entered into any input.

- [ ] **Step 3: Track job outcomes**

Emit `Job Viewed` once per canonical ID per document when details become
visible. Emit `Original Listing Opened` from an explicit click handler before
navigation. Emit `Job Saved` after state calculation and `Comparison Opened`
only when the comparison page link is activated with two or three jobs.

- [ ] **Step 4: Track discovery and trust surfaces**

Emit shortcuts by stable ID, community views by repository/activity state,
status views by aggregate health, and updates-section views when that page is
implemented. Every event remains a no-op without granted consent.

The community profile server page passes only repository ID and current
activity enum to its small client telemetry child; it never passes community
description, author data, or job content.

- [ ] **Step 5: Validate and commit**

Run: `node tooling/validate-telemetry-contract.mjs && npm run test:discovery && npm run lint`

```bash
git add app lib/telemetry tooling/validate-telemetry-contract.mjs
git commit -m "feat: measure qualified job discovery"
```

### Task 6: Add optional Sentry monitoring to the data pipeline

**Repository:** `data-pipeline`

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/modules/observability/sentry.mjs`
- Modify: `src/config/env.mjs`
- Modify: `scripts/build-opportunities.mjs`
- Create: `test/sentry-observability.test.mjs`
- Modify: `.github/workflows/update-opportunities.yml`

- [ ] **Step 1: Install and write failing adapter tests**

Run: `npm install @sentry/node`

Inject a fake SDK and assert: absent DSN is a no-op; context contains only
repository IDs, counts, outcome, environment, and release; raw errors/headers
are excluded; in-progress and final check-ins share one ID; flush is capped at
2,000 ms; the original failure is rethrown after capture.

- [ ] **Step 2: Run and verify failure**

Run: `node --test test/sentry-observability.test.mjs`

- [ ] **Step 3: Implement the optional adapter**

Export `initializePipelineSentry`, `startSyncCheckIn`, `finishSyncCheckIn`,
`capturePipelineException`, and `flushPipelineSentry`. Initialize only with
`SENTRY_DSN`; set `sendDefaultPii: false`, `tracesSampleRate: 0`, environment,
and release. Normalize exception context before calling the SDK.

- [ ] **Step 4: Wrap the CLI lifecycle**

Start the check-in immediately before `runBuild`. Finish `ok` after success and
`error` inside the catch. Capture the exception, await bounded flush, then
preserve the current rate-limit messages and non-zero exit behavior.

- [ ] **Step 5: Add workflow variables**

Pass `SENTRY_DSN` from repository secrets, monitor slug
`opportunities-sync`, environment `production`, and release equal to
`github.sha`. Do not echo any secret.

- [ ] **Step 6: Validate and commit**

Run: `npm run validate`

```bash
git add package.json package-lock.json src/modules/observability/sentry.mjs src/config/env.mjs scripts/build-opportunities.mjs test/sentry-observability.test.mjs .github/workflows/update-opportunities.yml
git commit -m "feat: monitor pipeline synchronization failures"
```

### Task 7: Configure the connected Sentry and Mixpanel accounts

**External state:** Openings.dev profile in Brave, Sentry, Mixpanel, deployment
environment, GitHub repository secrets.

- [ ] **Step 1: Create or reuse exact Sentry projects**

In the connected Sentry organization, resolve existing projects first. Reuse
matching `openings-web` and `openings-data-pipeline`; create only missing ones.
Choose Next.js and Node.js platforms respectively. Keep team access limited to
the existing Openings.dev owner.

- [ ] **Step 2: Configure Sentry privacy and quotas**

Disable replay, set web trace sampling to 5%, verify default PII is off, set
server-side IP storage/scrubbing to remove client addresses, set issue grouping
defaults, and create the `opportunities-sync` monitor on
`0 */3 * * *` UTC with a 30-minute check-in margin.

- [ ] **Step 3: Create or reuse the Mixpanel EU project**

Resolve `Openings.dev Production` first; create only if absent. Copy its public
project token, leave session replay/autocapture off, and do not create user
profile enrichment or data pipelines.

- [ ] **Step 4: Store configuration without exposing secrets**

Set web public DSN/token/host/environment/release variables in the actual
deployment environment. Store `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and
`SENTRY_PROJECT` as protected build secrets. Set pipeline `SENTRY_DSN` as a
GitHub Actions repository secret. Never paste secret values into source,
commits, logs, screenshots, or this plan.

- [ ] **Step 5: Configure the decision dashboard**

Create Mixpanel funnel
`Discovery -> Search/Filter -> Job Viewed -> Original Listing Opened`, plus
7-day and 30-day retention based on `Original Listing Opened`. Add breakdowns
for locale, sponsored, source count, shortcut, community, and filter dimension.
Do not add a raw page-view KPI.

### Task 8: Verify privacy and production behavior

- [ ] **Step 1: Run all local web checks**

Run: `npm run lint`

Run: `npm run test:job-header`

Run: `npm run test:communities`

Run: `npm run test:sponsored`

Run: `npm run test:discovery`

Run: `npm run test:comparison`

Run: `npm run test:report`

Run: `npm run test:local-state`

Run: `npm run test:telemetry`

Expected: PASS.

- [ ] **Step 2: Build without telemetry configuration**

Serve the matching data-pipeline snapshot from its snapshot directory:

Run: `python3 -m http.server 8765 --bind 127.0.0.1`

In the web worktree run:

`OPENINGS_DATA_BASE_URL=http://127.0.0.1:8765 npm run build`

Expected: static export succeeds and telemetry is a no-op.

- [ ] **Step 3: Build with production public configuration**

Run the deployment build with public DSN/token variables and private Sentry
source-map secrets supplied by the environment.

Expected: static export succeeds, source-map upload reports success, and no
secret appears in `out/`.

- [ ] **Step 4: Perform the browser privacy audit**

Before consent, verify no request to Mixpanel and one sanitized Sentry test
error without PII/query data. After consent, verify every allowed event and no
free-text property. After revocation, verify no later event and a new/cleared
anonymous identity. Confirm discovery still works with both vendor domains
blocked.

- [ ] **Step 5: Record operational configuration**

Add a maintainer document listing project slugs, environment-variable names,
sampling values, monitor slug, event vocabulary, dashboards, and verification
date. Do not include tokens or DSNs.
