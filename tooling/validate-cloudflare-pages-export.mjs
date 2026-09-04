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
  await mkdir(join(source, "authors", "alice"), { recursive: true });
  await mkdir(join(source, "users", "alice"), { recursive: true });
  await mkdir(join(source, "communities", "acme", "jobs"), { recursive: true });
  await mkdir(join(source, "community", "acme", "jobs"), { recursive: true });
  await writeFile(join(source, "index.html"), "home");
  await writeFile(join(source, "_next", "static", "app.js"), "asset");
  await writeFile(join(source, "jobs", "job-123", "index.html"), "job");
  await writeFile(join(source, "authors", "index.html"), "authors");
  await writeFile(join(source, "authors", "alice", "index.html"), "author");
  await writeFile(join(source, "users", "index.html"), "users");
  await writeFile(join(source, "users", "alice", "index.html"), "user");
  await writeFile(join(source, "communities", "index.html"), "communities");
  await writeFile(join(source, "communities", "acme", "jobs", "index.html"), "community");
  await writeFile(join(source, "community", "index.html"), "community-index");
  await writeFile(join(source, "community", "acme", "jobs", "index.html"), "legacy-community");

  const result = await prepareCloudflarePagesExport({ source, target, maximumFiles: 20_000 });

  assert.equal(result.fileCount, 6);
  assert.equal(await readFile(join(target, "index.html"), "utf8"), "home");
  assert.equal(await readFile(join(target, "_next", "static", "app.js"), "utf8"), "asset");
  assert.equal(await readFile(join(target, "authors", "index.html"), "utf8"), "authors");
  assert.equal(await readFile(join(target, "users", "index.html"), "utf8"), "users");
  assert.equal(await readFile(join(target, "communities", "index.html"), "utf8"), "communities");
  assert.equal(await readFile(join(target, "community", "index.html"), "utf8"), "community-index");
  await assert.rejects(access(join(target, "jobs", "job-123", "index.html")));
  await assert.rejects(access(join(target, "authors", "alice", "index.html")));
  await assert.rejects(access(join(target, "users", "alice", "index.html")));
  await assert.rejects(access(join(target, "communities", "acme", "jobs", "index.html")));
  await assert.rejects(access(join(target, "community", "acme", "jobs", "index.html")));
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log("Cloudflare Pages shell export contract is valid.");
