# Trust, Growth, and Observability Program Design

**Status:** Approved for planning on 2026-09-01

## Goal

Increase trust in Openings.dev and grow qualified job discovery without adding
accounts, a private application backend, or opaque behavioral tracking.

The program covers:

- privacy-first error monitoring with Sentry;
- consent-gated product analytics with Mixpanel;
- two additional GitHub Issues job sources;
- a public updates hub for changelog, releases, and roadmap;
- richer public sync history and job-level data provenance;
- technical SEO, feeds, and shareable discovery surfaces;
- a small, decision-oriented measurement model.

## Product principles

1. Opening the original job listing is the primary product outcome.
2. The original public listing remains the source of truth.
3. Declared facts and Openings.dev inferences are visibly different.
4. Observability may fail without affecting discovery or synchronization.
5. Free-text searches, job content, and personal data are never analytics
   properties.
6. Mixpanel runs only after explicit consent and can be disabled later.
7. Sentry collects only the technical data needed to diagnose failures.
8. Public plans distinguish shipped work from intention and avoid artificial
   delivery dates.
9. Static export, public artifacts, and browser-local preferences remain the
   architectural boundary.

## Alternatives considered

### Minimal monitoring

Sentry alone would provide failure visibility with the smallest integration
surface. It would not show whether search, filters, or discovery shortcuts lead
people to useful original listings.

### Privacy-first observability — selected

Sentry provides narrowly scoped technical diagnostics. Mixpanel provides a
small manually defined event vocabulary after consent. This balances product
learning, operational confidence, and user privacy.

### Broad automatic capture

Autocapture, session replay, and unrestricted event properties would produce
more data quickly, but would also create noise and unnecessary privacy risk.
This approach is explicitly rejected.

## Workstream A — source expansion

The catalog gains these repositories:

- `OurTinTinLand/TinTin-Job-Board`, classified as a China-based source in the
  Asia region with `zh-CN` as its primary locale;
- `Prime-Leo-Enterprises/Jobs`, classified conservatively as a global source
  until the organization publishes reliable institutional geography.

Neither repository requires a GitHub label for ingestion. Both use one open
Issue per opportunity and therefore match the existing ingestion contract.

Source geography never becomes job geography. In particular, a Prime Leo job
that says `Remote — Nigeria preferred` may produce Nigeria-specific job
location or remote-scope metadata while the source remains global. The
location parser must recognize Nigeria and its common country-code forms
without treating every occurrence in body prose as an explicit location.

Catalog and collection tests must cover uniqueness, label-free ingestion,
source metadata, and at least one representative issue from each new source.

## Workstream B — telemetry boundary

The web application exposes one internal telemetry interface. Feature
components do not import Sentry or Mixpanel directly.

The interface supports:

- capturing an allowed technical exception;
- recording an allowed product event;
- reading and changing analytics consent;
- resetting the anonymous analytics identity;
- flushing or safely abandoning queued telemetry during process shutdown.

The implementation is a no-op when configuration is absent. Vendor failures
are swallowed after safe local logging in development. They never block page
rendering, navigation, outbound job links, artifact loading, or pipeline
publication.

### Configuration

Public build configuration may contain the Sentry DSN and Mixpanel project
token. Administrative credentials, source-map upload tokens, and other write
credentials remain only in CI secrets.

Production, preview, and development are tagged explicitly. Local development
defaults to telemetry disabled unless a developer deliberately enables it.

## Workstream C — Sentry

The existing Openings.dev account will contain separate projects for the web
application and data pipeline.

### Web project

The web project captures:

- unhandled client exceptions;
- handled failures that make a public artifact unavailable;
- small-sample performance traces for important page transitions and artifact
  loading;
- release and environment identifiers.

The web project does not capture session replay, request bodies, search terms,
job descriptions, email addresses, GitHub handles, or raw full URLs containing
user-controlled parameters. Default PII collection is disabled. Event hooks
remove disallowed query strings, fragments, headers, breadcrumbs, and context
before transmission.

### Data-pipeline project

The pipeline project captures:

- fatal synchronization failures;
- safe aggregate context about partial repository failures;
- artifact validation or publication failures;
- one scheduled-sync check-in monitor when supported by the active free plan.

Repository error context uses repository identifiers and normalized failure
categories. It does not send provider response bodies, access tokens, request
headers, or full issue content. The command flushes telemetry for a bounded
period before exiting and preserves its original exit code.

