import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function source(relativePath) {
  try {
    return await readFile(path.join(process.cwd(), relativePath), "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

function scriptPaths(html) {
  return new Set(
    [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/gu)].map((match) => match[1]),
  );
}

const HOME_INITIAL_JS_BUDGET_BYTES = 1_338_710;
const DISCOVERY_IMPLEMENTATION_MARKER = "OpportunitiesFilters";

const [packageSource, homeSource, heroSource, deferredSource, opportunitiesRouteSource, sitemapSource, measurementSource] = await Promise.all([
  source("package.json"),
  source("app/page.tsx"),
  source("app/_components/home-hero/index.tsx"),
  source("app/_components/deferred-home-opportunities/index.tsx"),
  source("app/opportunities/page.tsx"),
  source("app/sitemap.ts"),
  source("docs/performance/home-discovery-runtime.md"),
]);

assert.doesNotMatch(
  homeSource,
  /opportunities\/_components\/opportunities-page/u,
  "The homepage must not statically import the discovery runtime",
);
assert.match(
  homeSource,
  /deferred-home-opportunities/u,
  "The homepage must render the deferred discovery boundary",
);
assert.match(
  deferredSource,
  /IntersectionObserver/u,
  "The discovery boundary must mount near the viewport",
);
assert.match(
  deferredSource,
  /return\s*\(\)\s*=>\s*\{[\s\S]*observer\.disconnect\(\)/u,
  "The discovery observer must be disconnected during cleanup",
);
assert.match(
  deferredSource,
  /min-h-\[42rem\]/u,
  "The deferred discovery region must reserve space to avoid layout shift",
);
assert.match(
  heroSource,
  /<a href="#opportunity-results">/u,
  "The hero action must remain an ordinary keyboard-accessible anchor",
);
assert.match(
  deferredSource,
  /rootMargin:\s*"600px 0px"/u,
  "The discovery boundary must begin loading 600px before the viewport",
);
assert.match(
  deferredSource,
  /import\("@\/app\/opportunities\/_components\/opportunities-screen"\)/u,
  "The heavy discovery runtime must use an on-demand import",
);
assert.match(
  deferredSource,
  /typeof IntersectionObserver === "undefined"/u,
  "Browsers without IntersectionObserver must retain a usable fallback",
);
assert.match(
  deferredSource,
  /id="opportunity-results"/u,
  "The reserved discovery region must preserve its public anchor",
);
assert.match(
  deferredSource,
  /href="\/opportunities"/u,
  "The no-JavaScript fallback must link to the dedicated discovery route",
);
assert.match(
  opportunitiesRouteSource,
  /<OpportunitiesPage/u,
  "The dedicated discovery route must render the complete discovery experience",
);
assert.match(
  sitemapSource,
  /entry\("\/opportunities"/u,
  "The dedicated discovery route must remain discoverable to search engines",
);
assert.match(
  measurementSource,
  /Raw, uncompressed JavaScript bytes/u,
  "The performance evidence must clearly label its byte measurements as raw and uncompressed",
);
assert.match(
  packageSource,
  /validate-home-performance\.mjs --exported/u,
  "The production build must validate the actual exported homepage",
);
assert.match(
  measurementSource,
  /c5f73b4/u,
  "The performance evidence must identify the baseline revision",
);
assert.match(
  measurementSource,
  /discovery runtime/u,
  "The performance evidence must tie the removed initial chunks to the discovery runtime",
);

if (process.argv.includes("--exported")) {
  const [homeHtml, opportunitiesHtml, routeStatsSource] = await Promise.all([
    source("out/index.html"),
    source("out/opportunities/index.html"),
    source(".next/diagnostics/route-bundle-stats.json"),
  ]);

  assert.match(homeHtml, /href="#opportunity-results"/u, "The exported hero must retain its results anchor");
  assert.match(homeHtml, /id="opportunity-results"/u, "The exported homepage must retain the results target");
  assert.match(homeHtml, /href="\/opportunities\/"/u, "The exported no-JavaScript fallback must link to discovery");

  const homeScripts = scriptPaths(homeHtml);
  const opportunitiesOnlyScripts = [...scriptPaths(opportunitiesHtml)].filter(
    (scriptPath) => !homeScripts.has(scriptPath),
  );
  const opportunitiesOnlySources = await Promise.all(
    opportunitiesOnlyScripts.map((scriptPath) => source(`out${scriptPath}`)),
  );

  assert.ok(
    opportunitiesOnlySources.some((chunkSource) => /OpportunitiesScreen/u.test(chunkSource)),
    "The exported discovery route must have a discovery runtime chunk absent from initial homepage scripts",
  );

  assert.ok(
    routeStatsSource,
    "Missing .next/diagnostics/route-bundle-stats.json; run the validator after next build",
  );
  const routeStats = JSON.parse(routeStatsSource);
  const homeStats = routeStats.find(({ route }) => route === "/");
  const opportunitiesStats = routeStats.find(({ route }) => route === "/opportunities");

  assert.ok(homeStats, "Next.js route bundle diagnostics do not contain the homepage route");
  assert.ok(opportunitiesStats, "Next.js route bundle diagnostics do not contain /opportunities");
  assert.ok(
    homeStats.firstLoadUncompressedJsBytes <= HOME_INITIAL_JS_BUDGET_BYTES,
    `Homepage initial JavaScript is ${homeStats.firstLoadUncompressedJsBytes.toLocaleString("en-US")} raw bytes; budget is ${HOME_INITIAL_JS_BUDGET_BYTES.toLocaleString("en-US")} bytes. Review new initial chunks or intentionally update the documented budget.`,
  );

  const homeInitialSources = await Promise.all(homeStats.firstLoadChunkPaths.map(source));
  const opportunitiesOnlyChunkPaths = opportunitiesStats.firstLoadChunkPaths.filter(
    (chunkPath) => !homeStats.firstLoadChunkPaths.includes(chunkPath),
  );
  const opportunitiesOnlyInitialSources = await Promise.all(
    opportunitiesOnlyChunkPaths.map(source),
  );

  assert.ok(
    homeInitialSources.every((chunkSource) => !chunkSource.includes(DISCOVERY_IMPLEMENTATION_MARKER)),
    `Discovery implementation marker ${DISCOVERY_IMPLEMENTATION_MARKER} leaked into a homepage initial chunk; keep discovery behind the dynamic boundary.`,
  );
  assert.ok(
    opportunitiesOnlyInitialSources.some((chunkSource) => chunkSource.includes(DISCOVERY_IMPLEMENTATION_MARKER)),
    `Discovery implementation marker ${DISCOVERY_IMPLEMENTATION_MARKER} was not found in /opportunities-only initial chunks; review the marker or chunk boundary.`,
  );
}

console.log("Homepage performance contract is valid.");
