import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile("lib/opportunities/author-artifact.ts", "utf8");
const client = await readFile("app/entity/author/client-author-page.tsx", "utf8");

assert.match(source, /schemaVersion\s*!==\s*1/u);
assert.match(source, /api\/authors/u);
assert.match(source, /encodeURIComponent\(normalizedHandle\)/u);
assert.match(source, /response\.status\s*===\s*404/u);
assert.match(source, /AUTHOR_ARTIFACT_MAX_BYTES/u);
assert.match(client, /fetchAuthorArtifact/u);
assert.doesNotMatch(client, /getSnapshotUserByHandle/u);

console.log("Author entity shell fetches one validated profile artifact.");