### Quota behavior

Sampling and filtering keep the projects within the free tier. Repeated known
errors are grouped, expected network failures are normalized, and quota
exhaustion degrades to missing monitoring rather than a product failure.

## Workstream D — Mixpanel and consent

Mixpanel is a browser-only integration. It does not run in the data pipeline.

On a visitor's first eligible visit, the interface presents a discreet choice
to allow or decline product metrics. Until the visitor allows metrics, the
Mixpanel SDK is not initialized and no Mixpanel identity is created.

Consent is versioned and stored locally. A permanent privacy control allows the
visitor to change the choice. Revocation stops future event collection, opts
out through the SDK where available, resets the anonymous identity, and removes
the local analytics identifier. Functional preferences and saved jobs are not
deleted with analytics consent.

Autocapture and session replay are disabled. Events and properties use a
compile-time allowlist and a runtime sanitizer.

### Initial event vocabulary

- `Search Submitted`: query-length bucket, result-count bucket, active-filter
  count, locale;
- `Filter Applied`: filter dimension and normalized public facet value;
- `Discovery Shortcut Opened`: shortcut identifier;
- `Job Viewed`: canonical job identifier, age bucket, and source count;
- `Original Listing Opened`: canonical job identifier and source count;
- `Job Saved`: canonical job identifier and resulting saved-count bucket;
- `Comparison Opened`: number of jobs and completeness buckets;
- `Community Viewed`: repository identifier and activity state;
- `Status Viewed`: current aggregate health state;
- `Updates Viewed`: selected updates section.

No event includes free-text search content, job title, job description, email,
GitHub handle, support-message content, full referrer URL, or other arbitrary
strings. A future event requires an explicit schema addition and privacy
review.

### Measurement model

The primary metric is a qualified opening of an original job listing. The
initial funnel is:

```text
discovery -> search or filter -> job detail -> original listing
```

Supporting metrics are searches with results, search-to-view conversion,
view-to-original conversion, saves, comparisons, consented 7- and 30-day
return, and discovery contribution by community and shortcut. Page views alone
are not a success metric.

## Workstream E — public trust surfaces

### Job provenance

Each job detail page gains a compact data-confidence section with:

- original publication date;
- last successful verification time;
- every source in the duplicate group;
- whether displayed location, salary, seniority, and work model are declared,
  inferred, or unknown;
- a clear stale or incomplete-data warning when applicable;
- the existing prefilled support-email action.

The presentation uses neutral language. A heuristic result is never called
verified merely because the parser produced a value.

### Status history

The pipeline publishes a bounded status-history artifact covering the previous
30 days. It includes recent run outcomes and daily aggregates without raw
provider errors. Each run records completion time, duration, total sources,
successful sources, failed sources, no-opening sources, and canonical open-job
count.

The `/status` page retains its current per-community table and adds a compact
history view. The UI distinguishes a single partial run from a recurring
incident. Missing history does not invalidate the current status artifact
during a compatibility rollout.

### Methodology and privacy

Public documentation explains collection, classification, deduplication,
freshness, inference, monitoring, analytics consent, and
revocation. Footer links expose Status, Updates, Methodology, Privacy, and
Support in all six locales.

## Workstream F — updates hub

One `/updates` route contains three clearly separated sections rather than
three sparse top-level pages:

- Changelog: dated user-visible changes;
- Releases: larger product milestones that may link to GitHub Releases;
- Roadmap: `Now`, `Next`, and `Later`, without invented dates.

The content is typed, reviewed, and versioned in the web repository. Entries
have stable identifiers, status, category, applicable date, localized content,
and optional links. Build validation rejects duplicate identifiers, invalid
roadmap states, releases without dates, and missing translations.

`/status` remains the source for operational health. `/updates` describes
product evolution. GitHub Releases may provide technical detail but are not a
runtime dependency for the static page.

## Workstream G — organic and recurring growth

### Crawl and localization

The static build produces:

- `robots.txt`;
- a canonical XML sitemap with accurate significant-change timestamps;
- canonical URLs and reciprocal `hreflang` alternates for all supported
  localized routes;
- an `x-default` language fallback where appropriate;
- consistent social and page metadata.

Search-result pages with arbitrary user parameters are not added as indexed
pages. Curated discovery routes use stable canonical URLs.

