# Favicon and Open Graph Reliability Design

## Objective

Adopt the canonical compact brand mark as the site favicon and make social preview images reliably consumable by Open Graph and Twitter crawlers in the statically exported site.

## Current behavior and root cause

The root layout still references the older `light-mode-favicon.svg` and `dark-mode-favicon.svg` assets instead of the canonical compact `brand-mark` assets.

Social cards render successfully during `next build`, but the generated static files are emitted at extensionless paths such as `/opengraph-image` and `/twitter-image`. The manually assembled metadata points to those extensionless URLs and omits the image MIME type. Correct delivery therefore depends on the deployment host assigning `image/png` to an extensionless file. Social crawlers may reject the image when the host serves it with a generic content type.

## Design

### Favicons

The root metadata will reference `brand-mark-light.svg` for light/default contexts and `brand-mark-dark.svg` for dark contexts. The shortcut icon will use the light/default mark. Apple touch metadata will use an explicit raster asset because SVG support is inconsistent across consumers.

### Social images

The existing Product Sheet card design remains unchanged. The build will expose social images through stable `.png` URLs so their media type can be inferred consistently by static hosts and crawlers.

Default Open Graph and Twitter metadata will use absolute `.png` URLs and declare `type: "image/png"`, width, height, and alternative text. Route-specific job, community, and author metadata will follow the same URL and MIME-type contract while preserving their existing titles, descriptions, and generated card contents.

### Static export compatibility

The implementation must remain compatible with Next.js 16.2 `output: "export"`. Generated or copied assets must exist in `out/` at the exact paths emitted in metadata. No runtime route, API handler, redirect, or host-specific header configuration will be introduced.

## Error handling

The build is the enforcement boundary. Missing social image artifacts, incorrect dimensions, or metadata pointing to absent files must fail verification before deployment rather than falling back to a fabricated image.

## Verification

Verification will confirm:

- root HTML references the new light and dark brand marks;
- Open Graph and Twitter image URLs are absolute and end in `.png`;
- social image metadata includes `image/png`, 1200×630 dimensions, and alt text;
- every referenced default and sampled route-specific image exists in `out/` and is a valid PNG;
- `npm run lint` passes;
- `npm run build` passes.

## Out of scope

- Redesigning social cards or brand artwork;
- changing titles, descriptions, canonical URLs, or locale behavior;
- deployment-provider configuration;
- cache invalidation on third-party social platforms.
