import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

function dataModule(source) {
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

const source = await readFile("components/android-app-promotion/dismissal.ts", "utf8");
const dismissal = await import(dataModule(source));
const values = new Map();
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};

assert.equal(
  dismissal.ANDROID_APP_PROMOTION_DISMISSED_KEY,
  "openings:android-app-promotion:dismissed:v1",
);
assert.equal(dismissal.readAndroidAppPromotionDismissed(storage), false);
assert.equal(dismissal.writeAndroidAppPromotionDismissed(storage), true);
assert.equal(dismissal.readAndroidAppPromotionDismissed(storage), true);
assert.equal(
  dismissal.readAndroidAppPromotionDismissed({
    getItem: () => {
      throw new Error("storage unavailable");
    },
    setItem: storage.setItem,
  }),
  false,
);
assert.equal(
  dismissal.writeAndroidAppPromotionDismissed({
    getItem: storage.getItem,
    setItem: () => {
      throw new Error("storage unavailable");
    },
  }),
  false,
);

console.log("Android app promotion contract validated.");
