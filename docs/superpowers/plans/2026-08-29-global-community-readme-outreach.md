# Global Community README Outreach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evaluate every remaining openings.dev catalog repository and open one language-matched README pull request for each eligible source.

**Architecture:** Build a deterministic local inventory from the catalog and published snapshot indexes, enrich candidates with current GitHub and README evidence, then process eligible repositories in batches of at most 15. Each repository uses an isolated checkout and unique branch; repositories in the same GitHub fork network reuse one personal fork with independent branches.

**Tech Stack:** Node.js 20 ESM, JSON, Git, GitHub connector, GitHub browser interface, Markdown, openings.dev community profiles

---

### Task 1: Build the Global Candidate Inventory

**Files:**
- Read: `/Users/guilherme/Workspace/Dev/repositories/openings.dev/data-pipeline/src/modules/catalog/repositories.json`
- Read: `/Users/guilherme/Workspace/Dev/repositories/openings.dev/data-pipeline/snapshots/opportunities/countries/*/index.json`
- Create: `/private/tmp/openings-community-outreach-global/build-inventory.mjs`
- Create: `/private/tmp/openings-community-outreach-global/inventory.json`

- [ ] **Step 1: Create the isolated campaign directory**

Run:

```bash
mkdir -p /private/tmp/openings-community-outreach-global
```

Expected: the directory exists without changing any tracked repository.

- [ ] **Step 2: Create the inventory builder**

Use `apply_patch` to create `build-inventory.mjs`. The script must read the catalog, merge every country index's `byRepository` open issue count, exclude the ten recorded repositories, derive the canonical profile URL as `https://openings.dev/communities/<owner>/<repository>`, sort by descending open issue count and case-insensitive repository name, and write `{ generatedAt, totals, items }` to `inventory.json`.

The excluded repository set is exactly:

```js
new Set([
  "backend-br/vagas",
  "frontendbr/vagas",
  "qa-brasil/vagas",
  "DevOps-Brasil/Vagas",
  "datascience-br/vagas",
  "nodejsdevbr/vagas",
  "react-brasil/vagas",
  "phpdevbr/vagas",
  "FlutterComunidadeBR/vagas",
  "soujava/vagas-java",
]);
```

- [ ] **Step 3: Generate and validate the inventory**

Run:

```bash
node /private/tmp/openings-community-outreach-global/build-inventory.mjs
jq '.totals, (.items | length), ([.items[].repository] | unique | length)' /private/tmp/openings-community-outreach-global/inventory.json
```

Expected: item count and unique repository count match, all ten completed repositories are absent, and every item has repository, locale, open issue count, and canonical profile URL.

### Task 2: Triage Current Repository Eligibility

**Files:**
- Read remotely: candidate repository metadata, README, contribution files, pull request templates, and pull requests
- Modify: `/private/tmp/openings-community-outreach-global/inventory.json`
- Create: `/private/tmp/openings-community-outreach-global/exclusions.json`

- [ ] **Step 1: Exclude sources without open jobs**

Mark every item with `openIssues <= 0` as excluded with reason `no open jobs in the published snapshot`.

- [ ] **Step 2: Enrich remaining candidates in batches of 15**

For each item with open jobs, fetch repository metadata and `README.md`. Record default branch, archived state, owner type, README SHA, README text, and detected language. Check `CONTRIBUTING.md`, `.github/pull_request_template.md`, and `.github/PULL_REQUEST_TEMPLATE.md` when present.

Expected: archived repositories, missing READMEs, and repositories whose guidance prohibits the change receive factual exclusion records.

- [ ] **Step 3: Search for duplicate pull requests**

Search all pull request states for `openings.dev` within each candidate repository. Exclude any repository with an equivalent open or merged change and record its URL.

- [ ] **Step 4: Validate community pages and original issue links**

Open each remaining canonical profile in the authenticated browser, confirm the repository identifier, open the first result, and confirm `Open original listing` points to an issue in that repository.

Expected: broken, mismatched, or empty profiles are excluded before any fork or branch is created.

### Task 3: Prepare Language Templates

**Files:**
- Create: `/private/tmp/openings-community-outreach-global/language-templates.json`

