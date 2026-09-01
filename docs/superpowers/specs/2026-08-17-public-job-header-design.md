# Public Job Header Design

## Objective

Remove the duplicate contextual header from public job pages while preserving the existing header inside opportunity dialogs.

## Root cause

The root `AppShell` renders the global site header for every page. `OpportunityDetails` also renders its dialog-oriented header in both `Dialog` and `Page` modes. A public `/jobs/[id]` route therefore displays two stacked navigation bars and two Openings logos.

## Design

`OpportunityDetails` will render its internal header only when `mode` is `Dialog`. Public job pages will rely exclusively on the global site header supplied by `AppShell`. The job content, metadata, identities, sharing actions, mobile action footer, and route behavior remain unchanged.

The modal retains its compact Openings wordmark, details label, and close button. The page-only back button currently owned by the redundant bar will be removed with that bar; primary navigation remains available in the global header.

## Verification

A focused source contract will assert that the internal header is gated by dialog mode and that page mode does not render it. Lint and the production static export must continue to pass.

## Out of scope

- Redesigning the global header;
- changing job-page content or social metadata;
- changing dialog layout or behavior;
- adding a replacement page-level navigation bar.
