import { openingsDataUrl } from "./data-source";
import { normalizeAuthorHandle } from "./routing";
import type { UserSummary } from "./users";

export const AUTHOR_ARTIFACT_MAX_BYTES = 32 * 1024;

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseAuthorArtifact(value: unknown, expectedHandle: string): UserSummary {
  if (!value || typeof value !== "object") throw new Error("Invalid author artifact");
  const artifact = value as Record<string, unknown>;
  if (artifact.schemaVersion !== 1 || !nonEmptyString(artifact.generatedAt)) {
    throw new Error("Invalid author artifact version");
  }
  if (!artifact.author || typeof artifact.author !== "object") {
    throw new Error("Invalid author artifact profile");
  }
  const author = artifact.author as Record<string, unknown>;
  const handle = nonEmptyString(author.handle);
  const name = nonEmptyString(author.name);
  const avatarUrl = optionalString(author.avatarUrl);
  const region = optionalString(author.region);
  const country = optionalString(author.country);
  const opportunitiesCount = author.opportunitiesCount;
  const lastPostedAt = author.lastPostedAt;
  if (
    handle !== expectedHandle || !name || avatarUrl === null || region === null ||
    country === null || typeof opportunitiesCount !== "number" ||
    !Number.isInteger(opportunitiesCount) || opportunitiesCount < 1 ||
    !(lastPostedAt === null || nonEmptyString(lastPostedAt))
  ) {
    throw new Error("Invalid author artifact fields");
  }
  return {
    handle,
    name,
    avatarUrl,
    region,
    country,
    opportunitiesCount,
    lastPostedAt: lastPostedAt as string | null,
  };
}

export async function fetchAuthorArtifact(handle: string): Promise<UserSummary | null> {
  const normalizedHandle = normalizeAuthorHandle(handle);
  if (!normalizedHandle) return null;
  const url = openingsDataUrl(`api/authors/${encodeURIComponent(normalizedHandle)}.json`);
  const response = await fetch(url, {
    cache: "default",
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Author artifact request failed (${response.status})`);
  }
  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > AUTHOR_ARTIFACT_MAX_BYTES) {
    throw new Error("Author artifact exceeds its size limit");
  }
  try {
    return parseAuthorArtifact(JSON.parse(body), normalizedHandle);
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Author artifact is not valid JSON");
    throw error;
  }
}
