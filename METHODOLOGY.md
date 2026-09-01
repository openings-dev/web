# Data methodology

## Purpose and scope

openings.dev makes public technology jobs from community-managed GitHub repositories easier to discover. It indexes and organizes public listings; it is not the employer, recruiter, or owner of those listings.

## Eligible sources

A source must be a public GitHub repository whose issues are intentionally used to publish jobs for a community or organization. Each source is reviewed before joining the catalog. When a repository uses job labels, only the configured labels are collected; repositories with a dedicated job board may be collected without labels. Inclusion does not imply endorsement.

## Sync cadence and issue state

The scheduled pipeline attempts to synchronize sources every three hours. Open issues become candidates for the public snapshot; closed issues are excluded on a later successful run. `/status` publishes the last successful synchronization, open-job count, latest community post, and a 30-day operational summary without raw provider errors. GitHub availability and rate limits can delay updates.

## Geography

Source geography and job geography are separate. A community country describes the source; it does not prove where a job is located. Job country, city, subdivision, work model, and remote restrictions are taken from explicit structured fields or carefully inferred from the listing. When evidence is insufficient, the value stays unknown. “Remote” never automatically means worldwide.

## Taxonomy

GitHub labels remain available as source tags, but not every label becomes an employment category. Curated rules map evidence into areas, technologies, seniority, employment types, work models, and languages. Operational labels such as moderation or publication state are excluded from the job taxonomy.

## Duplicate grouping

The pipeline groups listings only when it finds strong shared evidence, such as the same specific application URL or stable normalized job signals. Generic company homepages, career indexes, articles, and repository documentation are not sufficient. One canonical job is displayed with links to every retained source. Heuristics can still miss duplicates or group an edge case incorrectly.

## Freshness

Age is calculated from the original publication time at snapshot generation. Listings up to 30 days old are `fresh`, listings from 31 to 90 days are `aging`, and older listings are `stale`. Filters for the last 7, 30, and 90 days use the same publication timestamp. A recent timestamp does not guarantee that an employer is still accepting applications.

## Field provenance

Location, salary, seniority, and work model are labeled `declared`, `inferred`, or `unknown`. `declared` means the source explicitly provided the fact; `inferred` means a deterministic parser derived it from listing evidence; `unknown` means the system did not find enough evidence. Deduplicated jobs keep the strongest available evidence while retaining all source links.

## Sponsored listings

Sponsored jobs are accepted only through the dedicated structured source and are visibly marked as sponsored. They may appear before organic results, but are never presented as organic or silently mixed into the list. Sponsorship does not change the provenance rules or guarantee job quality, availability, or employer conduct.

## Corrections and support

Use the report action or email support@openings.dev to report a closed job, duplicate, wrong location, inappropriate content, source correction, or removal request. Reports create a support message; they do not automatically alter the public source. Corrections are reviewed against the original listing and applied in the catalog, parser, or source when appropriate.

## Privacy and observability

Sentry receives sanitized technical failures with default personal-data collection disabled, no session replay, and no raw provider headers or pipeline error messages. Mixpanel loads only after explicit analytics consent and receives a small allowlist of product events. Autocapture, session recording, raw search text, email addresses, full URLs, and advertising profiles are not collected. Preferences and saved jobs remain in local browser storage unless the user removes them.

## Limitations and authority

Public data can be incomplete, outdated, inconsistent, or temporarily unavailable. Parsing, translation, salary interpretation, and duplicate grouping are deterministic but imperfect. openings.dev does not verify employers, employment terms, legal eligibility, or application outcomes. The original GitHub issue is authoritative for current details and application instructions; users should verify it before acting.
