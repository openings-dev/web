# Community README Outreach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open five focused pull requests that add each selected Brazilian job community's canonical openings.dev profile to its README.

**Architecture:** Treat every upstream repository as an isolated documentation change created from its current default branch. A shared eligibility pass validates the community page, contribution policy, duplicate-PR risk, and README placement; each accepted target then receives one branch, one README-only commit, and one independently verified pull request.

**Tech Stack:** Git, GitHub CLI, GitHub web interface, Markdown, openings.dev static community profiles

---

### Task 1: Restore GitHub Access and Prepare an Isolated Outreach Workspace

**Files:**
- Create locally: `/private/tmp/openings-community-outreach/`
- Create locally: `/private/tmp/openings-community-outreach/pr-body.md`
- Do not modify: `/Users/guilherme/Workspace/Dev/repositories/openings.dev/web/**` except this tracked plan

- [ ] **Step 1: Check the active GitHub identity**

Run:

```bash
gh auth status
```

Expected: the command reports `GuilhermeAlbert` as authenticated. The known pre-plan state is an expired token, so authentication must be renewed before continuing.

- [ ] **Step 2: Renew authentication when required**

Run:

```bash
gh auth login -h github.com -p https -w
```

Expected: GitHub completes browser/device authorization for `GuilhermeAlbert` without exposing the token in command output.

- [ ] **Step 3: Verify write-capable authentication**

Run:

```bash
gh auth status
gh api user --jq .login
```

Expected: authentication succeeds and the second command prints exactly `GuilhermeAlbert`.

- [ ] **Step 4: Create the isolated temporary workspace**

Run:

```bash
mkdir -p /private/tmp/openings-community-outreach
```

Expected: the directory exists and contains no repository checkout before the next task.

- [ ] **Step 5: Create the approved pull request body**

Use `apply_patch` to create `/private/tmp/openings-community-outreach/pr-body.md` with exactly:

```md
Este PR adiciona ao README um link para a página da comunidade no openings.dev.

A página organiza as vagas públicas já compartilhadas neste repositório e permite pesquisá-las e filtrá-las. O openings.dev não substitui o repositório: cada resultado continua levando à issue original para os detalhes atuais e a candidatura.

Mantive a alteração pequena e restrita ao README. Se preferirem outro texto ou posicionamento — ou não quiserem manter o link — ajusto ou retiro sem problema.
```

Expected: the reusable body matches the approved specification and contains no community-specific claim that could be wrong for another target.

### Task 2: Validate the Approved Targets and Select the Final Five

**Files:**
- Read: `/Users/guilherme/Workspace/Dev/repositories/openings.dev/data-pipeline/src/modules/catalog/repositories.json`
- Read remotely: each target repository's `README.md`, contribution files, pull request template, metadata, and pull requests
- Read remotely: each target openings.dev community profile and one linked GitHub issue

- [ ] **Step 1: Inspect repository metadata**

Run for the five primary targets and the fallback:

```bash
for outreach_repository in \
  backend-br/vagas \
  frontendbr/vagas \
  qa-brasil/vagas \
  DevOps-Brasil/Vagas \
  datascience-br/vagas \
  nodejsdevbr/vagas
do
  gh repo view "$outreach_repository" --json nameWithOwner,isArchived,defaultBranchRef,url
done
```

Expected: each candidate is public, unarchived, and reports a non-empty default branch. Exclude any candidate that does not.

- [ ] **Step 2: Search for duplicate outreach pull requests**

Run for every candidate:

```bash
for outreach_repository in \
  backend-br/vagas \
  frontendbr/vagas \
  qa-brasil/vagas \
  DevOps-Brasil/Vagas \
  datascience-br/vagas \
  nodejsdevbr/vagas
do
  gh pr list -R "$outreach_repository" --state all --search 'openings.dev' --json number,title,state,url
done
```

Expected: no open or recently merged pull request already adds the same community profile. Treat an equivalent result as ineligibility, not as a reason to open a duplicate.

