import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { prepareCloudflarePagesExport } from "./cloudflare-pages-export.mjs";

const root = await mkdtemp(join(tmpdir(), "openings-pages-export-"));
const source = join(root, "out");
const target = join(root, "preview");

try {
  await mkdir(join(source, "_next", "static"), { recursive: true });
  await mkdir(join(source, "jobs", "job-123"), { recursive: true });
  await writeFile(join(source, "index.html"), "home");
  await writeFile(join(source, "_next", "static", "app.js"), "asset");
  await writeFile(join(source, "jobs", "job-123", "index.html"), "job");

  const result = await prepareCloudflarePagesExport({ source, target, maximumFiles: 20_000 });

  assert.equal(result.fileCount, 2);
  assert.equal(await readFile(join(target, "index.html"), "utf8"), "home");
  assert.equal(await readFile(join(target, "_next", "static", "app.js"), "utf8"), "asset");
  await assert.rejects(access(join(target, "jobs", "job-123", "index.html")));
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log("Cloudflare Pages shell export contract is valid.");
