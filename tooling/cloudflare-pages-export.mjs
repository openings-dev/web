import { copyFile, cp, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

export const MAXIMUM_PAGES_FILES = 2_000;
export const MAXIMUM_PAGES_BYTES = 500 * 1024 * 1024;
export const MAXIMUM_PAGE_FILE_BYTES = 20 * 1024 * 1024;

export function isDynamicEntityDirectory(path) {
  const segments = path.split(sep);
  if (segments[0] === "jobs") return segments.length === 2;
  if (["authors", "users"].includes(segments[0])) return segments.length === 2;
  if (["communities", "community"].includes(segments[0])) return segments.length === 3;
  return false;
}

export async function prepareCloudflarePagesExport({
  source,
  target,
  maximumFiles = MAXIMUM_PAGES_FILES,
  maximumBytes = MAXIMUM_PAGES_BYTES,
  maximumFileBytes = MAXIMUM_PAGE_FILE_BYTES,
}) {
  const sourceRoot = resolve(source);
  const targetRoot = resolve(target);
  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });
  await cp(sourceRoot, targetRoot, {
    recursive: true,
    filter: async (sourcePath) => {
      const path = relative(sourceRoot, sourcePath);
      if (!path) return true;
      const metadata = await stat(sourcePath);
      return !metadata.isDirectory() || !isDynamicEntityDirectory(path);
    },
  });

  for (const route of ["authors", "users", "communities", "community"]) {
    const aliasDirectory = resolve(targetRoot, "route-indexes", route);
    await mkdir(aliasDirectory, { recursive: true });
    await copyFile(
      resolve(sourceRoot, route, "index.html"),
      resolve(aliasDirectory, "index.html"),
    );
  }

  await writeFile(resolve(targetRoot, "_worker.js"), `${pagesWorkerSource()}\n`, "utf8");

  const files = await collectFiles(targetRoot);
  if (files.length > maximumFiles) {
    throw new Error(
      `Cloudflare Pages shell has ${String(files.length)} files; limit is ${String(maximumFiles)}`,
    );
  }

  let totalBytes = 0;
  for (const file of files) {
    const metadata = await stat(file);
    totalBytes += metadata.size;
    if (metadata.size > maximumFileBytes) {
      throw new Error(`Cloudflare Pages file exceeds 25 MiB: ${relative(targetRoot, file)}`);
    }
  }

  if (totalBytes > maximumBytes) {
    throw new Error(
      `Cloudflare Pages shell has ${String(totalBytes)} bytes; limit is ${String(maximumBytes)}`,
    );
  }

  return { fileCount: files.length, totalBytes };
}

function pagesWorkerSource() {
  return `const PLATFORM_ORIGIN = "https://publishing-platform-staging.business-850.workers.dev";
const ENTITY_ROUTE = /^\\/(?:jobs\\/[^/]+|(?:authors|users)\\/[^/]+|(?:communities|community)\\/[^/]+\\/[^/]+)\\/?$/u;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (ENTITY_ROUTE.test(url.pathname)) {
      const target = new URL(\`/web/openings\${url.pathname}\`, PLATFORM_ORIGIN);
      const response = await fetch(new Request(target, request));
      if (response.status !== 404) return response;
    }
    return env.ASSETS.fetch(request);
  },
};`;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  }));
  return nested.flat();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await prepareCloudflarePagesExport({
    source: "out",
    target: ".cloudflare/pages-preview",
  });
  console.log(
    `Prepared Cloudflare Pages shell: ${String(result.fileCount)} files, ${String(result.totalBytes)} bytes.`,
  );
}
