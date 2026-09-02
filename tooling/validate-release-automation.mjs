import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [workflow, releaseConfig, changelog] = await Promise.all([
  readFile(".github/workflows/release-please.yml", "utf8"),
  readFile(".github/release.yml", "utf8"),
  readFile("CHANGELOG.md", "utf8"),
]);

assert.match(workflow, /branches:\s*\[main\]/u);
assert.match(workflow, /contents:\s*write/u);
assert.match(workflow, /pull-requests:\s*write/u);
assert.match(workflow, /googleapis\/release-please-action@v4/u);
assert.match(workflow, /release-type:\s*node/u);
assert.match(releaseConfig, /New features/u);
assert.match(releaseConfig, /Fixes/u);
assert.match(releaseConfig, /New contributors/u);
assert.match(changelog, /# Changelog/u);
assert.match(changelog, /Semantic Versioning/u);

console.log("Release automation contract is valid.");
