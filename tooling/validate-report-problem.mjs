import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("lib/opportunities/report-problem.ts", "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const report = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);
const href = report.buildOpportunityReportMailto({
  title: "Wrong location\r\nBcc: attacker@example.com",
  canonicalUrl: "https://openings.dev/jobs/gh_123",
  primarySourceUrl: "https://github.com/example/jobs/issues/1",
  prompt: "Choose a problem:",
  categories: ["Closed", "Duplicate", "Wrong location", "Inappropriate content"],
});

assert.match(href, /^mailto:support@openings\.dev\?/u);
assert.doesNotMatch(decodeURIComponent(href), /\r|\nBcc:/u);
for (const value of ["gh_123", "github.com/example/jobs/issues/1", "Closed", "Duplicate", "Wrong location", "Inappropriate content"]) {
  assert.equal(decodeURIComponent(href.replaceAll("+", " ")).includes(value), true);
}

const headerSource = await readFile("components/header/index.tsx", "utf8");
const mobileSupportLinks = headerSource.match(/href:\s*EXTERNAL_ROUTES\.(?:support|reportIssue)/gu) ?? [];
assert.equal(mobileSupportLinks.length, 1, "Mobile navigation must expose one support email action");

console.log("Problem report mailto contract is valid.");
