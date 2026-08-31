# Sponsored Opportunities Pilot Design

**Status:** Approved for implementation on 2026-08-31

## Goal

Create a transparent, manually operated paid-placement pilot for Openings. Employers request a sponsored job through a public Openings-owned GitHub repository. Once payment and content are approved, the job appears before matching organic results for up to 30 days.

The pilot validates willingness to pay without adding authentication, checkout, a billing backend, or an advertiser dashboard.

## Confirmed product decisions

- Campaign activation and payment handling are manual.
- A campaign lasts up to 30 days and ends sooner when the job is withdrawn or filled.
- Sponsored jobs appear before organic jobs in every listing where they match the active filters.
- Sponsorship is disclosed on cards and job details.
- A compact global banner appears below the header on every public route.
- The banner directs advertisers to a structured request in `openings-dev/jobs`.
- The current GitHub issue remains the public source of truth for a sponsored job.

## Approaches considered

### 1. Approval label in an Openings-owned jobs repository — selected

Requests are created in `openings-dev/jobs`. A maintainer applies a reserved `sponsored` label only after content and payment approval. The data pipeline fetches only issues with that label and marks the resulting opportunities as sponsored.

This gives the pilot a clear operational gate, keeps the workflow inspectable, and prevents unpaid public issues from reaching production.

### 2. Every open issue is sponsored

Treating every open issue in the repository as active would require less pipeline logic, but anyone could publish an unpaid placement. This is not acceptable.

### 3. Separate campaign manifest

A campaign file mapping existing opportunities to paid placements would support renewals and sponsoring jobs from third-party repositories. It would also create a second source of truth and more maintenance than the pilot needs. It remains a possible post-pilot direction.

## Advertiser and maintainer flow

1. The advertiser follows the global banner to the `openings-dev/jobs` Issue Form.
2. The form collects public job information and clearly states that submitting it does not activate placement.
3. A maintainer reviews the content and coordinates payment manually through the existing Openings support channel.
4. When approved, the maintainer applies the protected operational label `sponsored` and records the 30-day end date in a maintainer comment.
5. The next successful data-pipeline publication includes the job as sponsored.
6. When 30 days pass, or the job is filled or withdrawn, the maintainer closes the issue. The next publication removes it from open results.

Unapproved requests use the `ad-request` label supplied by the issue template. Only maintainers apply `sponsored`.

## Sponsored job repository

The new public repository is named `openings-dev/jobs`. Its initial contents are deliberately small:

- `README.md` explains the offer, the public nature of issues, the manual approval process, the 30-day term, and the source-of-truth boundary.
- `.github/ISSUE_TEMPLATE/sponsored-job.yml` collects the role title, company, country, region, location detail, work model, seniority, stack, salary when desired, description, application instructions, and confirmation of the public terms.
- `.github/ISSUE_TEMPLATE/config.yml` disables blank issues and links support.
- `CONTRIBUTING.md` documents advertiser submission and maintainer activation/expiry steps.
- `LICENSE` uses the same MIT baseline as the existing public Openings repositories.

The issue form must not request payment details, secrets, personal addresses, or private contact information. Public copy directs sensitive coordination to `support@openings.dev`.

## Data-pipeline architecture

### Catalog configuration

The source catalog gains optional fields that keep special behavior explicit:

```json
{
  "repository": "openings-dev/jobs",
  "requiredLabels": ["sponsored"],
  "issueMetadataFormat": "openings-sponsored-job-v1",
  "promotionType": "sponsored"
}
```

Ordinary community entries omit these fields and preserve current behavior.

### Collection and normalization

The GitHub client accepts optional required labels and sends them through GitHub's issue query. The repository processor also checks returned labels defensively before mapping an issue.

A focused parser reads fields created by the sponsored-job Issue Form. It overrides repository-level geography for this mixed-location repository and adds normalized work-model, seniority, and stack values to the opportunity tags. Invalid or missing structured fields do not invent values; the mapper falls back to the catalog's `Global` geography and existing safe extraction behavior.

Mapped sponsored records gain this optional contract:

```json
{
  "promotion": {
    "type": "sponsored"
  }
}
```

The field is absent for organic opportunities.

### Static API and ordering

The static API schema advances to version 5. It publishes a promotions index containing sponsored opportunity IDs, and the manifest references that file and reports a sponsored total.

The canonical comparison is:

