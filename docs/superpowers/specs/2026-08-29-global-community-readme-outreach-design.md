# Global Community README Outreach Design

## Goal

Expand the openings.dev README outreach from the first ten Brazilian communities to every remaining eligible GitHub repository in the catalog. Each pull request adds the repository's canonical openings.dev community page in the language used by the relevant README section.

## Scope

The starting catalog contains 185 repositories across 24 locale variants. Exclude the ten repositories that already have an openings.dev pull request from this campaign. Evaluate all other repositories regardless of whether the owner is a GitHub organization or a personal account.

The campaign runs in batches of at most 15 pull requests and continues without a confirmation gate between batches. Order eligible repositories by open job count, then by repository name for deterministic execution.

## Eligibility

A repository is eligible only when all of these checks pass immediately before submission:

- the repository is public, unarchived, and accepts pull requests;
- the openings.dev community page loads and identifies the repository;
- the page contains at least one open job linked to an issue in the repository;
- the repository has a readable README with a contextual job-discovery location;
- contribution guidance does not prohibit the documentation link;
- no open or recently merged pull request already proposes openings.dev;
- the target is not one of the ten repositories already handled;
- the proposed branch changes only the README and adds no tracking parameters, images, badges, dependencies, or unrelated edits.

Record every excluded repository with a factual reason. Do not create a pull request when eligibility is ambiguous.

## Language Selection

Detect the language from the README text around the job-discovery section. Use catalog locale only as a fallback. For a bilingual README, use the language of the section where the sentence is inserted. When the README repeats the same job-discovery content in multiple languages, add the translated sentence to each matching section in the same pull request and record the additional insertions.

Translate both the README sentence and the pull request description. Preserve the concise structure of the approved Portuguese copy:

1. State that the pull request adds the community's openings.dev page to the README.
2. Explain that the page gathers public jobs and supports search and filtering.
3. State that each result links to the original issue for current details and application instructions.
4. State that only the README changed and offer to adjust wording or placement.
5. End with a descriptive link to the canonical profile.

Translations must sound natural in the target language, avoid promotional claims, avoid em dashes, and preserve the repository as the source for current information.

## README Change

Insert one short contextual paragraph immediately after an existing link to issues, jobs, listings, a job board, or notification guidance. Adapt the community name to the README's public naming. The sentence must say that jobs can also be searched and filtered on openings.dev and that every result continues to the original issue.

Do not add a new promotional section when an existing discovery paragraph is available. Do not place openings.dev among lists of unrelated source repositories when a job-discovery location is available.

## Git and Fork Strategy

Use one commit per upstream repository with title and commit message:

```text
docs: add openings.dev community page
```

Create a unique branch per upstream repository. A personal GitHub account may have only one fork in a fork network. When multiple targets share a network, reuse the existing personal fork and push distinct branches based on each target's current default branch. Never modify or force-push an existing outreach branch.

Use isolated local checkouts under `/private/tmp/openings-community-outreach-global/`. Preserve them after submission so maintainer requests can be handled without reconstructing branches.

## Validation

Before each pull request:

- confirm the default branch and current upstream commit;
- confirm the openings.dev page and one original issue link;
- inspect README, contribution guidance, and pull request templates;
- search all pull request states for `openings.dev`;
- run `git diff --check`;
- confirm the diff changes only the README;
- confirm the canonical URL contains no analytics parameters;
- confirm the copy matches the README language.

After each pull request:

- confirm the pull request is open;
- confirm the title, body, base, and head branch;
- confirm the changed-file count and rendered diff;
- record the URL, language, placement, and initial state.

## Stop Conditions

Continue through all batches unless one of these conditions occurs:

- GitHub blocks or restricts the account;
- three maintainers reject the campaign for the same reason;
- a translation error affects a reusable language template;
- authentication or fork-network state prevents safe attribution;
- repository data no longer matches openings.dev in a systemic way.

If a stop condition occurs, do not open more pull requests. Record the evidence and request user direction.

## Success Criteria

The campaign is complete when every remaining catalog repository has either:

- one verified openings.dev pull request; or
- one recorded exclusion reason.

The final report must include all new pull request URLs, languages, initial states, placements, fork-network notes, exclusions, and a total audit count. Do not claim acceptance or campaign performance before maintainers respond.
