# Discovery Platform Program Design

**Status:** Approved autonomously for implementation on 2026-08-31

## Goal

Turn Openings from a searchable aggregation layer into a trustworthy, repeatable job-discovery product without adding authentication, a private backend, or a local opportunity dataset.

The program covers:

- explicit job location separate from community location;
- cross-community duplicate grouping;
- freshness controls and stale disclosure;
- structured opportunity taxonomy;
- ranked, multilingual-tolerant search;
- local saved jobs, visit history, and persisted preferences;
- discovery shortcuts;
- active/inactive/error community states;
- explicit load-more behavior;
- shareable comparison of up to three jobs;
- prefilled support email reporting;
- a public `/status` page backed by pipeline health data.

## Product principles

1. The original public listing remains the source of truth.
2. Missing structured data stays unknown; the product does not invent facts.
3. Community geography and job geography are separate facts.
4. Duplicate sources remain inspectable even when represented by one canonical job.
5. Browser-local features work without accounts and degrade safely when storage is unavailable.
6. Every shareable discovery state remains URL-addressable.
7. New contracts are additive where possible and validated before publication.

## Program decomposition

### Workstream A — data foundation and public status

The data pipeline owns extraction, normalization, duplicate grouping, freshness classification, per-community sync health, and static artifact publication.

#### Source and job locations

Each opportunity keeps its legacy `country` and `region` fields during migration, but gains two explicit structures:

```json
{
  "sourceLocation": {
    "country": "Brazil",
    "countryCode": "BR",
    "region": "South America"
  },
  "jobLocation": {
    "country": "Brazil",
    "countryCode": "BR",
    "region": "South America",
    "subdivision": "São Paulo",
    "city": "São Paulo",
    "workModel": "remote",
    "remoteScope": "country",
    "displayText": "Remote within Brazil",
    "confidence": "explicit"
  }
}
```

`jobLocation` fields are optional. The parser uses explicit labels and labeled body fields, then conservative title/body patterns. Repository geography is never silently presented as confirmed job geography. When no explicit job location exists, `jobLocation.confidence` is `unknown` and the interface says that the location was not supplied.

#### Structured taxonomy

Raw GitHub labels are preserved as `sourceTags`. Candidate-facing facets use:

- `areas`: frontend, backend, fullstack, mobile, data-ai, devops-sre, qa, security, product, design, support, leadership, other;
- `technologies`: canonical technology identifiers;
- `seniority`: internship, junior, mid, senior, lead, staff, principal;
- `employmentTypes`: full-time, part-time, contract, employee, contractor, internship;
- `workModels`: remote, hybrid, on-site;
- `languages`: normalized language identifiers.

Extraction always considers labels, title, and body. Operational labels such as `bug`, `stale`, `help-wanted`, `awaiting-triage`, and `enhancement` never become discovery facets.

#### Duplicate grouping

The pipeline groups matching open listings after normalization. Strong duplicate signals are:

1. the same non-GitHub application URL;
2. the same normalized title, company, and explicit location;
3. the same normalized title and stable description fingerprint.

Generic feed titles such as `New Internship` require an application URL or content fingerprint and are never grouped by title alone.

One canonical opportunity is published per group. The primary source is the oldest still-open source. The canonical record exposes every source, preserves the earliest `createdAt`, uses the latest `updatedAt`, and reports a source count. Counts and facets use canonical opportunities, not source copies.

#### Freshness

Freshness uses the canonical publication date:

- `fresh`: 0–30 days;
- `aging`: 31–90 days;
- `stale`: more than 90 days.

The API exposes age metadata and supports exact 7-, 30-, and 90-day filters. Stale jobs remain accessible and clearly labeled; they are not silently removed while their source remains open.

#### Public sync status

The pipeline publishes `api/status.json` with:

- latest completed global synchronization;
- total catalog communities, successful communities, failed communities, communities without open jobs, and canonical open jobs;
- one row per catalog community with repository identity, health status, last successful sync, open canonical job count, and last open-job publication date.

Community states are `healthy`, `no-openings`, and `error`. A failed run preserves the prior `lastSuccessfulSyncAt`; the failed attempt never replaces a successful timestamp. Public error data is a safe category, not a raw provider response or credential-bearing message.

### Workstream B — ranked discovery and controlled filters

The web application consumes structured facets instead of classifying arbitrary labels in the browser.

#### Search

Search tokenizes normalized text, expands a controlled alias map, and scores fields with this priority:

1. exact title and company matches;
2. title terms and structured role/technology matches;
3. location and seniority matches;
4. excerpt and source metadata matches;
5. fuzzy token matches within a conservative edit-distance threshold.