- [ ] **Step 3: Inspect contribution guidance and README placement**

Run:

```bash
for outreach_repository in \
  backend-br/vagas \
  frontendbr/vagas \
  qa-brasil/vagas \
  DevOps-Brasil/Vagas \
  datascience-br/vagas \
  nodejsdevbr/vagas
do
  gh api "repos/$outreach_repository/readme" --jq .download_url
  gh api "repos/$outreach_repository/contents/CONTRIBUTING.md" --jq .download_url
  gh api "repos/$outreach_repository/contents/.github/pull_request_template.md" --jq .download_url
done
```

Expected: the README URL exists. A `404` for optional contribution or template files is acceptable; when present, read them and verify that the documentation-only change is allowed.

- [ ] **Step 4: Validate the community profiles in a normal browser**

Open each primary URL:

```txt
https://openings.dev/communities/backend-br/vagas
https://openings.dev/communities/frontendbr/vagas
https://openings.dev/communities/qa-brasil/vagas
https://openings.dev/communities/DevOps-Brasil/Vagas
https://openings.dev/communities/datascience-br/vagas
```

Fallback URL:

```txt
https://openings.dev/communities/nodejsdevbr/vagas
```

Expected: each selected page renders, identifies the intended repository, and contains at least one result that links to an issue in that repository. Specifically resolve the earlier automated `403` on QA Brasil through normal navigation.

- [ ] **Step 5: Lock the final target list**

Expected: retain all five primary targets when eligible. Replace the first ineligible target with `nodejsdevbr/vagas`. If two or more primary targets are ineligible, stop and request user direction before expanding beyond the approved fallback.

### Task 3: Open the Backend BR Pull Request

**Files:**
- Clone to: `/private/tmp/openings-community-outreach/backend-br-vagas/`
- Modify: `/private/tmp/openings-community-outreach/backend-br-vagas/README.md`

- [ ] **Step 1: Fork and clone the current upstream default branch**

Run:

```bash
gh repo fork backend-br/vagas --clone --default-branch-only --remote -- /private/tmp/openings-community-outreach/backend-br-vagas
git -C /private/tmp/openings-community-outreach/backend-br-vagas switch -c docs/openings-community-page
```

Expected: the checkout starts from the current upstream default branch and the new branch is `docs/openings-community-page`.

- [ ] **Step 2: Add the contextual README sentence**

Insert after the “Como receber atualizações das vagas?” guidance:

```md
Você também pode [pesquisar e filtrar as vagas da Backend BR no openings.dev](https://openings.dev/communities/backend-br/vagas). Cada resultado continua levando à issue original neste repositório.
```

Expected: the sentence reads as part of the existing discovery flow and does not create a new promotional section.

- [ ] **Step 3: Validate the isolated diff**

Run:

```bash
git -C /private/tmp/openings-community-outreach/backend-br-vagas diff --check
git -C /private/tmp/openings-community-outreach/backend-br-vagas status --short
git -C /private/tmp/openings-community-outreach/backend-br-vagas diff -- README.md
```

Expected: no whitespace errors, `README.md` is the only modified file, and the diff contains only the approved paragraph.

- [ ] **Step 4: Commit and push**

Run:

```bash
git -C /private/tmp/openings-community-outreach/backend-br-vagas add README.md
git -C /private/tmp/openings-community-outreach/backend-br-vagas commit -m "docs: add openings.dev community page"
git -C /private/tmp/openings-community-outreach/backend-br-vagas push -u origin docs/openings-community-page
```

Expected: one commit is pushed to the personal fork.

- [ ] **Step 5: Open and verify the pull request**

Run:

```bash
gh pr create -R backend-br/vagas --head GuilhermeAlbert:docs/openings-community-page --title "docs: add openings.dev community page" --body-file /private/tmp/openings-community-outreach/pr-body.md
gh pr view -R backend-br/vagas --json number,title,state,url,baseRefName,headRefName,files
```

Expected: an open pull request targets the current upstream default branch, uses the approved title and body, and changes only `README.md`.

