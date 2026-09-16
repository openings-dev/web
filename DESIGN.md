# Openings Design Direction

> Canonical brand, product-interface, and copy direction for the Openings frontend.

## Status

Approved for implementation on 2026-08-16.

This document replaces the historical “Buffer Bold” baseline recorded in Specs 34 to 45. Those specs remain delivery history, but their thick outlines, hard offset shadows, repeated black weights, and boxed compositions are no longer design authority.

## Product truth

Openings is a discovery layer for technology jobs shared through public GitHub communities. It brings scattered listings into one searchable interface while preserving the original public source and community context. Supported sources can include GitHub issues, GitHub discussions, and community boards.

The product does not own the listings, promise their quality, verify employers, or operate an application flow. It must never imply otherwise.

### Primary audience and action

The primary audience is a candidate looking for a technology role. The primary conversion is searching, opening, and evaluating a job. Community maintainers, GitHub authors, recruiters, and contributors are important secondary audiences.

Every public page should help a visitor understand the following within five seconds:

1. these are technology jobs;
2. they were shared through public GitHub communities;
3. Openings makes them easier to search and read;
4. the original public listing remains the source of truth.

## Approved positioning

### Message thesis

The copy leads with a human transformation, then proves it with the product mechanism.

**English hero thesis**

> Find tech jobs shared by GitHub communities.

**Portuguese adaptation**

> Encontre as vagas de tecnologia que as comunidades já estão publicando.

These are directional master lines. Other languages receive native adaptations rather than literal translations.

### Supporting mechanism

Visitors can search by role, stack, seniority, location, and work model, then open the original listing to verify current details and next steps. Openings does not promise that its index is current.

### CTA hierarchy

- Primary marketing CTA: `Search open jobs` / `Buscar vagas abertas`
- Search-submit CTA: `Search jobs` / `Buscar vagas`
- Opportunity CTA: `Open original listing` / `Abrir anúncio original`
- Profile CTA: `See open jobs` / `Ver vagas abertas`
- Secondary profile action: `Share profile` / `Compartilhar perfil`

Avoid vague CTAs such as `Learn more`, `Get started`, or `Explore` when a more specific action exists.

### Six-language product glossary

Candidate-facing copy uses the natural term for a job or role in each language. `Opportunity` remains the stable code and data-domain concept (`OpportunityItem`, API fields, controller names) and may appear in technical documentation when that distinction matters. It is not the default label for a person looking for work.

| Concept | English | Portuguese | Spanish | Italian | French | German |
| --- | --- | --- | --- | --- | --- | --- |
| job | job | vaga | vacante | offerta di lavoro | offre d’emploi | Stelle |
| community | community | comunidade | comunidad | comunità | communauté | Community |
| listing author | GitHub author | autor no GitHub | autor en GitHub | autore su GitHub | auteur GitHub | GitHub-Autor:in |
| repository | repository | repositório | repositorio | repository | dépôt | Repository |
| public listing | public listing | anúncio público | anuncio público | annuncio pubblico | annonce publique | öffentlicher Eintrag |
| source | source | fonte | fuente | fonte | source | Quelle |
| open role | open role | vaga aberta | vacante abierta | offerta aperta | offre ouverte | offene Stelle |
| filters | filters | filtros | filtros | filtri | filtres | Filter |
| profile | profile | perfil | perfil | profilo | profil | Profil |
| share | share | compartilhar | compartir | condividere | partager | teilen |

Use one term consistently within a surface. The code can retain `publisher` as a presentation kind and `author` as the source field, but public copy describes the factual GitHub account that authored the listing. It must not imply a verified employer, recruiter, owner, or separate publisher entity. Country and region on these profiles describe indexed job locations, never the person’s location. Repository names, GitHub handles, tag values, paths, schema fields, and code literals remain untranslated.

### Localized CTA vocabulary

