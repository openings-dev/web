import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_MAXIMUM_FILES = 20_000;
const DEFAULT_MAXIMUM_FILE_BYTES = 25 * 1024 * 1024;

export async function prepareCloudflarePagesExport({
  source,
  target,
  maximumFiles = DEFAULT_MAXIMUM_FILES,
  maximumFileBytes = DEFAULT_MAXIMUM_FILE_BYTES,
}) {
  const sourceRoot = resolve(source);
  const targetRoot = resolve(target);
  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });
  await cp(sourceRoot, targetRoot, {
    recursive: true,
    filter: (sourcePath) => {
      const path = relative(sourceRoot, sourcePath);
      return path !== "jobs" && !path.startsWith(`jobs${sep}`);
    },
  });

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

  return { fileCount: files.length, totalBytes };
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
