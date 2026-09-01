export const PUBLIC_ROUTES = {
  home: "/",
  communities: "/communities",
  authors: "/authors",
  docs: "/docs",
  design: "/design",
  overview: "/docs/overview",
  apiReference: "/docs/api",
  communityGuide: "/docs/maintainers",
  contributing: "/docs/contributing",
  privacy: "/privacy",
  terms: "/terms",
  status: "/status",
  updates: "/updates",
  methodology: "/methodology",
} as const;

export const LEGACY_ROUTES = {
  overview: "/overview",
  communities: "/community",
  authors: "/users",
  design: "/design-system",
} as const;

export const EXTERNAL_ROUTES = {
  githubRepository: "https://github.com/openings-dev/web",
  bluesky: "https://bsky.app/profile/openingshq.bsky.social",
  mastodon: "https://mastodon.social/@openingshq",
  threads: "https://www.threads.com/@openingshq",
  instagram: "https://www.instagram.com/openingshq/",
  reportIssue: "mailto:support@openings.dev",
  support: "mailto:support@openings.dev",
} as const;
