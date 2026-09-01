import { AVAILABLE_LOCALES, type LocaleCode } from "@/lib/constants/locales";
import { resolveCanonicalUrl } from "./site-metadata";

export function localizedAlternates(locale: LocaleCode, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const languages = Object.fromEntries(AVAILABLE_LOCALES.map(({ code }) => [
    code,
    resolveCanonicalUrl(`/${code}${normalizedPath}`),
  ]));
  return {
    canonical: languages[locale],
    languages: { ...languages, "x-default": languages.en },
  };
}
