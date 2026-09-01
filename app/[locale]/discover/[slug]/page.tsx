import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AVAILABLE_LOCALES, isLocaleCode } from "@/lib/constants/locales";
import {
  CURATED_DISCOVERY_PRESETS,
  curatedPresetBySlug,
  matchesCuratedPreset,
} from "@/lib/discovery/curated-pages";
import { localizedAlternates } from "@/lib/metadata/localized-alternates";
import { resolveCanonicalUrl } from "@/lib/metadata/site-metadata";
import { buildOpportunityPath } from "@/lib/opportunities/routing";
import { listStaticOpportunities } from "@/lib/opportunities/static-api";
import { LocaleRouteSync } from "./_components/locale-route-sync";

interface CuratedPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return AVAILABLE_LOCALES.flatMap(({ code }) =>
    CURATED_DISCOVERY_PRESETS.map(({ slug }) => ({ locale: code, slug })));
}

function resolvePage(locale: string, slug: string) {
  if (!isLocaleCode(locale)) return null;
  const preset = curatedPresetBySlug(slug);
  return preset ? { locale, preset, content: preset.copy[locale] } : null;
}

export async function generateMetadata({ params }: CuratedPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = resolvePage(locale, slug);
  if (!page) return {};
  const path = `/discover/${page.preset.slug}`;
  return {
    title: page.content.title,
    description: page.content.description,
    alternates: {
      ...localizedAlternates(page.locale, path),
      types: {
        "application/atom+xml": [{
          url: resolveCanonicalUrl(`/feeds/${page.preset.feedSlug}.xml`),
          title: page.content.title,
        }],
      },
    },
    openGraph: {
      title: page.content.title,
      description: page.content.description,
      url: resolveCanonicalUrl(`/${page.locale}${path}`),
      siteName: "openings.dev",
      type: "website",
    },
  };
}

export default async function CuratedDiscoveryPage({ params }: CuratedPageProps) {
  const { locale, slug } = await params;
  const page = resolvePage(locale, slug);
  if (!page) notFound();
  const items = (await listStaticOpportunities())
    .filter((item) => matchesCuratedPreset(item, page.preset.slug))
    .slice(0, 20);
  const query = new URLSearchParams(page.preset.query).toString();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <LocaleRouteSync locale={page.locale} />
      <header className="max-w-4xl">
        <p className="text-label font-semibold text-primary-deep">openings.dev</p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.045em]">{page.content.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{page.content.description}</p>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{page.content.explanation}</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href={`/?${query}`} className="inline-flex min-h-11 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">{page.content.cta}</Link>
          <a href={`/feeds/${page.preset.feedSlug}.xml`} type="application/atom+xml" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary-deep underline-offset-4 hover:underline">Atom feed</a>
        </div>
      </header>
      {items.length ? (
        <ul className="mt-12 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-card border border-line bg-paper p-5">
              <p className="text-xs font-semibold text-muted-foreground">{item.companyName ?? item.community.name ?? item.repository}</p>
              <h2 className="font-display mt-2 text-xl font-semibold"><Link href={buildOpportunityPath(item.id)} className="underline-offset-4 hover:text-primary-deep hover:underline">{item.title}</Link></h2>
              <p className="mt-3 text-sm text-muted-foreground">{item.jobLocation?.displayText ?? item.country}</p>
              <time dateTime={item.createdAt} className="mt-4 block text-xs text-muted-foreground">{new Intl.DateTimeFormat(page.locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(item.createdAt))}</time>
            </li>
          ))}
        </ul>
      ) : <p className="mt-12 rounded-card border border-line bg-surface-muted p-6 text-sm text-muted-foreground">{page.content.empty}</p>}
    </main>
  );
}
