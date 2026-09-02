import { readFile, writeFile } from "node:fs/promises";
import { mergeTrafficHistory } from "./traffic-history.mjs";

const [snapshotPath, historyPath, outputPath = historyPath] = process.argv.slice(2);
if (!snapshotPath || !historyPath || !outputPath) {
  throw new TypeError("Usage: node merge-history.mjs <snapshot> <history> [output]");
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

const snapshot = await readJson(snapshotPath);
const existing = await readJson(historyPath, null);
const history = mergeTrafficHistory(existing, snapshot);
await writeFile(outputPath, `${JSON.stringify(history, null, 2)}\n`, "utf8");
console.log(`Traffic history now contains ${history.snapshots.length} daily snapshots.`);