### Task 4: Open the Frontend BR Pull Request

**Files:**
- Clone to: `/private/tmp/openings-community-outreach/frontendbr-vagas/`
- Modify: `/private/tmp/openings-community-outreach/frontendbr-vagas/README.md`

- [ ] **Step 1: Fork, clone, and branch**

Run:

```bash
gh repo fork frontendbr/vagas --clone --default-branch-only --remote -- /private/tmp/openings-community-outreach/frontendbr-vagas
git -C /private/tmp/openings-community-outreach/frontendbr-vagas switch -c docs/openings-community-page
```

Expected: the new branch starts from the current upstream default branch.

- [ ] **Step 2: Add the contextual README sentence**

Insert after the existing “Vagas disponíveis” link:

```md
Você também pode [pesquisar e filtrar as vagas da Front-end Brasil no openings.dev](https://openings.dev/communities/frontendbr/vagas). Cada resultado continua levando à issue original neste repositório.
```

- [ ] **Step 3: Validate, commit, and push**

Run:

```bash
git -C /private/tmp/openings-community-outreach/frontendbr-vagas diff --check
git -C /private/tmp/openings-community-outreach/frontendbr-vagas status --short
git -C /private/tmp/openings-community-outreach/frontendbr-vagas diff -- README.md
git -C /private/tmp/openings-community-outreach/frontendbr-vagas add README.md
git -C /private/tmp/openings-community-outreach/frontendbr-vagas commit -m "docs: add openings.dev community page"
git -C /private/tmp/openings-community-outreach/frontendbr-vagas push -u origin docs/openings-community-page
```

Expected: only `README.md` changes and one commit reaches the personal fork.

- [ ] **Step 4: Open and verify the pull request**

Run:

```bash
gh pr create -R frontendbr/vagas --head GuilhermeAlbert:docs/openings-community-page --title "docs: add openings.dev community page" --body-file /private/tmp/openings-community-outreach/pr-body.md
gh pr view -R frontendbr/vagas --json number,title,state,url,baseRefName,headRefName,files
```

Expected: the pull request is open and changes only `README.md`.

### Task 5: Open the QA Brasil Pull Request or Apply the Approved Fallback

**Files:**
- Primary clone: `/private/tmp/openings-community-outreach/qa-brasil-vagas/`
- Primary modify: `/private/tmp/openings-community-outreach/qa-brasil-vagas/README.md`
- Fallback clone: `/private/tmp/openings-community-outreach/nodejsdevbr-vagas/`
- Fallback modify: `/private/tmp/openings-community-outreach/nodejsdevbr-vagas/README.md`

- [ ] **Step 1: Choose the validated repository**

Expected: use `qa-brasil/vagas` only if its community page passed normal-browser validation; otherwise use `nodejsdevbr/vagas` and record the QA exclusion reason.

- [ ] **Step 2: Fork, clone, and branch**

For QA Brasil, run:

```bash
gh repo fork qa-brasil/vagas --clone --default-branch-only --remote -- /private/tmp/openings-community-outreach/qa-brasil-vagas
git -C /private/tmp/openings-community-outreach/qa-brasil-vagas switch -c docs/openings-community-page
```

For the approved fallback, run instead:

```bash
gh repo fork nodejsdevbr/vagas --clone --default-branch-only --remote -- /private/tmp/openings-community-outreach/nodejsdevbr-vagas
git -C /private/tmp/openings-community-outreach/nodejsdevbr-vagas switch -c docs/openings-community-page
```

Expected: the new branch starts from the current upstream default branch.

- [ ] **Step 3: Add the selected contextual sentence**

For QA Brasil, insert near the opening job links or notification guidance:

```md
Você também pode [pesquisar e filtrar as vagas da QA Brasil no openings.dev](https://openings.dev/communities/qa-brasil/vagas). Cada resultado continua levando à issue original neste repositório.
```

For the Node.js fallback, insert after “Vagas disponíveis”:

