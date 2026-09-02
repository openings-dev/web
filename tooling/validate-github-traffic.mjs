import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  mergeTrafficHistory,
  normalizeTrafficSnapshot,
} from "./github-traffic/traffic-history.mjs";

const snapshot = normalizeTrafficSnapshot({
  repository: "openings-dev/web",
  collectedAt: "2026-09-02T12:30:00.000Z",
  views: { count: 12, uniques: 5, views: [{ timestamp: "2026-09-01T00:00:00Z", count: 12, uniques: 5 }] },
  clones: { count: 7, uniques: 3, clones: [{ timestamp: "2026-09-01T00:00:00Z", count: 7, uniques: 3 }] },
  referrers: [{ referrer: "Google.com\n", count: 4, uniques: 3 }],
  paths: [
    { path: "/jobs/gh_secret?campaign=private", count: 8, uniques: 4 },
    { path: "/reports/2026-09", count: 2, uniques: 2 },
  ],
});

assert.equal(snapshot.referrers[0].referrer, "google.com");
assert.equal(snapshot.paths[0].path, "/jobs/:id");
assert.equal(snapshot.paths[1].path, "/reports/:month");
assert.equal(snapshot.days[0].date, "2026-09-01");

const once = mergeTrafficHistory(null, snapshot);
const twice = mergeTrafficHistory(once, snapshot);
assert.deepEqual(twice, once, "rerunning one collection day must not duplicate history");
assert.equal(once.days.length, 1);
assert.equal(once.snapshots.length, 1);
assert.doesNotMatch(JSON.stringify(once), /campaign|private|gh_secret/u);

const workflow = await readFile(".github/workflows/collect-github-traffic.yml", "utf8");
assert.match(workflow, /schedule:/u);
assert.match(workflow, /growth-metrics/u);
assert.match(workflow, /permissions:\s*\n\s*contents:\s*write/u);
assert.match(workflow, /tooling\/github-traffic/u);
assert.doesNotMatch(workflow, /git add \.|git add -A/u);

console.log("GitHub traffic history contract is valid.");
