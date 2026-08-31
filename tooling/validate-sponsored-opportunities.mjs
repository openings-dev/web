import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

async function source(relativePath) {
  return readFile(path.join(process.cwd(), relativePath), "utf8");
}

const [
  enumsSource,
  typesSource,
  apiTypesSource,
  validationSource,
  artifactsSource,
] = await Promise.all([
  source("lib/opportunities/enums.ts"),
  source("lib/opportunities/types.ts"),
  source("lib/opportunities/api-types.ts"),
  source("lib/opportunities/static-artifact-validation.ts"),
  source("lib/opportunities/static-artifacts.ts"),
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

console.log("Sponsored opportunity data contract is valid.");
