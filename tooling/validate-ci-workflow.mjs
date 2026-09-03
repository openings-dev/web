import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [workflow, packageSource] = await Promise.all([
  readFile(".github/workflows/validate.yml", "utf8"),
  readFile("package.json", "utf8"),
]);

assert.match(workflow, /^name: Validate$/mu);
assert.match(workflow, /^\s{2}pull_request:$/mu);
assert.match(workflow, /^\s{2}push:\s*\n\s{4}branches:\s*\[main\]$/mu);
assert.match(workflow, /permissions:\s*\n\s{2}contents: read/u);
assert.match(workflow, /cancel-in-progress: true/u);
assert.match(workflow, /actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/u);
assert.match(workflow, /actions\/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38/u);
assert.match(workflow, /node-version: ["']20["']/u);
assert.match(workflow, /npm ci/u);
assert.match(workflow, /npm run test/u);
assert.match(workflow, /npm run lint/u);
assert.match(workflow, /npm run build/u);
assert.match(workflow, /npm run test:metadata/u);
assert.doesNotMatch(workflow, /contents: write|pull-requests: write/u);

const commandOrder = [
  "npm run test",
  "npm run lint",
  "npm run build",
  "npm run test:metadata",
];
commandOrder.reduce((previousIndex, command) => {
  const index = workflow.indexOf(command);
  assert.ok(index > previousIndex, `${command} must follow its prerequisite`);
  return index;
}, -1);

const packageJson = JSON.parse(packageSource);
assert.equal(packageJson.scripts.test, "node tooling/run-validations.mjs");

console.log("Continuous validation workflow contract is valid.");
