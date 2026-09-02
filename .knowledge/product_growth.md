# Product Growth System

> Define how Openings turns product usefulness, public data, and community participation into sustainable GitHub discovery.

## Objective

`openings-dev/web` is the official public repository for Openings and the single primary destination for GitHub stars. The growth system must increase qualified discovery without splitting the main call to action across `core`, `design-tokens`, `data-pipeline`, or the private mobile application.

Growth work must preserve the product truth: Openings is a discovery layer for technology jobs published through public GitHub communities. It does not own listings, verify employers, or guarantee availability.

## System boundaries

The program spans four public surfaces and one private distribution service:

- `openings-dev/web` owns the public product, repository presentation, reports, community growth surfaces, releases, roadmap, and contribution entry points.
- `openings-dev/data-pipeline` owns factual catalog totals, monthly report data, and deterministic community data.
- `openings-dev/awesome-github-issues-job-boards` owns the public curated-list presentation and its update workflow.
- `openings-dev/.github` owns the organization profile and directs visitors to the official repository.
- `openings-dev/social-publisher` owns controlled distribution of release, report, and new-community announcements through existing official channels.

The `feat/responsive-discovery-filters` branch remains separate. Product-growth work begins on `web/main`, and the first release is created only from `web/main` after its checks pass.

## Growth architecture

```text
data-pipeline
  ├── public totals and report snapshots
  ├── community catalog
  └── new-community facts
          ↓
web ← awesome list ← social-publisher
 ↓
openings-dev/web receives stars, issues, and contributors
```

The data pipeline is the only source for changing product counts. The web application and curated list consume published data; they do not maintain competing copies. Social publishing records durable state and fails closed so a retry cannot create duplicate posts.

## Repository discovery

The official repository uses focused topics that describe the product, audience, and implementation. Its social preview, README, organization profile, public releases, issues, and Discussions all point to the same repository identity.

Other Openings repositories may explain their role, but their primary project link directs visitors to `openings-dev/web`. Calls to star supporting repositories must not compete with the official repository CTA.

The organization profile prioritizes repositories in this order:

1. `web`
2. `awesome-github-issues-job-boards`
3. `data-pipeline`
4. `core`
5. `design-tokens`

## Visual direction

The approved growth direction is **Product proof**. Every acquisition surface explains the product, its value, and its factual scale before asking for a star.

The primary visual composition contains:

- the canonical monochrome Openings wordmark;
- the approved message, “Find tech jobs shared by GitHub communities.”;
- current open-job, community, and country totals;
- one representative opportunity card or result fragment;
- Warm Paper, Community Ink, controlled Brand Mint, Figtree, hairlines, and restrained elevation from the production design system.

The GitHub social preview uses a solid `1280 × 640` canvas. README visuals, community badges, and growth cards reuse the same hierarchy without becoming identical exports. The Data editorial direction is reserved for monthly reports and their social assets.

## README conversion hierarchy

The first README viewport follows this order:

1. canonical wordmark;
2. product promise;
3. concise mechanism and provenance statement;
4. primary product CTA and secondary star and contribution CTAs;
5. live factual totals sourced from the public manifest;
6. product-proof visual;
7. differentiation, behavior, architecture, and contribution detail.

Dynamic values use the public data manifest or badges that read that manifest. Manually copied totals must not become stale proof.

## Releases and changelog

Version tags are created from validated `web/main` commits. GitHub release notes are categorized through repository configuration and generated from merged changes. The first public release is `v0.1.0`; subsequent releases use the same workflow rather than hand-built release pages.

Release creation remains an explicit maintainer action. Automation validates the tag and produces consistent notes, but it does not infer a production release from every push to `main`.

## Community participation

The repository provides structured forms for bugs, product suggestions, content corrections, and source-community requests. Labels used by forms must exist in the repository. Public Discussions provide a lower-friction space for questions, ideas, and showcases.

