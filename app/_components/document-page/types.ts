import type { LocaleCode } from "@/lib/constants/locales";

export type DocumentPageKey =
  | "overview"
  | "apiReference"
  | "maintainers"
  | "contributing"
  | "privacy"
  | "terms"
  | "methodology";

export interface DocumentPageProps {
  documentKey: DocumentPageKey;
  markdownByLocale: Partial<Record<LocaleCode, string>>;
  sourceFileByLocale: Partial<Record<LocaleCode, string>>;
}

export interface DocumentMarkdownProps {
  markdown: string;
  idPrefix?: string;
}