When a search is active, relevance is the default order. The user can still choose newest, oldest, recently updated, or salary.

Multi-value filters expose explicit semantics: `any` for broad discovery and `all` for technology combinations. Date filters support 7, 30, and 90 days. Salary filters initially provide `salary disclosed` because currencies are heterogeneous; numeric cross-currency comparison is out of scope.

#### Quick discovery

The homepage exposes localized preset links for Remote, Internship, React, Data & AI, DevOps, and Salary disclosed. Presets are ordinary URL filters, not a second query system.

#### Result loading

Automatic infinite loading is removed. The first 20 results load normally and an explicit `Load more` action appends the next 20 while preserving URL page state and focus. The results-per-page control is removed to avoid two competing pagination models.

### Workstream C — local candidate tools

Browser-local state uses a versioned storage adapter that tolerates unavailable or malformed storage.

- Saved jobs store canonical IDs and saved timestamps.
- Recently viewed jobs store canonical IDs and viewed timestamps.
- `lastVisitAt` marks jobs created after the prior completed visit as new.
- Persisted preferences store country, work model, technologies, and seniority.
- URL values always override stored preferences.
- A visible reset action clears discovery preferences without clearing saved jobs.

The initial global homepage country becomes `all`. After the first intentional filter change, the chosen preference may restore on later unparameterized visits.

### Workstream D — directories and status experience

The community artifact includes health and activity. The directory defaults to active communities and offers Active, No open jobs, With errors, and All filters. Inactive communities remain discoverable and are never deleted from the catalog merely because their open count is zero.

The public `/status` route provides:

- overall health summary and last completed synchronization;
- searchable, sortable table with Community, Status, Last successful sync, Open jobs, and Latest community posting;
- localized empty/error states;
- links from each community to its public profile.

The table recomposes into labeled rows on narrow screens and does not require horizontal scrolling for primary information.

### Workstream E — comparison and support

Candidates can select up to three opportunities. A persistent comparison tray appears after the first selection. `/compare?jobs=<id>,<id>` loads canonical records and compares title, company/community, salary, real job location, work model, technologies, seniority, freshness, publication date, and sources.

Missing fields display `Not supplied`; comparison never manufactures equality. Invalid or unavailable IDs are explained and omitted without breaking valid selections.

`Report a problem` is a normal `mailto:support@openings.dev` action with a localized subject and body containing the canonical job URL, primary source URL, and issue categories: closed, duplicate, incorrect location, or inappropriate content. No ticket database or form backend is introduced.

## Data flow

```text
GitHub repositories
  -> source collection with per-repository result
  -> deterministic enrichment
  -> duplicate grouping
  -> canonical opportunities + structured facets + community health
  -> static API artifacts
  -> Next.js static export
  -> URL discovery state + browser-local candidate state
```

## Compatibility and migration

- Static API schema advances once for the complete data-foundation contract.
- The web validates both required new structures and permitted optional fields.
- Legacy `country`, `region`, and `tags` remain during the transition but no longer drive candidate-facing categorization when structured data is present.
- Existing job URLs remain valid by resolving source IDs and prior public IDs to canonical IDs through an aliases artifact.

## Error handling

- A repository failure records safe public health state and retains its last successful timestamp.
- Unknown taxonomy values normalize to `other` or stay in source tags.
- Ambiguous locations remain unknown.
- Storage failures disable only local conveniences.
- Search/facet artifact mismatches fail the affected static view instead of fabricating data.
- Comparison tolerates partial job availability.
- Mail reporting remains available even when clipboard/share APIs are unavailable.

## Validation

### Data pipeline

- parser tests for multilingual location and taxonomy cases;
- negative tests for ambiguous location and operational labels;
- duplicate grouping tests, including generic-title safeguards;
- freshness boundary tests at 7, 30, and 90 days;
- status carry-forward tests after repository failure;
- static artifact schema and consistency tests;
- `npm run validate`.

### Web

- focused deterministic validation scripts for search ranking, filter semantics, storage migration, comparison URL parsing, and status artifacts;
- all six dictionaries satisfy the shared message type;
- responsive and keyboard review of filters, load-more, comparison, and status table;
- `npm run lint`, existing focused validation scripts, and `npm run build`.

## Delivery order

1. Pipeline data structures, enrichment, duplicate grouping, freshness, aliases, and status artifact.
2. Web artifact validation and compatibility.
3. Structured search, filters, shortcuts, and explicit load-more.
4. Local saved/viewed/preferences/new state.
5. Community health filters and `/status`.
6. Comparison and support email.
7. Full cross-repository validation and documentation review.