```md
Você também pode [pesquisar e filtrar as vagas da Node.js Brasil no openings.dev](https://openings.dev/communities/nodejsdevbr/vagas). Cada resultado continua levando à issue original neste repositório.
```

- [ ] **Step 4: Validate, commit, push, open, and verify**

For QA Brasil, run:

```bash
git -C /private/tmp/openings-community-outreach/qa-brasil-vagas diff --check
git -C /private/tmp/openings-community-outreach/qa-brasil-vagas status --short
git -C /private/tmp/openings-community-outreach/qa-brasil-vagas diff -- README.md
git -C /private/tmp/openings-community-outreach/qa-brasil-vagas add README.md
git -C /private/tmp/openings-community-outreach/qa-brasil-vagas commit -m "docs: add openings.dev community page"
git -C /private/tmp/openings-community-outreach/qa-brasil-vagas push -u origin docs/openings-community-page
gh pr create -R qa-brasil/vagas --head GuilhermeAlbert:docs/openings-community-page --title "docs: add openings.dev community page" --body-file /private/tmp/openings-community-outreach/pr-body.md
gh pr view -R qa-brasil/vagas --json number,title,state,url,baseRefName,headRefName,files
```

For the fallback, run instead:

```bash
git -C /private/tmp/openings-community-outreach/nodejsdevbr-vagas diff --check
git -C /private/tmp/openings-community-outreach/nodejsdevbr-vagas status --short
git -C /private/tmp/openings-community-outreach/nodejsdevbr-vagas diff -- README.md
git -C /private/tmp/openings-community-outreach/nodejsdevbr-vagas add README.md
git -C /private/tmp/openings-community-outreach/nodejsdevbr-vagas commit -m "docs: add openings.dev community page"
git -C /private/tmp/openings-community-outreach/nodejsdevbr-vagas push -u origin docs/openings-community-page
gh pr create -R nodejsdevbr/vagas --head GuilhermeAlbert:docs/openings-community-page --title "docs: add openings.dev community page" --body-file /private/tmp/openings-community-outreach/pr-body.md
gh pr view -R nodejsdevbr/vagas --json number,title,state,url,baseRefName,headRefName,files
```

Expected: the selected repository receives one open README-only pull request.

### Task 6: Open the DevOps Brasil Pull Request

**Files:**
- Clone to: `/private/tmp/openings-community-outreach/devops-brasil-vagas/`
- Modify: `/private/tmp/openings-community-outreach/devops-brasil-vagas/README.md`

- [ ] **Step 1: Fork, clone, and branch**

Run:

```bash
gh repo fork DevOps-Brasil/Vagas --clone --default-branch-only --remote -- /private/tmp/openings-community-outreach/devops-brasil-vagas
git -C /private/tmp/openings-community-outreach/devops-brasil-vagas switch -c docs/openings-community-page
```

- [ ] **Step 2: Add the contextual README sentence**

Insert in “Sobre”, after the job-board explanation:

```md
Você também pode [pesquisar e filtrar as vagas da DevOps Brasil no openings.dev](https://openings.dev/communities/DevOps-Brasil/Vagas). Cada resultado continua levando à issue original neste repositório.
```

- [ ] **Step 3: Validate, commit, push, open, and verify**

Run:

```bash
git -C /private/tmp/openings-community-outreach/devops-brasil-vagas diff --check
git -C /private/tmp/openings-community-outreach/devops-brasil-vagas status --short
git -C /private/tmp/openings-community-outreach/devops-brasil-vagas diff -- README.md
git -C /private/tmp/openings-community-outreach/devops-brasil-vagas add README.md
git -C /private/tmp/openings-community-outreach/devops-brasil-vagas commit -m "docs: add openings.dev community page"
git -C /private/tmp/openings-community-outreach/devops-brasil-vagas push -u origin docs/openings-community-page
gh pr create -R DevOps-Brasil/Vagas --head GuilhermeAlbert:docs/openings-community-page --title "docs: add openings.dev community page" --body-file /private/tmp/openings-community-outreach/pr-body.md
gh pr view -R DevOps-Brasil/Vagas --json number,title,state,url,baseRefName,headRefName,files
```

