import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

async function source(relativePath) {
  return readFile(path.join(process.cwd(), relativePath), "utf8");
}

const [
  indexOperationsSource,
  localDiscoverySource,
  localCandidateStateSource,
  selectedOpportunitySource,
  staticApiSource,
  listFooterSource,
  listControllerSource,
  defaultsSource,
  opportunityDetailsSource,
  routesSource,
  statusPageSource,
  statusScreenSource,
  communitiesSource,
] = await Promise.all([
  source("lib/opportunities/index-operations.ts"),
  source("app/opportunities/_components/opportunities-screen/controller/use-local-discovery.ts"),
  source("lib/opportunities/local-candidate-state.ts"),
  source("app/opportunities/_components/opportunities-screen/controller/use-selected-opportunity.ts"),
  source("lib/opportunities/static-api.ts"),
  source("app/opportunities/_components/opportunities-screen/opportunities-list/list-footer/index.tsx"),
  source("app/opportunities/_components/opportunities-screen/controller/use-opportunities-screen-controller.ts"),
  source("app/opportunities/_components/opportunities-screen/controller/defaults.ts"),
  source("app/opportunities/_components/opportunity-details/index.tsx"),
  source("lib/navigation/routes.ts"),
  source("app/status/page.tsx"),
  source("app/status/_components/status-screen/index.tsx"),
  source("app/community/_components/communities-screen/index.tsx"),
]);

const indexOperationsJavaScript = ts.transpileModule(indexOperationsSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const indexOperations = await import(
  `data:text/javascript;base64,${Buffer.from(indexOperationsJavaScript).toString("base64")}`
);

const searchIndex = {
  generatedAt: "2026-08-31T00:00:00.000Z",
  items: [
    {
      id: "react",
      createdAt: "2026-08-31T00:00:00.000Z",
      text: "react engineer",
      fields: {
        title: "react engineer",
        company: "acme",
        taxonomy: "frontend react typescript",
        location: "brazil remote",
        excerpt: "build interfaces",
        source: "community a",
      },
    },
    {
      id: "python",
      createdAt: "2026-08-30T00:00:00.000Z",
      text: "python engineer",
      fields: {
        title: "python engineer",
        company: "beta",
        taxonomy: "backend python",
        location: "portugal hybrid",
        excerpt: "build services",
        source: "community b",
      },
    },
    {
      id: "machine-learning",
      createdAt: "2026-08-29T00:00:00.000Z",
      text: "machine learning specialist",
      fields: {
        title: "machine learning specialist",
        company: "gamma",
        taxonomy: "data ai python",
        location: "global remote",
        excerpt: "train models",
        source: "community c",
      },
    },
    {
      id: "fullstack",
      createdAt: "2026-08-28T00:00:00.000Z",
      text: "fullstack engineer react python",
      fields: {
        title: "fullstack engineer",
        company: "delta",
        taxonomy: "fullstack react python",
        location: "brazil remote",
        excerpt: "build products",
        source: "community d",
      },
    },
    {
      id: "django",
      createdAt: "2026-08-27T00:00:00.000Z",
      text: "django developer",
      fields: {
        title: "django developer",
        company: "epsilon",
        taxonomy: "backend django python",
        location: "brazil remote",
        excerpt: "build web services",
        source: "community e",
      },
    },
  ],
};

assert.deepEqual(
  indexOperations.buildOpportunitySearchRanking(searchIndex, "react enginer").slice(0, 1),
  ["react"],
  "Relevance search must rank a title match first while tolerating a one-character typo",
);
assert.equal(
  indexOperations.buildOpportunitySearchRanking(searchIndex, "ia").includes("machine-learning"),
  true,
  "Relevance search must expand Portuguese AI synonyms",
);
assert.deepEqual(
  indexOperations.buildOpportunitySearchRanking(searchIndex, "react python"),
  ["fullstack"],
  "Every search term must match the same opportunity",
);
assert.equal(
  indexOperations.buildOpportunitySearchRanking(searchIndex, "go").includes("django"),
  false,
  "Short search terms must match complete words instead of substrings",
);

assert.match(localCandidateStateSource, /localStorage/u, "Saved jobs must persist locally");
assert.match(localDiscoverySource, /length < 3/u, "Comparison must be limited to three jobs");
assert.match(localDiscoverySource, /resolveOpportunityIds/u, "Legacy saved IDs must migrate to canonical jobs");
assert.match(localDiscoverySource, /comparisonItems/u, "Compared jobs must remain available after filters change");
assert.match(localDiscoverySource, /previousVisitAt/u, "The previous visit timestamp must be exposed");
assert.match(staticApiSource, /Object\.keys\(aliases\.ids\)/u, "Static job routes must include legacy alias IDs");
assert.doesNotMatch(selectedOpportunitySource, /item\.id !== selectedId/u, "Alias resolutions must open the canonical job");
assert.match(listFooterSource, /onClick=\{onLoadMore\}/u, "Loading more must require an explicit action");
assert.doesNotMatch(listControllerSource, /IntersectionObserver/u, "Automatic infinite scrolling must stay disabled");
assert.doesNotMatch(listControllerSource, /useEnsurePageLoaded/u, "Pagination must not prefetch extra pages automatically");
assert.doesNotMatch(listControllerSource, /useForcedAuthorAutoload/u, "Author profiles must not load pages automatically");
assert.match(defaultsSource, /country:\s*ALL_FILTER_VALUE/u, "The unfiltered landing page must show opportunities globally");
assert.match(opportunityDetailsSource, /buildOpportunityReportMailto/u, "Reports must go to support by email");
assert.match(routesSource, /reportIssue:\s*"mailto:support@openings\.dev"/u, "Every report entry point must use the support email");
assert.doesNotMatch(routesSource, /web\/issues\/new/u, "The product must not expose a second GitHub bug-report path");
assert.match(opportunityDetailsSource, /item\.sources/u, "Details must expose every deduplicated source");
assert.match(statusPageSource, /getCommunityStatus/u, "The status page must use the synchronization artifact");
assert.match(statusScreenSource, /lastSuccessfulSyncAt/u, "The status table must show the last successful sync");
assert.match(communitiesSource, /opportunitiesCount > 0/u, "Communities must distinguish active sources");

console.log("Discovery platform contract is valid.");