| Action | English | Portuguese | Spanish | Italian | French | German |
| --- | --- | --- | --- | --- | --- | --- |
| find jobs | Search open jobs | Buscar vagas abertas | Buscar vacantes abiertas | Cerca offerte aperte | Rechercher des offres en cours | Offene Stellen suchen |
| search | Search jobs | Buscar vagas | Buscar vacantes | Cerca offerte | Rechercher des offres | Jobs suchen |
| original source | Open original listing | Abrir anúncio original | Abrir anuncio original | Apri l’annuncio originale | Ouvrir l’annonce d’origine | Originalanzeige öffnen |
| profile roles | See open roles | Ver vagas abertas | Ver vacantes abiertas | Vedi le offerte aperte | Voir les offres ouvertes | Offene Stellen ansehen |
| share profile | Share profile | Compartilhar perfil | Compartir perfil | Condividi profilo | Partager le profil | Profil teilen |
| clear filters | Clear filters | Limpar filtros | Limpiar filtros | Rimuovi i filtri | Effacer les filtres | Filter löschen |
| community profile | Open community profile | Abrir perfil da comunidade | Abrir perfil de la comunidad | Apri il profilo della comunità | Ouvrir le profil de la communauté | Community-Profil öffnen |
| author profile | Open GitHub author profile | Abrir perfil do autor | Abrir perfil del autor | Apri il profilo dell’autore | Ouvrir le profil de l’auteur | GitHub-Autor:innenprofil öffnen |

### Voice

- Plain, warm, and specific.
- Confident without inflated claims.
- Concise enough to scan, but not clipped into fragments everywhere.
- Technical terms appear only when they explain provenance or behavior.
- Community is treated as a source and context, not as a sentimental abstraction.
- Copy names the next action instead of narrating the interface.

Avoid hype, false urgency, invented proof, generic “trusted” claims, AI clichés, rhetorical triples used mechanically, and repeated “all in one place” phrasing.

## Reference synthesis

The final system is Buffer-like in composition and humanity, refined with Resend-like precision, and original to Openings in identity and product subject.

### From Buffer

- warm, generous marketing canvas;
- large calm sans-serif typography;
- hairline borders and limited elevation;
- color applied to selected large areas rather than every control;
- clear CTA pills;
- product UI that becomes denser and quieter than marketing;
- a dark footer that acts as a visual conclusion.

### From Resend

- disciplined navigation and popover surfaces;
- precise type scale and spacing;
- restrained atmospheric depth;
- dark-mode hierarchy built from tonal surfaces and translucent hairlines;
- one memorable visual moment instead of repeated decoration.

### What must remain original

- wordmark, favicon, colors, copy, illustrations, motion, and compositions;
- opportunity, community, repository, and issue data as the visual subject;
- the supplied `openings.dev` stacked-page lockup and Brand Mint as the signature action color;
- no copied third-party assets, logos, screenshots, branded layouts, or proprietary copy.

## Brand identity

### Name

Use `openings.dev` in metadata and domain contexts. In editorial prose, `Openings` is acceptable. The full visual lockup preserves the supplied `openings.dev` artwork exactly.

### Wordmark

The identity is built from the supplied logo: a stacked-page symbol followed by the `openings.dev` lockup. The complete artwork is the canonical header, footer, README, and design-system signature. The stacked-page symbol cropped from that same source is the compact mark and favicon; it is not a separate or redrawn identity.

Usage rules:

- render the wordmark without a container, outline, or shadow;
- render the entire lockup in one approved monochrome color;
- preserve clear space equal to at least the height of one symbol page;
- use the compact stacked-page mark only when the full lockup cannot remain legible;
- provide light and dark SVG variants from one canonical vector source;
- never stretch, rotate, add effects, reconstruct letters, or recolor individual parts.

### Visual subject

Product truth replaces generic illustration. Use real or representative opportunity rows, community identity, repository relationships, tags, filters, and public-source context. Decorative graphics may abstract connections and openings, but must not become a second logo or a library of generic AI gradients.

## Foundations

### Typography

