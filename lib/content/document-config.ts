import { LocaleCode } from "@/lib/constants/locales";
import { ProjectDocumentKey } from "./document-types";
import { resolve } from "node:path";

interface DocumentFileConfig {
  rootFile: string;
  localizedDirectory: string;
  localizedStem: string;
}

const DOCUMENT_FILES: Record<ProjectDocumentKey, DocumentFileConfig> = {
  [ProjectDocumentKey.Overview]: { rootFile: "OVERVIEW.md", localizedDirectory: "overview", localizedStem: "OVERVIEW" },
  [ProjectDocumentKey.ApiReference]: { rootFile: "API_REFERENCE.md", localizedDirectory: "api-reference", localizedStem: "API_REFERENCE" },
  [ProjectDocumentKey.Maintainers]: { rootFile: "MAINTAINERS.md", localizedDirectory: "maintainers", localizedStem: "MAINTAINERS" },
  [ProjectDocumentKey.Contributing]: { rootFile: "CONTRIBUTING.md", localizedDirectory: "contributing", localizedStem: "CONTRIBUTING" },
  [ProjectDocumentKey.Privacy]: { rootFile: "PRIVACY.md", localizedDirectory: "privacy", localizedStem: "PRIVACY" },
  [ProjectDocumentKey.Terms]: { rootFile: "TERMS.md", localizedDirectory: "terms", localizedStem: "TERMS" },
  [ProjectDocumentKey.Methodology]: { rootFile: "METHODOLOGY.md", localizedDirectory: "methodology", localizedStem: "METHODOLOGY" },
};

export interface DocumentTarget {
  displayPath: string;
  absolutePath: string;
}

export function getDocumentTarget(
  key: ProjectDocumentKey,
  locale: LocaleCode,
): DocumentTarget {
  const config = DOCUMENT_FILES[key];
  const displayPath = locale === LocaleCode.English
    ? config.rootFile
    : `docs/${config.localizedDirectory}/${config.localizedStem}.${locale}.md`;
  return {
    displayPath,
    absolutePath: resolve(/* turbopackIgnore: true */ process.cwd(), displayPath),
  };
}
