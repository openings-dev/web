import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeferredHomeOpportunities } from "@/app/_components/deferred-home-opportunities";
import { HomeHero } from "@/app/_components/home-hero";
import { LocaleRouteSync } from "@/app/_components/locale-route-sync";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { isLocaleCode, LocaleCode } from "@/lib/constants/locales";
import {
  localizedOpenGraphLocales,
  localizedPublicAlternates,
} from "@/lib/metadata/localized-alternates";
import { createPageMetadata } from "@/lib/metadata/site-metadata";
import { LOCALIZED_ENTRY_LOCALES } from "@/lib/navigation/localized-routes";
import { getTranslations } from "@/lib/translations/get-translations";

interface LocalizedHomePageProps {
  params: Promise<{ locale: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALIZED_ENTRY_LOCALES.map((locale) => ({ locale }));
}

function resolvePage(locale: string) {
  if (!isLocaleCode(locale) || locale === LocaleCode.English) return null;
  return { locale, messages: getTranslations(locale) };
}

export async function generateMetadata({
  params,
}: LocalizedHomePageProps): Promise<Metadata> {
  const page = resolvePage((await params).locale);
  if (!page) return {};
  const title = `openings.dev | ${page.messages.home.title.replace(/\.$/u, "")}`;
  const base = createPageMetadata({
    title,
    description: page.messages.home.description,
    path: `/${page.locale}/`,
  });
  const openGraphLocales = localizedOpenGraphLocales(page.locale);
  return {
    ...base,
    alternates: localizedPublicAlternates(page.locale, "/"),
    openGraph: {
      ...base.openGraph,
      locale: openGraphLocales.locale,
      alternateLocale: openGraphLocales.alternateLocales,
    },
  };
}

export default async function LocalizedHomePage({
  params,
}: LocalizedHomePageProps): Promise<React.ReactNode> {
  const page = resolvePage((await params).locale);
  if (!page) notFound();

  return (
    <I18nProvider initialLocale={page.locale}>
      <LocaleRouteSync locale={page.locale} />
      <HomeHero />
      <DeferredHomeOpportunities />
    </I18nProvider>
  );
}
