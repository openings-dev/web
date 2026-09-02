# Contributing to openings.dev

Thanks for improving `openings.dev`.

## Scope

This repository contains the static Next.js front-end. It does not store or generate opportunity data.

Use this repository for:

- UI and UX improvements.
- Routing, static page, and accessibility fixes.
- Remote data service improvements under `lib/opportunities`.
- Documentation updates for the front-end.

Use [`openings-dev/data-pipeline`](https://github.com/openings-dev/data-pipeline) for:

- Source repository catalog changes.
- GitHub ingestion and normalization logic.
- Snapshot generation and static API files.

## Choose a contribution

- Browse [`good first issue`](https://github.com/openings-dev/web/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22) tasks for focused changes with a defined outcome.
- Open a [Source repository request](https://github.com/openings-dev/web/issues/new?template=source_repository.yml) when a public GitHub community regularly publishes job listings.
- Use the [content correction form](https://github.com/openings-dev/web/issues/new?template=content_correction.yml) for inaccurate or removable indexed content.
- Start in [GitHub Discussions](https://github.com/openings-dev/web/discussions) when the idea still needs exploration.
- Review the [public roadmap](./ROADMAP.md) for the current direction.

## Data Rules

- Do not add local job data, mock datasets, fixtures, `db.json`, or JSON snapshots to the front-end.
- Do not import local `.json` files for opportunity data.
- Do not reintroduce a local `/api/opportunities` route.
- Keep raw data URL construction in `lib/opportunities/static-api.ts`.
- Keep static API reads in `lib/opportunities/api.ts`.
- Keep snapshot reads in `lib/opportunities/snapshot.ts`.

## Development Setup

Requirements:

- Node.js `>=20.9.0`
- npm

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Only create `.env.local` when testing another remote data branch:

```bash
NEXT_PUBLIC_OPENINGS_DATA_BASE_URL=https://raw.githubusercontent.com/openings-dev/data-pipeline/main/snapshots/opportunities
NEXT_PUBLIC_OPENINGS_DATA_REPOSITORY_BASE_URL=https://raw.githubusercontent.com/openings-dev/data-pipeline/main
```

## Project Structure

```txt
app/                      App Router routes and route-local UI
components/               shared shell, providers, icons, and UI primitives
lib/opportunities/        remote data services, routing helpers, and domain types
lib/translations/         localized UI messages
lib/utils/                shared utilities
docs/                     localized markdown rendered by the app
```

## Pull Request Workflow

1. Create a branch from `main`.
2. Keep the change focused.
3. Run checks:

```bash
npm run lint
npm run build
```

4. Open a pull request with:

- Clear summary.
- Screenshots for visual changes.
- Test notes listing the commands you ran.
- Any data source override used during testing.

## Pull Request Checklist

- [ ] No local data files or JSON imports were added.
- [ ] Remote data access remains centralized in `lib/opportunities`.
- [ ] Components stay focused and reusable.
- [ ] Documentation changed when behavior or setup changed.
- [ ] `npm run lint` and `npm run build` pass locally.

## Code of Conduct

By participating, you agree to follow the [Code of Conduct](https://github.com/openings-dev/web/blob/main/CODE_OF_CONDUCT.md).
