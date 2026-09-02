import {
  DEFAULT_LOCALE as SHARED_DEFAULT_LOCALE,
  isSupportedLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@openingshq/core";

export const LocaleCode = {
  English: "en",
  Portuguese: "pt",
  Spanish: "es",
  Italian: "it",
  French: "fr",
  German: "de",
} as const;

export type LocaleCode = (typeof LocaleCode)[keyof typeof LocaleCode];

export interface LocaleOption {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
}

const SHARED_LOCALE_BY_WEB_LOCALE = {
  de: "de",
  en: "en",
  es: "es",
  fr: "fr",
  it: "it",
  pt: "pt-BR",
} as const satisfies Record<LocaleCode, SupportedLocale>;

const WEB_LOCALE_BY_SHARED_LOCALE = {
  de: LocaleCode.German,
  en: LocaleCode.English,
  es: LocaleCode.Spanish,
  fr: LocaleCode.French,
  it: LocaleCode.Italian,
  "pt-BR": LocaleCode.Portuguese,
} as const satisfies Record<SupportedLocale, LocaleCode>;

const LOCALE_DETAILS = {
  de: { label: "German", nativeLabel: "Deutsch" },
  en: { label: "English", nativeLabel: "English" },
  es: { label: "Spanish", nativeLabel: "Español" },
  fr: { label: "French", nativeLabel: "Français" },
  it: { label: "Italian", nativeLabel: "Italiano" },
  pt: { label: "Portuguese", nativeLabel: "Português" },
} as const satisfies Record<LocaleCode, Omit<LocaleOption, "code">>;

export const AVAILABLE_LOCALES = SUPPORTED_LOCALES.map((sharedLocale) => {
  const code = WEB_LOCALE_BY_SHARED_LOCALE[sharedLocale];

  return { code, ...LOCALE_DETAILS[code] };
}) satisfies readonly LocaleOption[];

export const DEFAULT_LOCALE = WEB_LOCALE_BY_SHARED_LOCALE[SHARED_DEFAULT_LOCALE];

export function isLocaleCode(value: string): value is LocaleCode {
  if (value === "pt-BR") return false;

  return isSupportedLocale(value === LocaleCode.Portuguese ? "pt-BR" : value);
}

export function toSupportedLocale(locale: LocaleCode): SupportedLocale {
  return SHARED_LOCALE_BY_WEB_LOCALE[locale];
}
