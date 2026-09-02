import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [roadmap, contributing, communityKit, maintainers, featureForm, correctionForm, issueConfig] =
  await Promise.all([
    readFile("ROADMAP.md", "utf8"),
    readFile("CONTRIBUTING.md", "utf8"),
    readFile("COMMUNITY_KIT.md", "utf8"),
    readFile("MAINTAINERS.md", "utf8"),
    readFile(".github/ISSUE_TEMPLATE/feature_request.yml", "utf8"),
    readFile(".github/ISSUE_TEMPLATE/content_correction.yml", "utf8"),
    readFile(".github/ISSUE_TEMPLATE/config.yml", "utf8"),
  ]);

assert.match(roadmap, /## Now/u);
assert.match(roadmap, /## Next/u);
assert.match(roadmap, /## Later/u);
assert.match(roadmap, /GitHub Discussions/u);
assert.match(contributing, /good first issue/u);
assert.match(contributing, /Source repository request/u);
assert.match(communityKit, /Listed on openings\.dev/u);
assert.match(communityKit, /communities\/OWNER\/REPOSITORY/u);
assert.match(communityKit, /img\.shields\.io/u);
assert.match(communityKit, /Request indexing/u);
assert.match(maintainers, /COMMUNITY_KIT\.md/u);
assert.match(featureForm, /labels:\s*\["enhancement"\]/u);
assert.match(featureForm, /Problem to solve/u);
assert.match(correctionForm, /labels:\s*\["content-correction"\]/u);
assert.match(issueConfig, /Join the discussion/u);
assert.match(issueConfig, /Pick a first issue/u);

console.log("Contributor paths contract is valid.");