### Job structured data

`JobPosting` JSON-LD is emitted only on an individual, active job page when a
validator confirms the required visible facts and an actual application path.
The markup mirrors the visible page, preserves the original posting date, uses
real job geography, represents fully remote scope correctly, and never fills a
required property with source-community geography.

Expired, stale-without-validity, incomplete, inappropriate, or applicationless
records are excluded. Eligibility is a build-time decision with focused tests;
structured data is not emitted speculatively.

### Feeds and sharing

The static artifacts include:

- an Atom or RSS feed for recent eligible jobs;
- an updates feed;
- optional preset feeds for stable high-value facets such as remote work,
  internships, selected technology areas, country, and work model.

Feed URLs use a bounded supported parameter vocabulary rather than arbitrary
query generation. They contain canonical job URLs and accurate timestamps.

Job pages and supported discovery states expose copy/share actions. Supported
filters are encoded in shareable URLs. Curated indexable discovery pages reuse
the same filter contract instead of becoming a separate search system.

### Local recurrence

The existing browser-local saved jobs, preferences, recently viewed state, and
new-since-last-visit behavior remain account-free. The homepage may use those
local signals to show recent matching jobs. Job details may show deterministic
similar jobs based on structured taxonomy, geography, work model, and
freshness. No personal profile is sent to Mixpanel.

Email newsletters and user accounts remain outside this program until the
account-free recurrence features demonstrate demand.

## Data flow

```text
GitHub issue sources
  -> collection and enrichment
  -> canonical jobs + provenance + sync history
  -> static artifacts
  -> Next.js static build
  -> pages, feeds, sitemap, and eligible structured data

Browser interaction
  -> local product behavior
  -> consent check
  -> allowlisted anonymous Mixpanel event or no-op

Technical failure
  -> PII/query sanitizer
  -> sampled Sentry project or no-op
```

## Compatibility and failure handling

- New pipeline fields and status history are additive during rollout.
- Older artifacts remain readable while the web deploy and pipeline snapshot
  transition.
- Missing telemetry configuration never fails a build.
- Content pages remain renderable when both vendors are unavailable.
- Consent storage corruption resets to undecided, never to accepted.
- Browser storage denial disables only consent persistence and local
  conveniences; Mixpanel remains off when consent cannot be retained.
- Invalid update content, feeds, sitemap entries, or structured data fail the
  build rather than publishing misleading output.
- A partial source sync remains public as a partial sync and keeps each
  community's last successful timestamp intact.

## Validation

### Data pipeline

- catalog tests for the two new repositories;
- Nigeria location aliases and negative location-inference cases;
- label-free issue ingestion fixtures;
- safe Sentry context and bounded flush tests;
- 30-day history append, prune, aggregation, partial-run, and compatibility
  tests;
- static-artifact schema and consistency validation;
- the complete pipeline validation suite.

### Web

- telemetry adapter tests for absent config, consent states, revocation,
  property allowlists, and sanitizer behavior;
- proof that analytics code does not initialize before consent;
- update-content schema and six-locale completeness validation;
- provenance rendering for declared, inferred, unknown, stale, and duplicate
  cases;
- sitemap, robots, reciprocal `hreflang`, feed, canonical URL, and structured
  data validators;
- keyboard, narrow-screen, reduced-motion, and consent-control review;
- production lint and complete static build.

### External configuration

- verify Sentry events in both projects without sensitive fields;
- verify a successful and a failed pipeline monitor check-in;
- verify Mixpanel receives nothing before consent;
- verify each allowed event after consent and identity reset after revocation;
- record dashboard definitions and sampling choices in project documentation.

## Delivery order

1. Add and validate the two job sources.
2. Add the vendor-neutral telemetry adapters and privacy contract.
3. Configure Sentry and Mixpanel through the connected Openings.dev browser
   profile and CI secrets.
4. Add consent UI, localized privacy copy, and the initial event vocabulary.
5. Add pipeline status history and job provenance.
6. Add `/updates`, its localized content model, and navigation.
7. Add sitemap, localization metadata, structured-data eligibility, feeds, and
   shareable discovery pages.
8. Configure initial dashboards and run end-to-end privacy and failure audits.

Each step must remain independently deployable. External account setup is not
allowed to become a prerequisite for a successful local build or static export.
