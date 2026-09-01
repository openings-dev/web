# Community README Outreach Design

## Goal

Run a five-community Brazilian pilot that adds each community's canonical openings.dev profile to its job repository README through a small, transparent pull request.

The campaign should make public job listings easier to search and filter while preserving the original GitHub issue as the source for current details and application steps.

## Scope

The pilot targets these repositories:

1. `backend-br/vagas`
2. `frontendbr/vagas`
3. `qa-brasil/vagas`
4. `DevOps-Brasil/Vagas`
5. `datascience-br/vagas`

`nodejsdevbr/vagas` is the fallback if one target is ineligible before submission because its profile is inaccessible, its contribution rules exclude the change, or an equivalent pull request already exists.

If more than one primary target is ineligible, use `nodejsdevbr/vagas` for the first replacement and stop for user direction before selecting another community. Do not expand the approved target set silently.

Each pull request changes only the target repository's `README.md`. It adds one short contextual paragraph near the existing job discovery or notification guidance. The pilot does not add badges, images, tracking parameters, dependencies, workflows, or unrelated documentation changes.

## Target Eligibility

A repository remains in the pilot only when all of these conditions hold immediately before submission:

- the repository is public, active, unarchived, and accepts pull requests;
- its contribution guidance does not prohibit the proposed documentation link;
- no open or recently merged pull request already proposes the openings.dev profile;
- the canonical community profile loads successfully in normal browser navigation;
- the profile identifies the intended repository and links results back to original GitHub issues;
- the README has a contextually appropriate location for the sentence without creating a new promotional section.

An automated HTTP request returned `403` for the QA Brasil profile during design validation even though the profile is generated from the current catalog. The executor must confirm that profile through normal browser navigation before including it. If the page is not usable, replace QA Brasil with the fallback instead of opening a broken-link pull request.

## README Change

Use this sentence as the copy baseline, replacing the link with the exact canonical URL from the table and adapting the community name and surrounding transition to the target README. For example, the Backend BR change is:

```md
Você também pode [pesquisar e filtrar as vagas da Backend BR no openings.dev](https://openings.dev/communities/backend-br/vagas). Cada resultado continua levando à issue original neste repositório.
```

Canonical URLs:

| Repository | Community URL | Preferred placement |
| --- | --- | --- |
| `backend-br/vagas` | `https://openings.dev/communities/backend-br/vagas` | After “Como receber atualizações das vagas?” |
| `frontendbr/vagas` | `https://openings.dev/communities/frontendbr/vagas` | After the existing “Vagas disponíveis” link |
| `qa-brasil/vagas` | `https://openings.dev/communities/qa-brasil/vagas` | After the opening links or the notification guidance |
| `DevOps-Brasil/Vagas` | `https://openings.dev/communities/DevOps-Brasil/Vagas` | In “Sobre”, after the job-board explanation |
| `datascience-br/vagas` | `https://openings.dev/communities/datascience-br/vagas` | After the existing “Vagas disponíveis” link |
| `nodejsdevbr/vagas` | `https://openings.dev/communities/nodejsdevbr/vagas` | After the existing “Vagas disponíveis” link |

Placement may move to a nearby paragraph when the current upstream README has changed, but the new text must remain part of the job-discovery flow. Do not place openings.dev under “Outros repositórios”, because it is a search interface rather than another source repository.

## Pull Request Presentation

Use one branch and one commit per upstream repository. The default title and commit message are:

```txt
docs: add openings.dev community page
```

Use this pull request description, replacing the generic community reference with its public name when that improves clarity:

```md
Este PR adiciona ao README um link para a página da comunidade no openings.dev.

A página organiza as vagas públicas já compartilhadas neste repositório e permite pesquisá-las e filtrá-las. O openings.dev não substitui o repositório: cada resultado continua levando à issue original para os detalhes atuais e a candidatura.

Mantive a alteração pequena e restrita ao README. Se preferirem outro texto ou posicionamento — ou não quiserem manter o link — ajusto ou retiro sem problema.
```

The description must not imply endorsement, partnership, ownership of the listings, employer verification, or guaranteed data accuracy. It should make the provenance and removal option explicit.

## Execution Flow

1. Renew the expired GitHub CLI authentication for `GuilhermeAlbert`.
2. Recheck repository eligibility, contribution guidance, existing pull requests, current default branch, and README content.
3. Validate each openings.dev community profile through normal browser navigation.
4. Select the final five targets, applying the fallback when required.
5. Create or synchronize a personal fork for each target without changing unrelated fork state.
6. Create a dedicated branch from the current upstream default branch.
7. Apply only the approved contextual README paragraph.
8. Review the rendered Markdown and the final diff.
9. Commit, push, and open one pull request per target with the approved presentation.
10. Record the pull request URL, initial state, chosen placement, and any eligibility or fallback note.

The five pull requests may be opened in the same execution session after individual review. Personalization comes from the placement, community URL, and community name; avoid adding marketing language merely to make each pull request look different.

## Validation

Before each submission:

- follow redirects and confirm the community page loads;
- confirm the profile repository identifier exactly matches the target;
- open at least one listed result and confirm it points to an issue in the target repository;
- inspect the target's contribution documentation and pull request template;
- search open and recently merged pull requests for `openings.dev`;
- preview the README or otherwise verify the Markdown link and surrounding paragraph;
- inspect the branch diff and confirm only `README.md` changed;
- confirm the public URL contains no analytics or campaign query parameters.

After submission, open each pull request URL and confirm its base repository, base branch, title, body, changed-file count, and rendered README diff.

## Error Handling and Maintainer Response

- If a target is ineligible before submission, document the reason and use the fallback.
- If authentication or fork creation fails, stop before creating partial or ambiguous external state and report the exact blocker.
- If a profile is inaccessible or points to the wrong source, do not open the upstream pull request.
- If a maintainer requests a wording or placement adjustment within the approved scope, prepare the focused update for review.
- If a maintainer declines or closes the pull request, thank them and do not reopen it or argue for the link.
- Do not post follow-up issues, comments, or direct messages unless separately authorized.

## Success Criteria

The operational deliverable is five valid pull requests with recorded URLs and initial statuses. The pilot is considered promising when at least three are merged, or when maintainer feedback provides a clear, reusable preference for future outreach.

Openings currently does not load analytics scripts or set analytics cookies. This pilot therefore measures pull request acceptance and qualitative maintainer feedback, not referral traffic or click-through rate. Adding analytics or changing the privacy model is a separate project and outside this scope.

## Final Handoff

Return a compact table containing:

- community and repository;
- pull request URL;
- initial status;
- README placement;
- any fallback or maintainer note.

Also report any target that was evaluated but excluded, with the factual reason. Do not claim campaign performance until maintainers have had time to respond.
