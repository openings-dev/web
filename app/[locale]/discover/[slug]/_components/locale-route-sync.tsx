"use client";

import { useEffect } from "react";
import { LOCALE_CHANGE_EVENT } from "@/components/providers/i18n-provider/constants";
import { setStoredLocale } from "@/components/providers/i18n-provider/helpers";
import { isLocaleCode } from "@/lib/constants/locales";

export function LocaleRouteSync({ locale }: { locale: string }) {
  useEffect(() => {
    if (!isLocaleCode(locale)) return;
    setStoredLocale(locale);
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, [locale]);
  return null;
}
