import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const componentPath = path.join(
  process.cwd(),
  "app/opportunities/_components/opportunities-screen/opportunity-drawer/drawer-action/index.tsx",
);
const detailsPath = path.join(
  process.cwd(),
  "app/opportunities/_components/opportunity-details/index.tsx",
);

const [componentSource, detailsSource] = await Promise.all([
  readFile(componentPath, "utf8"),
  readFile(detailsPath, "utf8"),
]);

assert.match(componentSource, /actionsLabel: string/u);
assert.match(componentSource, /closeActionsLabel: string/u);
assert.match(componentSource, /aria-haspopup="dialog"/u);
assert.match(componentSource, /role="dialog"/u);
assert.match(componentSource, /aria-modal="true"/u);
assert.match(componentSource, /event\.key === "Escape"/u);
assert.match(componentSource, /actionsButton\?\.focus\(\)/u);
assert.match(componentSource, /pb-\[max\([^\]]*env\(safe-area-inset-bottom\)/u);
assert.match(componentSource, /handleSecondaryAction/u);
assert.match(componentSource, /<Share2/u);
assert.match(componentSource, /<Bookmark/u);
assert.match(componentSource, /<CircleAlert/u);
assert.match(detailsSource, /actionsLabel=\{copy\.actions\}/u);
assert.match(detailsSource, /closeActionsLabel=\{copy\.closeActions\}/u);

console.log("Compact job actions contract is valid.");