| Role | Family | Weight | Use |
| --- | --- | --- | --- |
| Brand and display | Figtree | 500 to 650 | wordmark support, heroes, page and section headings |
| Interface and body | Figtree | 400 to 650 | navigation, body, forms, cards, controls, metadata |
| Editorial accent | Newsreader | 400 to 500 | one phrase or short passage in selected marketing/profile moments |
| Technical | Geist Mono | 400 to 600 | dates, API examples, paths, code, compact numerical data |

Newsreader is an accent, not a second body system. It must not appear in filters, buttons, dense result cards, tables, or routine UI.

Recommended scale:

| Context | Size / line height |
| --- | --- |
| Marketing hero | `clamp(3.25rem, 7vw, 5rem)` / `0.98 to 1.02` |
| Public profile hero | `clamp(2.5rem, 5vw, 4rem)` / `1.0 to 1.06` |
| Directory/page title | `clamp(2.25rem, 4vw, 3.5rem)` / `1.04 to 1.1` |
| Product title | `1.5 to 2rem` / `1.15` |
| Section title | `1.75 to 2.5rem` / `1.1 to 1.2` |
| Marketing body | `1.125rem` / `1.55` |
| Product body | `0.9375 to 1rem` / `1.45 to 1.55` |
| Metadata | `0.75 to 0.875rem` / `1.35 to 1.45` |

Prefer weights 400, 500, 600, and occasional 700. Do not use `font-black`. Uppercase microtype is reserved for a rare marketing eyebrow and stays at 11 to 12 px with sufficient letter spacing.

### Color

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| Canvas | `#F5F3EF` | `#0D1211` | application background |
| Paper | `#FFFEFA` | `#121817` | primary reading surface |
| Surface | `#FFFFFF` | `#171E1C` | controls and grouped content |
| Elevated | `#FFFFFF` | `#1C2422` | dialogs, menus, drawers |
| Ink | `#21302E` | `#F2F4F1` | primary text and dark CTA |
| Muted ink | `#5E6663` | `#A6AFAB` | supporting text, including text on pastel support fields |
| Night muted ink | `#B7BFBB` | `#B7BFBB` | solid supporting text on the Night footer surface |
| Hairline | `#DDD9D2` | `rgba(255,255,255,.10)` | boundaries |
| Control border | `#918C84` | `#68716D` | `3:1`-minimum boundaries for form and outline controls |
| Brand Mint | `#B0EC9C` | `#B0EC9C` | priority fill, selected indicator, compact emphasis |
| Primary Deep | `#2F6B3A` | `#B0EC9C` | accessible accent text and focus |
| Lavender Mist | `#EEE8F8` | `#2A2237` | selected and editorial surface |
| Fresh Mint | `#D9F4CC` | `#213625` | positive/open and editorial surface |
| Warm Peach | `#FFE2D7` | `#39251F` | editorial contrast and warning-adjacent surface |
| Destructive | semantic red | semantic dark red | destructive/error only |

Brand Mint is controlled. It belongs to one priority action, selected states, and compact emphasis. On light surfaces, Primary Deep provides accessible accent text and focus; the pale mint fill is never used as small foreground text. The supplied logo remains monochrome and must not be filled mint by default. Lavender stays an editorial support field rather than a competing primary identity.

### Layout and spacing

- Marketing and profiles: twelve-column grid, `1180 to 1280px` content width, generous vertical rhythm.
- Product discovery: up to `1440px`, compact controls, list/detail composition on wide screens.
- Documentation: navigation rail, reading column of `68 to 74ch`, optional table of contents.
- Base spacing rhythm: 4 px, composed primarily with 8, 12, 16, 24, 32, 48, 64, 96, and 128 px.
- Mobile is recomposed, not a squeezed desktop canvas.

### Shape and elevation

- Default border: 1 px low-contrast hairline.
- Form controls and outline controls use the stronger semantic control border; hairlines remain reserved for content grouping.
- Control radius: 10 to 14 px.
- Card and grouped surface radius: 14 to 18 px.
- Large editorial panel radius: 18 to 24 px.
- Pill: primary marketing CTA, chips, segmented controls, and compact toggles only.
- Shadow: diffuse and low opacity, reserved for popovers, dialogs, drawers, selected floating layers, and rare editorial objects.
- No hard offset shadows or hover translations that imitate a printed sticker.

