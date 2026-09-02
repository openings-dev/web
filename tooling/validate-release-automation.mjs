import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [workflow, releaseConfig, changelog] = await Promise.all([
  readFile(".github/workflows/publish-release.yml", "utf8"),
  readFile(".github/release.yml", "utf8"),
  readFile("CHANGELOG.md", "utf8"),
]);

assert.match(workflow, /tags:\s*\n\s*- ["']v\*["']/u);
assert.match(workflow, /contents:\s*write/u);
assert.match(workflow, /gh release view/u);
assert.match(workflow, /gh release create/u);
assert.match(workflow, /--generate-notes/u);
assert.match(workflow, /--verify-tag/u);
assert.doesNotMatch(workflow, /pull-requests:\s*write/u);
assert.match(releaseConfig, /New features/u);
assert.match(releaseConfig, /Fixes/u);
assert.match(releaseConfig, /New contributors/u);
assert.match(changelog, /# Changelog/u);
assert.match(changelog, /Semantic Versioning/u);

console.log("Release automation contract is valid.");
