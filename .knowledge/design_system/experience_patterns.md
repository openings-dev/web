# Experience Patterns

> Apply one design system at the density required by each Openings journey.

## Public discovery

The homepage combines an asymmetric editorial hero, primary search, factual live proof, a representative opportunity, concise mechanism blocks, and immediate paths into results, communities, and publishers. It is not a generic SaaS landing page and must not delay the first useful opportunity behind a long feature parade.

## Opportunity workspace

Opportunity discovery prioritizes scan speed. Quick search, location, and stack remain visible. Advanced filters remain in the accessible dialog. Result count, data recency, sorting, and view mode form one compact result bar.

The unparameterized workspace is global. Preset links use the same URL contract as the filters. Results load in explicit batches of twenty; the interface never relies on an automatic infinite-scroll trigger. New badges disappear when a job is viewed, saved jobs remain browser-local, and the comparison tray links to the shareable `/compare` route.

List and grid use distinct information compositions. Selecting a result opens the same fullscreen native dialog at every breakpoint, preserving the discovery context behind it. The canonical `/jobs/<id>` page reuses the same Product Sheet information hierarchy for direct visits and sharing.

Job, community, and GitHub-author social previews use route-specific 1200×630 Product Sheet cards generated from validated build-time data. They use the canonical wordmark and tokens, omit absent optional fields, and never introduce remote avatars, fake listings, or unsupported claims.

Opportunity cards show company/community, semantic role heading, salary/work model/location, stack/seniority, publisher/date, and source context in that order. Do not duplicate repository metadata.

## Shareable profiles

Community and publisher URLs are identity-led destinations suitable for social profiles and READMEs. They expose avatar or monogram, name, handle/repository, concise description, real role count, location and activity context, `See open roles`, `Share profile`, and compact listings.

Do not render a profile merely as a filter applied to the generic opportunity hero.

## Directories

Use one discovery control area and an unboxed entity collection. Avoid hero card + filter card + location card + outer list card + inner card nesting. Entity cards prioritize identity, open-role count, recent activity, and one clear destination action.

Community activity has four explicit views: active, no openings, synchronization errors, and all. The status route provides the same health model in a searchable, sortable table with labeled mobile rows.

## Documentation

Desktop documentation uses a navigation rail, readable article, and optional table of contents. The article has no heavy outer card. Headings expose anchors; Markdown tables, code, callouts, and links have complete light and dark states. Mobile navigation preserves reading order and touch targets.

## Design-system showcase

The static showcase route imports production tokens and primitives. It documents brand assets, foundations, components, states, responsive compositions, icon rules, and approved copy. It must not duplicate components with showcase-only implementations.

## Shell

Public navigation is quiet and unboxed. The footer uses a full-width Night surface, real link groups, concise product context, and an original Openings composition. Marketing animation does not run through every shell item.
