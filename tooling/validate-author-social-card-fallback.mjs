import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [route, presentations] = await Promise.all([
  readFile("app/authors/[handle]/opengraph-image.tsx", "utf8"),
  readFile("lib/metadata/social-card-presentations.ts", "utf8"),
]);

assert.doesNotMatch(route, /Cannot generate a social card for unknown GitHub author/u);
assert.match(route, /createUnknownAuthorSocialCard\(handle\)/u);
assert.match(presentations, /export function createUnknownAuthorSocialCard/u);
assert.match(presentations, /Explore the current public job listings/u);

console.log("Author social-card fallback contract is valid.");
