import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [readme, socialImage] = await Promise.all([
  readFile("README.md", "utf8"),
  readFile("app/opengraph-image.tsx", "utf8"),
]);

assert.match(readme, /Find tech jobs shared by GitHub communities\./u);
assert.match(readme, /Search open jobs/u);
assert.match(readme, /Add your community/u);
assert.match(readme, /Star on GitHub/u);
assert.match(readme, /Current public index/u);
assert.match(readme, /manifest\.json/u);
assert.match(readme, /%24\.totals\.openOpportunities/u);
assert.match(readme, /%24\.totals\.communities/u);
assert.match(readme, /%24\.totals\.countries/u);
assert.match(readme, /https:\/\/openings\.dev\/opengraph-image\.png/u);
assert.doesNotMatch(readme, />\s*794\s*</u);

assert.match(socialImage, /loadOpportunityManifest/u);
assert.match(socialImage, /async function OpenGraphImage/u);
assert.match(socialImage, /label:\s*"Open jobs"/u);
assert.match(socialImage, /label:\s*"Communities"/u);
assert.match(socialImage, /label:\s*"Countries"/u);
assert.match(socialImage, /manifest\.totals\.openOpportunities/u);
assert.match(socialImage, /manifest\.totals\.communities/u);
assert.match(socialImage, /manifest\.totals\.countries/u);

console.log("Repository discovery contract is valid.");
