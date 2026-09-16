import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const ROOTS = [
  "app",
  "components",
  "lib/metadata",
  "lib/translations",
];
const COPY_FILE_PATTERN = /\.(?:md|ts|tsx)$/u;
const DASH_PATTERN = /[\u2013\u2014]/u;

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return COPY_FILE_PATTERN.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

const files = [
  "DESIGN.md",
  ...(await Promise.all(ROOTS.map(sourceFiles))).flat(),
];

for (const file of files) {
  const source = await readFile(file, "utf8");
  assert.doesNotMatch(
    source,
    DASH_PATTERN,
    `${file} contains an en dash or em dash. Rewrite it with plain punctuation or natural range copy.`,
  );
}

console.log(`Copy style validated across ${files.length} source files.`);