- [ ] **Step 1: Create templates for all detected README languages**

Store natural README sentences and pull request bodies for English, Portuguese, Spanish, French, German, Italian, Dutch, Vietnamese, Simplified Chinese, and Traditional Chinese. Locale variants reuse their base language unless the README text requires a regional wording adjustment.

Every pull request body must contain four paragraphs: purpose, search and source behavior, README-only scope with adjustment offer, and a descriptive canonical link. No template may contain an em dash, endorsement claim, analytics parameter, or claim that openings.dev owns or verifies listings.

- [ ] **Step 2: Validate templates mechanically**

Run a Node validation that checks required placeholders `{community}` and `{url}`, rejects `—` and `–`, and confirms every detected language maps to a template.

Expected: zero missing templates and zero forbidden punctuation matches.

### Task 4: Prepare One Batch of Repository Branches

**Files:**
- Create per repository: `/private/tmp/openings-community-outreach-global/checkouts/<slug>/`
- Modify per repository: detected README file only
- Modify: `/private/tmp/openings-community-outreach-global/inventory.json`

- [ ] **Step 1: Resolve a usable personal fork**

For each batch item, locate an existing `GuilhermeAlbert` fork in the target's fork network. If none exists, create one with a unique repository name. When GitHub reports that a fork already exists, identify and reuse that fork rather than retrying creation.

- [ ] **Step 2: Create an isolated checkout from the current upstream default branch**

Clone the personal fork, add the target as `upstream`, fetch it, and create a unique branch named:

```text
docs/openings-community-<owner-slug>-<repo-slug>
```

Expected: `HEAD` starts at `upstream/<default-branch>` and never reuses an existing outreach branch.

- [ ] **Step 3: Insert the translated README sentence**

Place the language-matched sentence immediately after the existing job-discovery link or notification paragraph. For bilingual duplicated sections, add one translated sentence per section.

- [ ] **Step 4: Verify, commit, and push**

Run for each checkout:

```bash
git diff --check
git diff --name-only
git diff -- README.md
git add README.md
git commit -m "docs: add openings.dev community page"
git push -u origin HEAD
```

Expected: one commit reaches the personal fork and the diff contains only the approved README insertion or insertions.

### Task 5: Open and Verify One Pull Request Batch

**Files:**
- Modify: `/private/tmp/openings-community-outreach-global/inventory.json`
- Create or modify: `/private/tmp/openings-community-outreach-global/results.md`

- [ ] **Step 1: Open no more than 15 pull requests**

Use the GitHub compare interface with the exact upstream repository, current base branch, personal head repository, and unique head branch. Set the title to `docs: add openings.dev community page` and fill the translated body from `language-templates.json`.

- [ ] **Step 2: Verify every submitted pull request**

Fetch each pull request and confirm it is open, has the approved title and translated body, targets the recorded base branch, uses one commit, changes only the README, and contains the canonical profile URL.

- [ ] **Step 3: Record results and evaluate stop conditions**

Append repository, language, URL, state, placement, head fork, and notes to `results.md`. Check for account restrictions, three same-reason maintainer rejections, reusable translation errors, fork attribution failures, and systemic profile mismatches.

- [ ] **Step 4: Continue with the next batch**

Repeat Tasks 4 and 5 until every eligible inventory item has a verified pull request or a recorded exclusion reason.

### Task 6: Complete the Global Audit

**Files:**
- Read: `/private/tmp/openings-community-outreach-global/inventory.json`
- Read: `/private/tmp/openings-community-outreach-global/exclusions.json`
- Modify: `/private/tmp/openings-community-outreach-global/results.md`

- [ ] **Step 1: Re-fetch every new pull request**

Verify state, title, body, base, head, commit count, changed files, additions, deletions, canonical URL, and absence of em dashes.

- [ ] **Step 2: Reconcile inventory totals**

Run a validation that asserts:

```text
catalog candidates = verified new PRs + recorded exclusions
```

Expected: no candidate remains pending or unaccounted for.

- [ ] **Step 3: Produce the final report**

Summarize candidate count, verified pull request count, exclusion count by reason, language counts, stop-condition status, and links to the complete local results and exclusion files. Preserve all checkouts for maintainer follow-up.
