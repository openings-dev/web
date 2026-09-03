import { spawnSync } from "node:child_process";

const validators = [
  "validate-opportunity-details-header.mjs",
  "validate-metadata-export.mjs",
  "validate-communities-artifact.mjs",
  "validate-discovery-platform.mjs",
  "validate-comparison.mjs",
  "validate-report-problem.mjs",
  "validate-local-candidate-state.mjs",
  "validate-telemetry-contract.mjs",
  "validate-trust-surfaces.mjs",
  "validate-growth-surfaces.mjs",
  "validate-footer-social-links.mjs",
  "validate-repository-discovery.mjs",
  "validate-release-automation.mjs",
  "validate-contributor-paths.mjs",
  "validate-footer-growth.mjs",
  "validate-public-reports.mjs",
  "validate-github-traffic.mjs",
  "validate-ci-workflow.mjs",
];

for (const validator of validators) {
  const result = spawnSync(process.execPath, [`tooling/${validator}`], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    break;
  }
}