Expected: the pull request is open and changes only `README.md`.

### Task 7: Open the Data Science BR Pull Request

**Files:**
- Clone to: `/private/tmp/openings-community-outreach/datascience-br-vagas/`
- Modify: `/private/tmp/openings-community-outreach/datascience-br-vagas/README.md`

- [ ] **Step 1: Fork, clone, and branch**

Run:

```bash
gh repo fork datascience-br/vagas --clone --default-branch-only --remote -- /private/tmp/openings-community-outreach/datascience-br-vagas
git -C /private/tmp/openings-community-outreach/datascience-br-vagas switch -c docs/openings-community-page
```

- [ ] **Step 2: Add the contextual README sentence**

Insert after the existing “Vagas disponíveis” link:

```md
Você também pode [pesquisar e filtrar as vagas da Data Science Brasil no openings.dev](https://openings.dev/communities/datascience-br/vagas). Cada resultado continua levando à issue original neste repositório.
```

- [ ] **Step 3: Validate, commit, push, open, and verify**

Run:

```bash
git -C /private/tmp/openings-community-outreach/datascience-br-vagas diff --check
git -C /private/tmp/openings-community-outreach/datascience-br-vagas status --short
git -C /private/tmp/openings-community-outreach/datascience-br-vagas diff -- README.md
git -C /private/tmp/openings-community-outreach/datascience-br-vagas add README.md
git -C /private/tmp/openings-community-outreach/datascience-br-vagas commit -m "docs: add openings.dev community page"
git -C /private/tmp/openings-community-outreach/datascience-br-vagas push -u origin docs/openings-community-page
gh pr create -R datascience-br/vagas --head GuilhermeAlbert:docs/openings-community-page --title "docs: add openings.dev community page" --body-file /private/tmp/openings-community-outreach/pr-body.md
gh pr view -R datascience-br/vagas --json number,title,state,url,baseRefName,headRefName,files
```

Expected: the pull request is open and changes only `README.md`.

### Task 8: Audit the Five Published Pull Requests

**Files:**
- Read remotely: final pull request pages and diffs
- Record locally during execution: `/private/tmp/openings-community-outreach/results.md`

- [ ] **Step 1: Confirm the final count and state**

Run for the fixed targets, plus exactly one of the QA and Node.js lines according to the final selection:

```bash
gh pr list -R backend-br/vagas --author GuilhermeAlbert --state open --json number,title,url,files,baseRefName,headRefName
gh pr list -R frontendbr/vagas --author GuilhermeAlbert --state open --json number,title,url,files,baseRefName,headRefName
gh pr list -R qa-brasil/vagas --author GuilhermeAlbert --state open --json number,title,url,files,baseRefName,headRefName
gh pr list -R nodejsdevbr/vagas --author GuilhermeAlbert --state open --json number,title,url,files,baseRefName,headRefName
gh pr list -R DevOps-Brasil/Vagas --author GuilhermeAlbert --state open --json number,title,url,files,baseRefName,headRefName
gh pr list -R datascience-br/vagas --author GuilhermeAlbert --state open --json number,title,url,files,baseRefName,headRefName
```

Expected: exactly one pilot pull request exists per final target and five total are open unless a submission failure has been explicitly reported.

- [ ] **Step 2: Inspect every published diff in the browser**

Expected: each pull request renders the intended sentence, points to the correct canonical community URL, changes only `README.md`, and contains the approved title and transparent description.

- [ ] **Step 3: Produce the handoff table**

Record for each pull request:

```md
| Community | Repository | Pull request | Initial status | README placement | Notes |
| --- | --- | --- | --- | --- | --- |
```

Expected: five rows plus a factual note for every excluded primary target or applied fallback.

- [ ] **Step 4: Verify the Openings repository remains clean**

Run:

```bash
git status --short
```

Expected: no uncommitted changes remain in `/Users/guilherme/Workspace/Dev/repositories/openings.dev/web`.
