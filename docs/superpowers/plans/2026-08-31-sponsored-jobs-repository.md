# Sponsored Jobs Repository Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the public `openings-dev/jobs` request repository with a safe manual approval and 30-day expiry workflow.

**Architecture:** GitHub Issues are the public submission and source-of-truth surface. An Issue Form applies only `ad-request`; maintainers apply `sponsored` after payment and close the issue at expiry. No payment or private data is stored in GitHub.

**Tech Stack:** GitHub repository, GitHub Issue Forms, Markdown, GitHub CLI

---

### Task 1: Create and validate the repository content locally

**Files:**
- Create: `jobs/README.md`
- Create: `jobs/CONTRIBUTING.md`
- Create: `jobs/LICENSE`
- Create: `jobs/.gitignore`
- Create: `jobs/.github/ISSUE_TEMPLATE/sponsored-job.yml`
- Create: `jobs/.github/ISSUE_TEMPLATE/config.yml`

- [ ] **Step 1: Write the Issue Form**

Create a public form whose title prefix is `[Ad request]: `, whose only automatic label is `ad-request`, and whose required fields are company, country, region, location, work model, seniority, stack, job description, and application instructions. End with required checkboxes confirming that the issue is public, activation is manual, and the placement lasts at most 30 days.

```yaml
name: Request a sponsored job
description: Submit a public job for review and a 30-day sponsored placement.
title: "[Ad request]: "
labels: ["ad-request"]
body:
  - type: markdown
    attributes:
      value: Payment details and private information must not be posted here.
  - type: input
    id: company
    attributes: { label: Company, placeholder: Acme }
    validations: { required: true }
  - type: input
    id: country
    attributes: { label: Country, placeholder: Brazil or Global }
    validations: { required: true }
  - type: input
    id: region
    attributes: { label: Region, placeholder: South America or Global }
    validations: { required: true }
  - type: input
    id: location
    attributes: { label: Location details, placeholder: Remote in Brazil }
    validations: { required: true }
  - type: dropdown
    id: work-model
    attributes: { label: Work model, options: [Remote, Hybrid, On-site] }
    validations: { required: true }
  - type: input
    id: seniority
    attributes: { label: Seniority, placeholder: Senior }
    validations: { required: true }
  - type: input
    id: stack
    attributes: { label: Stack, placeholder: React, TypeScript }
    validations: { required: true }
  - type: textarea
    id: description
    attributes: { label: Job description }
    validations: { required: true }
  - type: textarea
    id: application
    attributes: { label: How to apply }
    validations: { required: true }
```

- [ ] **Step 2: Write the operating documentation**

Document the public request, manual payment coordination through `support@openings.dev`, activation by the `sponsored` label, maximum 30-day duration, early closure rules, and the absence of traffic or hiring guarantees. The maintainer checklist must record start and end dates in an activation comment.

- [ ] **Step 3: Validate YAML and policy text**

Run:

```bash
ruby -e 'require "yaml"; Dir[".github/ISSUE_TEMPLATE/*.yml"].each { |file| YAML.safe_load_file(file, permitted_classes: [], aliases: false) }'
rg -n "ad-request|sponsored|30 days|support@openings.dev|public" README.md CONTRIBUTING.md .github/ISSUE_TEMPLATE
```

Expected: both commands exit 0; the search shows the operational terms in documentation and templates.

- [ ] **Step 4: Initialize and commit the local repository**

Run:

```bash
git init -b main
git add README.md CONTRIBUTING.md LICENSE .gitignore .github
git commit -m "feat: add sponsored job request workflow"
```

Expected: one root commit with only the repository workflow files.

### Task 2: Publish and configure `openings-dev/jobs`

**Files:**
- Verify remote files created in Task 1

- [ ] **Step 1: Create the public remote and push**

Run:

```bash
gh repo create openings-dev/jobs --public --source=. --remote=origin --push --description "Sponsored technology jobs published through openings.dev"
```

Expected: `https://github.com/openings-dev/jobs` exists with `main` as its default branch.

- [ ] **Step 2: Create operational labels**

Run:

```bash
gh label create ad-request --repo openings-dev/jobs --color EEE8F8 --description "Awaiting commercial and content review"
gh label create sponsored --repo openings-dev/jobs --color B0EC9C --description "Approved paid placement included by openings.dev"
```

Expected: both labels exist; only maintainers can apply `sponsored` through normal repository permissions.

- [ ] **Step 3: Verify the live Issue Form**

Run:

```bash
gh api repos/openings-dev/jobs/contents/.github/ISSUE_TEMPLATE/sponsored-job.yml --jq '.name'
gh label list --repo openings-dev/jobs
```

Expected: the template file is returned and both labels are listed.

### Task 3: Final repository smoke test

- [ ] **Step 1: Open the new-issue chooser in a browser**

Open `https://github.com/openings-dev/jobs/issues/new/choose` and verify blank issues are disabled, the sponsored request is available, and the rendered form does not request sensitive or payment information.

- [ ] **Step 2: Record the repository URL for downstream configuration**

Use `https://github.com/openings-dev/jobs/issues/new?template=sponsored-job.yml` as the frontend advertiser destination and `openings-dev/jobs` as the data catalog repository.