A small, maintained set of `good first issue` and `help wanted` tasks gives external contributors bounded entry points. Tasks must contain acceptance criteria, affected scope, validation steps, and enough context to complete without private knowledge.

The public roadmap communicates current, next, and later outcomes without promising dates. Completed work moves to release notes rather than accumulating indefinitely in the roadmap.

## Community acquisition kit

Every canonical community page is already shareable and becomes the source for its outreach assets. The page provides:

- a generic branded “Jobs indexed by openings.dev” badge linked to that community’s canonical page;
- Markdown that can be copied into a community README;
- a direct share action;
- a path for maintainers to request inclusion or correction;
- a short explanation that the original repository remains the source of truth.

The badge image is one maintained static asset. The destination URL carries the encoded community identity, avoiding hundreds of generated badge files.

The maintainer guide contains the same kit and explains eligibility, provenance, updates, removal, and badge installation. Outreach materials are prepared for respectful maintainer contact; they do not automate unsolicited pull requests or messages.

## Curated-list acquisition

`awesome-github-issues-job-boards` is an acquisition surface, not a competing primary product repository. A deterministic generator reads the public community catalog, groups entries by region and country, reports the catalog date and totals, and produces stable Markdown.

Its validation fails when generated output is stale. A scheduled workflow checks the source catalog and commits only meaningful changes. The README prominently connects the curated resource to the searchable Openings product and official `web` repository.

Submission preparation records suitable public directories, their contribution requirements, and ready-to-review descriptions. It does not create external pull requests automatically.

## Public reports

The data pipeline produces immutable monthly report records from the same normalized dataset used by the product. Each record includes the reporting month, generation time, methodology version, totals, geographic distribution, technology signals, work-model signals, and salary-disclosure coverage when supported by the data.

The web application owns `/reports` and `/reports/[month]`. The index lists available records, and a report page renders only metrics that the report contract supplies. Every page describes methodology, data limitations, generation time, and links back to searchable jobs and original public sources.

Reports use the approved Data editorial visual variant while retaining the Openings design system. Social metadata and share images are generated statically for each report.

## Traffic history

GitHub exposes a rolling traffic window, so a daily workflow stores repository views, unique visitors, clones, referrers, and popular paths before older data expires. The collection workflow uses a restricted token supplied through repository secrets.

Collected data lives on the dedicated `growth-metrics` branch, not in `main`. It stores aggregate repository metrics only and never records visitor identities or credentials. Missing credentials or API failures stop the run without fabricating values.

## Social distribution

The social publisher adds deterministic announcement types for:

- a newly accepted community;
- a public web release;
- a newly published monthly report.

Announcements reuse existing network clients, credentials, rendering foundations, verification, and durable publication state. Link-capable networks receive the canonical URL and platform-appropriate copy. Visual networks receive assets derived from the Product proof or Data editorial systems.

Publication remains disabled by default for each new announcement type. A dry run and one controlled publication must pass before its scheduled flag can be enabled. Scheduled selection is rate-limited, idempotent, and cannot interrupt the existing job or editorial publication guarantees.

## Measurement

The primary measures are qualified GitHub visitors, stars gained, external contributors, community backlinks, and referral sources. Product usage remains a separate measure and must not be reduced to repository popularity.

The first operating targets are:

- 500 unique GitHub visitors in a 30-day period;
- 50 qualified stars;
- 10 community backlinks;
- 5 external contributors;
- one release every two weeks while meaningful changes exist;
- three useful social publications per week across the existing content system.

Targets guide review and experimentation; they are not product claims displayed to candidates.

## Validation and safety

Each repository keeps its own validation boundary:

- web changes run lint, relevant contract checks, and a full static build;
- data changes run the complete data-pipeline validation;
- curated-list generation is deterministic and idempotent;
- social changes run full validation and dry-run rendering;
- GitHub settings are read back after mutation;
- releases are created only from the intended validated `main` commit.

No growth feature may add authentication, a backend proxy, private candidate tracking, invented market claims, automated unsolicited outreach, or a second design system.
