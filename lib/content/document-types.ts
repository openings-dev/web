import type { LocaleCode } from "@/lib/constants/locales";

export enum ProjectDocumentKey {
  Overview = "overview",
  ApiReference = "api-reference",
  Maintainers = "maintainers",
  Contributing = "contributing",
  Privacy = "privacy",
  Terms = "terms",
  Methodology = "methodology",
}

export interface ProjectDocumentBundle {
  markdownByLocale: Partial<Record<LocaleCode, string>>;
  sourceFileByLocale: Partial<Record<LocaleCode, string>>;
}
