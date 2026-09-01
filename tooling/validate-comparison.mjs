import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("lib/opportunities/comparison.ts", "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const comparison = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

assert.deepEqual(comparison.parseComparisonIds("a-job,a-job,b-job,c-job,d-job"), ["a-job", "b-job", "c-job"]);
assert.deepEqual(comparison.parseComparisonIds("a-job,invalid id,b-job"), ["a-job", "b-job"]);
assert.equal(comparison.serializeComparisonIds(["b-job", "a-job", "b-job"]), "b-job,a-job");
assert.equal(comparison.buildComparisonHref(["a-job", "b-job"]), "/compare?jobs=a-job%2Cb-job");

const page = await readFile("app/compare/page.tsx", "utf8");
const screen = await readFile("app/compare/_components/comparison-screen/index.tsx", "utf8");
assert.match(page, /ComparisonScreen/u);
assert.match(screen, /fetchOpportunityById/u);
assert.match(screen, /item\.sources/u);
assert.match(screen, /item\.freshness/u);

console.log("Comparison contract is valid.");
