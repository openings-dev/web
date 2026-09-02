import { writeFile } from "node:fs/promises";
import { normalizeTrafficSnapshot } from "./traffic-history.mjs";

const outputPath = process.argv[2];
const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.TRAFFIC_TOKEN;

if (!outputPath) throw new TypeError("Usage: node collect.mjs <output-path>");
if (!repository || !token) throw new TypeError("GITHUB_REPOSITORY and TRAFFIC_TOKEN are required.");

async function request(path) {
  const response = await fetch(`https://api.github.com/repos/${repository}/traffic/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GitHub traffic ${path} request failed with ${response.status}.`);
  return response.json();
}

const [views, clones, referrers, paths] = await Promise.all([
  request("views"),
  request("clones"),
  request("popular/referrers"),
  request("popular/paths"),
]);
const snapshot = normalizeTrafficSnapshot({
  repository,
  collectedAt: new Date().toISOString(),
  views,
  clones,
  referrers,
  paths,
});

await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Collected aggregate GitHub traffic for ${snapshot.collectedOn}.`);
