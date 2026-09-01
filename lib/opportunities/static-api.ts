import {
  loadOpportunityAliases,
  loadOpportunityJobIds,
  loadOpportunityManifest,
  loadOpportunityItems,
  withStaticArtifactRecovery,
} from "./static-artifacts";

export {
  getOpeningsDataBaseUrl,
  getOpeningsDataRepositoryBaseUrl,
  openingsDataRepositoryUrl,
  openingsDataUrl,
} from "./data-source";

export async function listStaticOpportunityIds(): Promise<string[]> {
  return withStaticArtifactRecovery(async () => {
    const manifest = await loadOpportunityManifest();
    return loadOpportunityJobIds(manifest);
  });
}

export async function listStaticOpportunities() {
  return withStaticArtifactRecovery(async () => {
    const manifest = await loadOpportunityManifest();
    const ids = await loadOpportunityJobIds(manifest);
    return loadOpportunityItems(ids, manifest);
  });
}

export async function getStaticOpportunityGeneratedAt() {
  return withStaticArtifactRecovery(async () =>
    (await loadOpportunityManifest()).generatedAt);
}

export async function listStaticOpportunityRouteIds(): Promise<string[]> {
  return withStaticArtifactRecovery(async () => {
    const manifest = await loadOpportunityManifest();
    const [ids, aliases] = await Promise.all([
      loadOpportunityJobIds(manifest),
      loadOpportunityAliases(manifest),
    ]);
    const publicAliases = Object.keys(aliases.ids).filter((id) => /^gh_[a-f\d]+$/i.test(id));
    return [...new Set([...ids, ...publicAliases])];
  });
}
