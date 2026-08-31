import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

async function source(relativePath) {
  return readFile(path.join(process.cwd(), relativePath), "utf8");
}

const [
  enumsSource,
  typesSource,
  apiTypesSource,
  validationSource,
  artifactsSource,
  routesSource,
  appShellSource,
  messageTypesSource,
  bannerSource,
  sponsoredBadgeSource,
  opportunityCardSource,
  opportunityDetailsSource,
  ...translationSources
] = await Promise.all([
  source("lib/opportunities/enums.ts"),
  source("lib/opportunities/types.ts"),
  source("lib/opportunities/api-types.ts"),
  source("lib/opportunities/static-artifact-validation.ts"),
  source("lib/opportunities/static-artifacts.ts"),
  source("lib/navigation/routes.ts"),
  source("app/_components/app-shell/index.tsx"),
  source("lib/translations/types.ts"),
  source("components/sponsored-opportunities-banner/index.tsx").catch(() => ""),
  source("app/opportunities/_components/opportunities-screen/sponsored-badge/index.tsx")
    .catch(() => ""),
  source("app/opportunities/_components/opportunities-screen/opportunity-card/index.tsx"),
  source("app/opportunities/_components/opportunity-details/index.tsx"),
  ...["en", "pt", "es", "it", "fr", "de"].map((locale) =>
    source(`lib/translations/${locale}.ts`)
  ),
]);

assert.match(
  enumsSource,
  /export enum OpportunityPromotionType\s*\{\s*Sponsored = "sponsored",?\s*\}/u,
  "Opportunity promotion must use the stable sponsored enum value",
);
assert.match(
  typesSource,
  /export interface OpportunityPromotion[\s\S]*?type: OpportunityPromotionType;[\s\S]*?promotion\?: OpportunityPromotion;/u,
  "Opportunity items must expose optional typed promotion metadata",
);
assert.match(
  apiTypesSource,
  /schemaVersion: 5;/u,
  "The static manifest type must require schema 5",
);
assert.match(
  apiTypesSource,
  /sponsoredOpportunities: number;/u,
  "The static manifest type must expose the sponsored total",
);
assert.match(
  apiTypesSource,
  /promotions: string;/u,
  "The static manifest type must expose the promotions artifact",
);
assert.match(
  validationSource,
  /STATIC_OPPORTUNITY_SCHEMA_VERSION = 5/u,
  "Static artifact validation must require schema version 5",
);
assert.match(
  validationSource,
  /OpportunityPromotionType\.Sponsored/u,
  "Static opportunity validation must reject unknown promotion values",
);
assert.match(
  validationSource,
  /parseStaticOpportunityPromotions/u,
  "The promotions index must have a strict parser",
);
assert.match(
  artifactsSource,
  /loadOpportunityPromotions/u,
  "Static artifacts must expose the sponsored opportunity IDs",
);
assert.match(
  artifactsSource,
  /manifest\.files\.promotions/u,
  "Static index consistency must include the promotions artifact",
);

const sortingTypeScript = await source("lib/opportunities/sort-opportunities.ts")
  .catch(() => "");
