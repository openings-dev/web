# Remote Data Flow

> Document the public static data contract consumed by Openings.

## Sources

The default snapshot base is `https://raw.githubusercontent.com/openings-dev/data-pipeline/main/snapshots/opportunities`. The default repository base is `https://raw.githubusercontent.com/openings-dev/data-pipeline/main`.

Browser-safe overrides use `NEXT_PUBLIC_OPENINGS_DATA_BASE_URL` and `NEXT_PUBLIC_OPENINGS_DATA_REPOSITORY_BASE_URL`. Build-time overrides use `OPENINGS_DATA_BASE_URL`, `OPENINGS_DATA_REPOSITORY_BASE_URL`, and `OPENINGS_DATA_SNAPSHOT_URL`. Preserve the precedence implemented in `lib/opportunities/static-api.ts` and `lib/opportunities/snapshot.ts`.

## Dataset boundaries

- `api/manifest.json` describes schema 6, generated files, counts, and structured facets.
- order, lookup, page, canonical job, alias, and weighted search files support opportunity lists, old links, and details.
- `api/status.json` carries sanitized per-community health, last successful synchronization, open-job count, and latest posting date.
- Canonical jobs retain every public source while high-confidence duplicates are displayed once. Unknown job locations stay unknown instead of inheriting repository geography.
- `index.json` and country shards support static community and author discovery.
- the remote repository catalog supplies valid repository filters.

## Request flow

```text
Route or feature controller
  -> domain function in lib/opportunities
    -> URL builder and native fetch
      -> public raw JSON
        -> typed normalization
          -> serializable UI props or feature state
```

## Rules

- Keep URL construction centralized.
- Validate unknown JSON before treating it as a domain object.
- Keep fetch and parsing functions independent from React.
- Preserve useful request errors instead of silently manufacturing domain data.
- Do not add frontend-local snapshots, mocks, API routes, credentials, retries, or framework-specific service classes.
- Split large modules by responsibility only when the resulting API is concrete and reusable.