### Iconography

Lucide remains the interface icon system. Use consistent 16, 18, 20, or 24 px sizes and approximately 1.75 to 2 px strokes. Icons support labels; they do not replace understandable copy unless the action has an accessible name and an established symbol.

Custom SVG is reserved for the canonical logo lockup and stacked-page compact mark, flags where still required, and product-specific graphics Lucide cannot represent.

### Motion

- 140 to 220 ms for hover, focus, selection, and small overlays.
- Up to 320 ms for drawer/dialog continuity.
- Use opacity and small translation or scale only where state continuity benefits.
- Keep the shell static.
- Respect reduced motion globally.
- Never stagger every navigation or footer item on initial load.

## Experience architecture

### 1. Discover homepage

The root route becomes a real discovery homepage, not a title card stacked above the complete explorer.

Order:

1. quiet global header;
2. editorial hero with the approved thesis;
3. primary search integrated into or immediately below the hero;
4. factual live proof from available counts and recency;
5. three short mechanism blocks using real product concepts;
6. a curated or leading opportunity preview;
7. community and GitHub-author discovery entry points;
8. dark editorial footer.

The first meaningful opportunity remains visible without excessive scrolling. Do not create a generic SaaS feature parade, fake customer logos, invented testimonials, pricing, or signup CTA.

### 2. Opportunity workspace

The dedicated opportunity experience prioritizes scan speed.

- Search, location, and stack remain visible as quick filters.
- Advanced filters stay in the accessible modal.
- Result count, update recency, sorting, and view controls form one compact result bar.
- List and grid are genuinely different compositions.
- Selecting a result opens one fullscreen native dialog at every breakpoint.
- The same Product Sheet hierarchy is reused by the canonical `/jobs/<id>` page.
- Closing the dialog restores focus to the actual opener, or to the results region when the job came from a direct link.
- Active selection uses a soft semantic surface and a Brand Mint indicator, not heavy outlines.

#### Opportunity hierarchy

1. company/community context;
2. role title as a semantic heading;
3. salary when available, work model, and location;
4. stack and seniority;
5. listing author and date;
6. original repository/source context.

Repository information appears once per card. Tags use visual roles rather than one repeated heavy badge style.

### 3. Shareable community and author profiles

Community and user routes are destinations, not filters with an embedded identity card.

Each profile provides:

- prominent avatar or monogram;
- name, handle/repository, and concise description;
- factual job count, job-location summary, and latest activity;
- primary `See open roles` action;
- native share/copy action;
- a controlled, profile-specific editorial composition;
- compact opportunities below the identity area.

The public URL must read well when placed in an Instagram profile, README, community page, or social post.

Social previews use the governed 1200×630 Product Sheet card. The
card carries the same Warm Paper, Community Ink, Brand Mint, hairline, search,
and opportunity-preview language as the production interface. It must remain
truthful, legible at feed size, and free of invented metrics, testimonials, or
application claims.

### 4. Public job pages and social cards

Every indexed job has a statically exported `/jobs/<id>` page. Discovery keeps
its query-driven selection so visitors can close the fullscreen dialog and
return to the same results, while Share always uses the canonical job URL.

The page, dialog, and social card share one Product Sheet information order:
community context, title, factual job metadata, description, taxonomy, dates,
and the original public source. Missing salary, location, tags, or description
collapse without placeholders or inferred claims.

Open Graph and Twitter images are generated from the same validated build-time
record. Job, community, and GitHub-author cards use the canonical wordmark,
Warm Paper, Community Ink, Brand Mint, one-pixel lines, meaningful alternative
text, and `1200 × 630` dimensions. They never depend on remote avatars or fake
example listings.

### 5. Directories

Directories use one discovery bar and an unboxed grid/list. They do not stack a hero card, filter card, location card, outer list card, and inner entity card.