const sortingJavaScript = ts.transpileModule(sortingTypeScript, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const sortingModule = await import(
  `data:text/javascript;base64,${Buffer.from(sortingJavaScript).toString("base64")}`
).catch(() => ({}));
assert.equal(
  typeof sortingModule.compareOpportunities,
  "function",
  "Sponsored sorting must expose a pure opportunity comparator",
);
assert.equal(
  typeof sortingModule.sortOpportunityIdsByPromotion,
  "function",
  "Static API sorting must expose promotion-aware ID ordering",
);

const opportunity = (id, createdAt, sponsored = false) => ({
  id,
  createdAt,
  ...(sponsored ? { promotion: { type: "sponsored" } } : {}),
});
const recentInput = [
  opportunity("organic-new", "2026-08-31T00:00:00.000Z"),
  opportunity("sponsored-old", "2026-08-01T00:00:00.000Z", true),
  opportunity("organic-old", "2026-07-01T00:00:00.000Z"),
  opportunity("sponsored-new", "2026-08-15T00:00:00.000Z", true),
];
assert.deepEqual(
  [...recentInput]
    .sort((left, right) => sortingModule.compareOpportunities(left, right, "recent"))
    .map(({ id }) => id),
  ["sponsored-new", "sponsored-old", "organic-new", "organic-old"],
);
assert.deepEqual(
  [...recentInput]
    .sort((left, right) => sortingModule.compareOpportunities(left, right, "oldest"))
    .map(({ id }) => id),
  ["sponsored-old", "sponsored-new", "organic-old", "organic-new"],
);
assert.deepEqual(
  sortingModule.sortOpportunityIdsByPromotion(
    ["sponsored-new", "sponsored-old", "organic-new", "organic-old"],
    new Set(["sponsored-new", "sponsored-old"]),
    "oldest",
  ),
  ["sponsored-old", "sponsored-new", "organic-old", "organic-new"],
);

assert.match(
  routesSource,
  /sponsoredJobRequest:\s*"https:\/\/github\.com\/openings-dev\/jobs\/issues\/new\?template=sponsored-job\.yml"/u,
  "The advertiser route must point to the sponsored job Issue Form",
);
assert.match(
  appShellSource,
  /<Header\s*\/>[\s\S]*?<SponsoredOpportunitiesBanner\s*\/>[\s\S]*?<main/u,
  "AppShell must render the advertiser banner below the header and before content",
);
assert.match(
  messageTypesSource,
  /sponsorship:\s*\{[\s\S]*?banner:\s*\{[\s\S]*?message: string;[\s\S]*?detail: string;[\s\S]*?action: string;/u,
  "The translation contract must type the sponsored banner copy",
);
for (const translationSource of translationSources) {
  assert.match(
    translationSource,
    /sponsorship:\s*\{[\s\S]*?banner:\s*\{[\s\S]*?message:\s*"[^"\n]+"[\s\S]*?detail:\s*"[^"\n]+"[\s\S]*?action:\s*"[^"\n]+"/u,
    "Every locale must provide complete sponsored banner copy",
  );
}
assert.match(
  bannerSource,
  /messages\.sponsorship\.banner/u,
  "The shared banner must use localized copy",
);
assert.match(
  bannerSource,
  /EXTERNAL_ROUTES\.sponsoredJobRequest/u,
  "The shared banner must use the governed advertiser destination",
);
assert.match(
  bannerSource,
  /target="_blank"[\s\S]*?rel="noreferrer"/u,
  "The external advertiser action must open safely",
);
assert.match(
  messageTypesSource,
  /badge:\s*\{[\s\S]*?label: string;[\s\S]*?description: string;/u,
  "The translation contract must type sponsored disclosure copy",
);
for (const translationSource of translationSources) {
  assert.match(
    translationSource,
    /badge:\s*\{[\s\S]*?label:\s*"[^"\n]+"[\s\S]*?description:\s*"[^"\n]+"/u,
    "Every locale must provide sponsored disclosure copy",
  );
}
assert.match(
  sponsoredBadgeSource,
  /promotion\?\.type !== OpportunityPromotionType\.Sponsored/u,
  "The badge must render only for the sponsored enum value",
);
assert.match(
  sponsoredBadgeSource,
  /messages\.sponsorship\.badge/u,
  "The badge must use localized disclosure copy",
);
assert.match(
  opportunityCardSource,
  /<SponsoredBadge promotion=\{item\.promotion\}\s*\/>/u,
  "Opportunity cards must disclose sponsored placement",
);
assert.match(
  opportunityDetailsSource,
  /<SponsoredBadge promotion=\{item\.promotion\}\s*\/>/u,
  "Shared job details must disclose sponsored placement",
);

console.log("Sponsored opportunity data contract is valid.");
