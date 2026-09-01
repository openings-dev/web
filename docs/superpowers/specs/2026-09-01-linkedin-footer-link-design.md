# LinkedIn Footer Link Design

## Objective

Add the official Openings.dev LinkedIn Page to the website footer alongside the existing social-network actions.

## Design

The footer social row will gain a LinkedIn action immediately after GitHub, using the canonical Page URL `https://www.linkedin.com/company/openings-dev/`.

The action will follow the existing social-link contract:

- a locally implemented LinkedIn brand icon matching the current icon component interface and visual sizing;
- an external link that opens in a new tab with the same security attributes as the other networks;
- a visible-on-focus accessible name through the existing screen-reader-only label pattern;
- localized link and accessibility labels in every supported locale;
- a centralized entry in the external routes map rather than an inline URL.

No footer layout, spacing, color, or interaction behavior will change beyond adding the new action.

## Accessibility

The icon will be decorative and hidden from assistive technology. The anchor will retain a localized accessible name, keyboard focus behavior, and the existing external-link semantics.

## Verification

Verification will confirm:

- the LinkedIn action renders in the footer and resolves to the approved Page URL;
- every locale satisfies the typed translation contract;
- the icon follows the shared SVG component contract;
- lint passes;
- the static production build passes.

## Out of scope

- LinkedIn publishing or Buffer configuration;
- redesigning or reordering the remaining footer content;
- adding LinkedIn links outside the footer;
- analytics or tracking changes.
