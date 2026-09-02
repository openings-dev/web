# Openings Knowledge Base

> Index factual architecture and implementation guidance for the Openings frontend.

## Current product

Openings is a statically exported Next.js application for discovering technology opportunities published in public GitHub community repositories. It loads generated JSON from the separate `openings-dev/data-pipeline` repository and does not own a backend or a local opportunity dataset.

## Documentation map

- [Project overview](project_overview.md) — product scope, stack, routes, and constraints
- [Product growth system](product_growth.md) — public repository, community acquisition, reports, releases, and distribution
- [Architecture overview](architecture/overview.md) — runtime and source ownership
- [Remote data flow](architecture/remote_data_flow.md) — static API, snapshots, and configuration
- [State management](architecture/state_management.md) — URL, local, provider, and server-owned state
- [Components](patterns/components.md) — ownership, folders, props, and rendering boundaries
- [Hooks](patterns/hooks.md) — stateful behavior and effect rules
- [Services](patterns/services.md) — functional remote-data boundaries
- [Internationalization](patterns/internationalization.md) — six-locale message contracts
- [Content and routes](patterns/content_and_routes.md) — Markdown documents and App Router rules
- [Naming conventions](best_practices/naming_conventions.md) — source and symbol naming
- [Styling](best_practices/styling.md) — Tailwind, CVA, themes, and visual preservation
- [Performance](best_practices/performance.md) — static rendering and client bundle discipline
- [Design system](design_system/README.md) — index for visual, brand, copy, and interaction guidance
  - [Foundations](design_system/foundations.md)
  - [Brand and copy](design_system/brand_and_copy.md)
  - [Experience patterns](design_system/experience_patterns.md)
  - [Accessibility and motion](design_system/accessibility_and_motion.md)

## Authority

[`AGENTS.md`](../AGENTS.md) is canonical. This knowledge base expands its rules with verified project detail. When documentation and code disagree, inspect both and explicitly decide whether the implementation is legacy debt or the documentation is stale.

Local implementation plans may describe temporary delivery steps, but they are not part of the versioned repository. This knowledge base records only durable standards.
