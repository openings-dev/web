import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile("lib/opportunities/local-candidate-state.ts", "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const candidateState = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`);

assert.deepEqual(candidateState.parseCandidateState("not json"), candidateState.EMPTY_CANDIDATE_STATE);
const migrated = candidateState.parseCandidateState(JSON.stringify({ version: 1, favorites: ["a", "a", "b"] }));
assert.deepEqual(Object.keys(migrated.saved), ["a", "b"]);
const parsed = candidateState.parseCandidateState(JSON.stringify({
  version: 2,
  saved: { a: "2026-08-31T00:00:00.000Z", bad: "invalid" },
  viewed: { b: "2026-08-31T01:00:00.000Z" },
  lastVisitAt: "2026-08-30T00:00:00.000Z",
  preferences: { country: "Brazil", technologies: ["react", "react", 42] },
}));
assert.deepEqual(Object.keys(parsed.saved), ["a"]);
assert.deepEqual(Object.keys(parsed.viewed), ["b"]);
assert.deepEqual(parsed.preferences.technologies, ["react"]);

console.log("Local candidate state contract is valid.");