1. sponsored before organic;
2. selected date direction within each group;
3. stable opportunity ID as the final tie-breaker.

The server-side static API and browser-side filtering use the same rule. Changing from newest to oldest never places organic jobs above sponsored jobs. Filters are applied before priority, so a sponsored job never appears when it does not match the search, repository, author, geography, or tag filters.

## Web experience

### Global advertiser banner

`AppShell` renders a shared banner immediately below the header and before the main content. The recommended visual is the global mint editorial rail shown in the visual companion:

- one concise benefit statement;
- a factual 30-day term;
- one dark, high-contrast action leading to the issue form;
- no fake urgency, price, social proof, or guaranteed performance claims;
- no dismissal control in the pilot, avoiding persistence and hydration complexity;
- compact recomposition on narrow screens instead of a floating overlay.

The banner is visible in all six locales, both themes, and every public route. It stays in normal document flow so it cannot cover navigation, filters, dialogs, or content.

Recommended Portuguese copy:

- Message: `Faça sua vaga chegar primeiro.`
- Detail: `Destaque por 30 dias no Openings.`
- Action: `Anunciar uma vaga`

Other locales receive natural adaptations with the same claim boundary.

### Sponsored result disclosure

Sponsored cards receive a compact localized `Sponsored` badge before the title. The badge uses a controlled mint surface and accessible dark text. A subtle semantic edge may reinforce placement, but the card retains the existing information hierarchy and interaction.

The same disclosure appears in the fullscreen details experience and canonical job page. Accessible labels include the sponsorship state without replacing the visible text. Promotion does not imply employer verification, job quality, or candidate fit.

### Navigation destination

`EXTERNAL_ROUTES` owns the issue-form URL. The link opens in a new tab with the existing external-link safety attributes. The interface remains useful if there are no active sponsored jobs; only ordering and badges depend on promotion data.

## Error handling and compatibility

- A banner link remains a normal external link and needs no client request state.
- Missing promotion data is treated as organic, never as sponsored.
- Unknown promotion types fail static artifact validation instead of silently gaining priority.
- Ordinary source repositories keep their current collection and mapping behavior.
- An unapproved request cannot enter the dataset because both the GitHub query and repository processor enforce required labels.
- Closed sponsored issues remain part of historical repository shards but are excluded from open static API results, matching current behavior.
- No campaign promise depends on a live request from the browser; publication follows the existing scheduled snapshot lifecycle.

## Accessibility and localization

- All visible and accessible banner and badge text lives in the typed dictionaries for English, Portuguese, Spanish, Italian, French, and German.
- The banner action has a clear accessible name and visible focus state.
- Mint is a surface, not small foreground text; the badge uses an accessible dark foreground.
- The normal-flow banner does not create a focus trap, motion requirement, or content obstruction.
- Sponsorship is communicated in text and does not rely on color alone.

## Validation

### Data pipeline

- Unit tests cover required-label filtering, structured Issue Form parsing, promotion mapping, and sponsored-first ordering in both date directions.
- Static artifact validation covers schema version 5, the promotions index, manifest references, totals, and optional promotion records.
- `npm run validate` passes.

### Web

- Focused validation covers promotion parsing and stable sponsored-first sorting.
- Existing static artifact consistency checks include the promotions index.
- All six dictionaries satisfy the shared message type.
- `npm run lint` and `npm run build` pass.
- The exported result is visually inspected on desktop and mobile in light and dark themes, including the home page, a directory page, a sponsored card, and sponsored job details.

### Repository workflow

- The issue template renders successfully on GitHub.
- A request starts with `ad-request`, not `sponsored`.
- The README and contributor guide state the manual 30-day lifecycle and public-data warning.

## Out of scope

- Built-in checkout or payment-provider integration
- Authentication or advertiser accounts
- An advertiser dashboard or campaign analytics
- Automated expiry, renewals, refunds, or invoices
- Pricing experiments or multiple placement tiers
- Sponsoring an existing third-party listing without reposting it in `openings-dev/jobs`
- Guarantees about traffic, applicants, employer verification, or hiring outcomes

## Success criteria

The pilot is complete when an approved `openings-dev/jobs` issue can flow through the existing data publication process, appear before matching organic results with clear disclosure for up to 30 days, and be removed from open results by closing the issue, while the global banner gives advertisers a consistent path to request the placement.
