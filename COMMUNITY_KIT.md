# Openings community kit

Give members one searchable view of the public jobs already shared in your GitHub repository. Openings keeps every result connected to the original listing, so your repository remains the source of truth.

## Find your community page

Replace `OWNER/REPOSITORY` with the two parts of your GitHub repository URL:

```txt
https://openings.dev/communities/OWNER/REPOSITORY
```

Only share the link after confirming that the page exists. If it does not, [request indexing](https://github.com/openings-dev/web/issues/new?template=source_repository.yml).

## Add a README badge

Copy this Markdown and replace `OWNER/REPOSITORY` in the destination URL:

```md
[![Listed on openings.dev](https://img.shields.io/badge/Listed_on-openings.dev-b0ec9c?labelColor=21302e)](https://openings.dev/communities/OWNER/REPOSITORY)
```

The badge gives contributors a compact path to the searchable community page without changing where jobs are published or maintained.

## Add a text link

```md
[Browse our public job listings on openings.dev](https://openings.dev/communities/OWNER/REPOSITORY)
```

## Share the page

Use this short message in a community post, newsletter, or social profile:

```text
Jobs shared by our community are now easier to browse on openings.dev:
https://openings.dev/communities/OWNER/REPOSITORY

Search and filter in one place, then open the original GitHub listing for current details and next steps.
```

## Request indexing

If your public GitHub repository regularly receives job listings, submit a [source repository request](https://github.com/openings-dev/web/issues/new?template=source_repository.yml) with two example issues. Requests are reviewed for public access, recognizable job content, and enough activity to support a useful page.

## Corrections and removal

Openings indexes public information and does not replace the original source. Use the [content correction form](https://github.com/openings-dev/web/issues/new?template=content_correction.yml) when a page needs to be corrected or removed. Do not include private information in a public issue.