Entity cards emphasize identity, open-job count, recent activity, and one explicit destination action. Community and author cards share system rules but may use different metadata.

### 6. Documentation

Documentation uses a quiet reading system:

- breadcrumb and page identity;
- desktop navigation rail;
- article without a heavy outer card;
- `68 to 74ch` reading measure;
- visible heading anchors;
- optional sticky table of contents for long pages;
- code, tables, callouts, and links with complete light/dark states;
- mobile navigation that preserves reading position and touch targets.

### 7. Design-system showcase

Create a static-export-compatible route under the application that serves as the inspectable implementation reference beneath this document and the production token/primitive sources. It must show:

- wordmark and compact mark variants;
- color tokens in light and dark;
- typography roles and scale;
- spacing, radius, border, and elevation;
- buttons, inputs, selects, chips, cards, toast, fullscreen detail dialog, navigation, opportunity row, profile block, and documentation content;
- default, hover/focus guidance, active/selected, disabled, invalid, loading, empty, and destructive states;
- responsive compositions;
- icon sizing and usage;
- copy principles and approved CTA vocabulary.

The showcase is documentation, not a second component implementation or a higher design authority. It must import the same production primitives and tokens used by the product.

## Header and footer

### Header

- 68 to 76 px on public/marketing pages; compact variant is allowed in the discovery workspace.
- unboxed wordmark and navigation;
- no nested navigation card;
- GitHub, theme, and locale controls remain secondary;
- one primary CTA only where it advances the page’s journey;
- mobile navigation uses the existing native dialog contract with calmer styling.

### Footer

- full-width Night surface with a large wordmark or compact editorial brand moment;
- real link groups only;
- concise mechanism description;
- language, theme, GitHub, legal, status, and contribution links remain accessible;
- Brand Mint, Fresh Mint, or Lavender may accent small areas, never recreate Buffer’s branded footer.

## Accessibility and responsive contract

- WCAG AA contrast for body text and interactive controls.
- Visible focus ring independent of color fill.
- Minimum 44 px touch target for primary controls.
- Semantic headings, landmarks, links, buttons, lists, and definition lists.
- Dialog focus management, Escape behavior, background isolation, and accessible titles.
- Icon-only actions have accessible names.
- Selected state is communicated beyond color where needed.
- Zoom and text enlargement do not clip controls or content.
- No horizontal overflow at 320 px.
- Breakpoint review at 320, 390, 768, 1024, 1280, and 1440 px in light and dark.

## Dark mode

Dark mode is a first-class tonal system influenced by Resend’s precision, not a color inversion.

- canvas and adjacent surfaces differ by small, deliberate luminance steps;
- hairlines use translucent white rather than near-white opaque borders;
- shadows are subtle and visible only on real floating layers;
- Brand Mint remains luminous while Primary Deep adapts to preserve contrast;
- pastel editorial surfaces become dark tonal hues;
- content hierarchy is preserved without outlining every container;
- the marketing composition remains human and community-oriented, not cinematic infrastructure branding.

## Anti-patterns

Do not reintroduce:

- 2 px borders as the default;
- hard offset shadows;
- `font-black` headings, labels, chips, or buttons;
- 10 px uppercase labels throughout product UI;
- nested cards used only for spacing;
- identical list and grid cards;
- duplicated repository or result metadata;
- decorative motion in header/footer;
- a sidebar filter replacing the approved quick-filter + modal model;
- generic gradients, glows, blobs, 3D objects, fake social proof, or borrowed brand assets;
- Buffer green or exact Buffer/Resend compositions;
- prose that sounds translated, automated, or more certain than the data permits.

## Implementation authority

The ordered implementation program begins at Spec 46. `AGENTS.md`, `.knowledge/design_system/`, `.knowledge/best_practices/styling.md`, production tokens, primitives, and the showcase route must converge on this document.

When implementation and this document disagree, either change the implementation or explicitly amend this document and the active spec. Do not silently create a second design direction.
