<p align="center">
  <a href="https://openings.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="public/openings-wordmark-dark.svg" />
      <img src="public/openings-wordmark-light.svg" alt="openings.dev" width="260" />
    </picture>
  </a>
</p>

<p align="center">
  <strong>Find tech jobs shared by GitHub communities.</strong>
</p>

<p align="center">
  Openings brings public job listings into one focused search experience<br />
  while keeping every opportunity connected to its original source.
</p>

<p align="center">
  <a href="https://openings.dev/#opportunity-results"><strong>Search open jobs</strong></a>
  ·
  <a href="https://openings.dev/communities">Browse communities</a>
  ·
  <a href="https://openings.dev/docs/overview">Read the overview</a>
  ·
  <a href="https://github.com/openings-dev/web">Star on GitHub</a>
</p>

<p align="center">
  <a href="https://github.com/openings-dev/web/stargazers"><img src="https://img.shields.io/github/stars/openings-dev/web" alt="GitHub stars" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/openings-dev/web" alt="MIT license" /></a>
  <a href="https://github.com/openings-dev/web/graphs/contributors"><img src="https://img.shields.io/github/contributors/openings-dev/web" alt="Project contributors" /></a>
</p>

<p align="center">
  <a href="https://openings.dev/#opportunity-results">
    <img src="https://openings.dev/opengraph-image.png" alt="Openings makes technology jobs shared through public GitHub communities easier to search and review" width="100%" />
  </a>
</p>

## The jobs are already out there

Technology communities publish job openings in public GitHub issues. Those listings are useful, direct, and easy to miss when they are spread across many repositories.

Openings makes that public activity easier to discover. Instead of checking communities one by one, candidates get a searchable view of supported listings, with the repository, community, author, location, work model, seniority, and stack still attached.

You spend less time jumping between repositories and get a clearer path to the listings worth opening.

## Find the role. Keep the context.

With Openings, you can:

- search jobs by title, stack, seniority, location, and work model;
- rank searches by relevance with synonyms and conservative typo tolerance;
- filter by real job geography, recency, salary disclosure, employment type, language, and structured technology taxonomy;
- save jobs and preferences in the current browser, see what is new since the previous visit, and compare up to three jobs through a shareable URL;
- browse dedicated pages for [communities](https://openings.dev/communities) and [GitHub authors](https://openings.dev/authors);
- inspect public [community synchronization status](https://openings.dev/status), including the latest successful sync and posting date;
- read each job in a clean, consistent layout;
- share a direct job or community page;
- continue to the original public listing for current details and next steps.

Openings is a discovery layer, not another job board asking communities to publish the same role twice.

Saved jobs, viewed state, and preferences stay in the current browser. They do not require an account and do not sync across devices.

## How it works

The public [`openings-dev/data-pipeline`](https://github.com/openings-dev/data-pipeline) project connects GitHub communities to the Openings experience.

1. **Communities publish jobs.** Maintainers and members share openings through public issues in supported GitHub repositories.
2. **The data project organizes them.** The community catalog and generated public data files turn those scattered issues into a consistent index.
3. **Openings makes them discoverable.** The website presents searchable jobs and dedicated profiles, then sends candidates back to the original listing.

```text
Public GitHub issues → openings-dev/data-pipeline → openings.dev → original listing
```

The data pipeline and the frontend are both public. Anyone can inspect how a listing reaches the product.

## Built for candidates and communities

### For candidates

Openings reduces the work of monitoring separate repositories. You can narrow the catalog quickly, compare relevant context, and decide which original listings are worth opening.

### For communities

Each supported community gets a shareable page for its open jobs. That page can live in a README, website, or social profile while the original GitHub issue remains the destination for complete details.

[Find your community](https://openings.dev/communities) or read the [community listing guide](https://openings.dev/docs/maintainers).

## The original listing remains the source of truth

Openings helps people discover public job listings. It does not own those listings, verify employers, guarantee that a role is still available, or manage applications.

Before applying, candidates should confirm the requirements, availability, contact information, and next steps in the original public source.

## Built in public

Openings grows through two open repositories:

- [`openings-dev/web`](https://github.com/openings-dev/web) contains the product experience;
- [`openings-dev/data-pipeline`](https://github.com/openings-dev/data-pipeline) contains the community catalog and public data workflow.

You can help by improving the experience, refining the documentation, or expanding the supported community catalog. Start with the [contribution guide](./CONTRIBUTING.md), and leave a star if you want to follow the project as it grows.

## Want the technical details?

Architecture, public data files, local development, integration details, and contribution workflows live in the product documentation.

**[Read the Openings project overview →](https://openings.dev/docs/overview)**

## License

Openings is available under the [MIT License](./LICENSE).
