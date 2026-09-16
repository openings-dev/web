import Link from "next/link";
import { ArrowRight, Check, Monitor, Smartphone, Tablet } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/navigation/routes";
import type { TranslationMessages } from "@/lib/translations/types";
import {
  ContentSpecimens,
  ProductPatternSpecimens,
} from "../component-specimens";
import { BrandSpecimens, FoundationSpecimens } from "../foundation-specimens";
import { InteractiveSpecimens } from "../interactive-specimens";
import { LocalizedCopy } from "../localized-copy";
import { PrimitiveSpecimens } from "../primitive-specimens";
import { ShowcaseNavigation } from "../showcase-navigation";
import { ShowcaseSection } from "../showcase-section";
import {
  ShowcaseSectionId,
  type ShowcaseNavigationItem,
} from "./types";

const SHOWCASE_NAVIGATION = Object.freeze<ShowcaseNavigationItem[]>([
  { id: ShowcaseSectionId.Foundations, labelKey: "foundations" },
  { id: ShowcaseSectionId.Brand, labelKey: "brand" },
  { id: ShowcaseSectionId.Primitives, labelKey: "primitives" },
  { id: ShowcaseSectionId.ProductPatterns, labelKey: "productPatterns" },
  { id: ShowcaseSectionId.Content, labelKey: "content" },
  { id: ShowcaseSectionId.States, labelKey: "states" },
  { id: ShowcaseSectionId.Responsive, labelKey: "responsive" },
  { id: ShowcaseSectionId.Usage, labelKey: "usage" },
]);

function SectionTitle({
  section,
}: {
  section: keyof TranslationMessages["designSystem"]["sections"];
}): React.ReactNode {
  return (
    <LocalizedCopy select={(messages) => messages.designSystem.sections[section]} />
  );
}

function SectionGuidance({
  section,
}: {
  section: keyof TranslationMessages["designSystem"]["guidance"];
}): React.ReactNode {
  return (
    <LocalizedCopy select={(messages) => messages.designSystem.guidance[section]} />
  );
}

export function DesignSystemShowcase(): React.ReactNode {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8 xl:px-10">
      <header className="grid gap-8 pb-10 lg:grid-cols-12 lg:items-end lg:pb-14">
        <div className="lg:col-span-8">
          <p className="text-label font-semibold text-primary-deep">
            <LocalizedCopy select={(messages) => messages.designSystem.eyebrow} />
          </p>
          <h1 className="font-display mt-3 text-page-title font-semibold tracking-[-0.045em] text-foreground">
            <LocalizedCopy select={(messages) => messages.designSystem.title} />
          </h1>
          <p className="mt-4 max-w-3xl text-marketing-body text-muted-foreground">
            <LocalizedCopy select={(messages) => messages.designSystem.description} />
          </p>
        </div>
        <div className="rounded-card border border-line bg-paper p-5 lg:col-span-4">
          <p className="font-mono text-technical text-primary-deep">DESIGN.md</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            <LocalizedCopy select={(messages) => messages.designSystem.guidance.usage} />
          </p>
        </div>
      </header>

      <ShowcaseNavigation items={SHOWCASE_NAVIGATION} />

      <ShowcaseSection
        id={ShowcaseSectionId.Foundations}
        eyebrow="01"
        title={<SectionTitle section="foundations" />}
        description={<SectionGuidance section="foundations" />}
      >
        <FoundationSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id={ShowcaseSectionId.Brand}
        eyebrow="02"
        title={<SectionTitle section="brand" />}
        description={<SectionGuidance section="brand" />}
      >
        <BrandSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id={ShowcaseSectionId.Primitives}
        eyebrow="03"
        title={<SectionTitle section="primitives" />}
        description={<SectionGuidance section="primitives" />}
      >
        <PrimitiveSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id={ShowcaseSectionId.ProductPatterns}
        eyebrow="04"
        title={<SectionTitle section="productPatterns" />}
        description={<SectionGuidance section="productPatterns" />}
      >
        <ProductPatternSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id={ShowcaseSectionId.Content}
        eyebrow="05"
        title={<SectionTitle section="content" />}
        description={<SectionGuidance section="content" />}
      >
        <ContentSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id={ShowcaseSectionId.States}
        eyebrow="06"
        title={<SectionTitle section="states" />}
        description={<SectionGuidance section="states" />}
      >
        <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {(["defaultState", "selectedState", "disabledState", "invalidState", "loadingState", "emptyState", "destructiveState"] as const).map((state) => (
            <span key={state} className="rounded-pill border border-line bg-surface px-2.5 py-1"><LocalizedCopy select={(messages) => messages.designSystem.labels[state]} /></span>
          ))}
        </div>
        <InteractiveSpecimens />
      </ShowcaseSection>

      <ShowcaseSection
        id={ShowcaseSectionId.Responsive}
        eyebrow="07"
        title={<SectionTitle section="responsive" />}
        description={<SectionGuidance section="responsive" />}
      >
        <article className="mb-4 max-w-[80rem] rounded-panel border border-line bg-background p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-card-title font-semibold">
              <LocalizedCopy select={(messages) => messages.designSystem.specimens.liveResponsiveComposition} />
            </h3>
            <div className="flex flex-wrap gap-2 text-[0.68rem] text-muted-foreground">
              <code className="rounded-pill border border-line bg-surface px-2.5 py-1">max-w-[90rem]</code>
              <code className="rounded-pill border border-line bg-surface px-2.5 py-1">max-w-[80rem]</code>
              <code className="rounded-pill border border-line bg-surface px-2.5 py-1">max-w-[74ch]</code>
              <code className="rounded-pill border border-line bg-surface px-2.5 py-1">grid-cols-12</code>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
            <aside className="hidden rounded-card border border-line bg-surface p-4 md:col-span-3 md:block xl:col-span-2">
              <div className="h-3 w-3/4 rounded-pill bg-primary-soft" />
              <div className="mt-4 space-y-2">
                <div className="h-8 rounded-control border border-line bg-paper" />
                <div className="h-8 rounded-control border border-line bg-paper" />
                <div className="h-8 rounded-control border border-line bg-paper" />
              </div>
            </aside>
            <div className="min-w-0 md:col-span-9 xl:col-span-7">
              <div className="max-w-[74ch] rounded-card border border-line bg-paper p-5 sm:p-6">
                <div className="h-3 w-28 rounded-pill bg-primary-soft" />
                <div className="mt-4 h-8 w-4/5 rounded-control bg-line/70" />
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  <LocalizedCopy select={(messages) => messages.designSystem.guidance.content} />
                </p>
              </div>
            </div>
            <aside className="hidden rounded-card border border-line bg-surface p-4 xl:col-span-3 xl:block">
              <div className="h-3 w-1/2 rounded-pill bg-primary-soft" />
              <div className="mt-4 space-y-2 border-l border-line pl-3">
                <div className="h-7 rounded-control border border-line bg-paper" />
                <div className="h-7 rounded-control border border-line bg-paper" />
                <div className="h-7 rounded-control border border-line bg-paper" />
              </div>
            </aside>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,1.1fr)]">
            <div className="space-y-2 rounded-card border border-line bg-surface p-4">
              <div className="h-10 rounded-control bg-primary-soft" />
              <div className="h-16 rounded-control border border-line bg-paper" />
              <div className="h-16 rounded-control border border-line bg-paper" />
            </div>
            <div className="min-h-44 rounded-card border border-line bg-surface-elevated p-4 shadow-floating-sm">
              <div className="h-3 w-1/3 rounded-pill bg-primary-soft" />
              <div className="mt-4 h-7 w-4/5 rounded-control bg-line/70" />
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                <LocalizedCopy select={(messages) => messages.designSystem.guidance.responsive} />
              </p>
            </div>
          </div>
        </article>
        <div className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-card border border-line bg-surface p-4">
            <Smartphone className="size-5 text-primary-deep" aria-hidden="true" />
            <h3 className="font-mono mt-3 font-semibold">320 to 767 px</h3>
            <div className="mt-4 space-y-2 rounded-control border border-line bg-paper p-3">
              <div className="h-9 rounded-control bg-primary-soft" />
              <div className="h-16 rounded-control border border-line" />
              <div className="h-16 rounded-control border border-line" />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground"><LocalizedCopy select={(messages) => messages.designSystem.specimens.mobileGuidance} /></p>
          </article>
          <article className="rounded-card border border-line bg-surface p-4">
            <Tablet className="size-5 text-primary-deep" aria-hidden="true" />
            <h3 className="font-mono mt-3 font-semibold">768 to 1279 px</h3>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-control border border-line bg-paper p-3">
              <div className="col-span-2 h-9 rounded-control bg-primary-soft" />
              <div className="h-24 rounded-control border border-line" />
              <div className="h-24 rounded-control border border-line" />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground"><LocalizedCopy select={(messages) => messages.designSystem.specimens.tabletGuidance} /></p>
          </article>
          <article className="rounded-card border border-line bg-surface p-4">
            <Monitor className="size-5 text-primary-deep" aria-hidden="true" />
            <h3 className="font-mono mt-3 font-semibold">1280px+</h3>
            <div className="mt-4 grid grid-cols-[0.9fr_1.1fr] gap-2 rounded-control border border-line bg-paper p-3">
              <div className="space-y-2"><div className="h-9 rounded-control bg-primary-soft" /><div className="h-24 rounded-control border border-line" /></div>
              <div className="h-full min-h-36 rounded-control border border-line bg-surface" />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground"><LocalizedCopy select={(messages) => messages.designSystem.specimens.wideGuidance} /></p>
          </article>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        id={ShowcaseSectionId.Usage}
        eyebrow="08"
        title={<SectionTitle section="usage" />}
        description={<SectionGuidance section="usage" />}
      >
        <ol className="grid gap-3 sm:grid-cols-3">
          <li className="rounded-card border border-line bg-surface p-5"><Check className="size-5 text-positive-foreground" aria-hidden="true" /><code className="font-mono mt-3 block text-sm text-foreground">1 · DESIGN.md</code><span className="mt-2 block text-xs leading-5 text-muted-foreground"><LocalizedCopy select={(messages) => messages.designSystem.guidance.usage} /></span></li>
          <li className="rounded-card border border-line bg-surface p-5"><Check className="size-5 text-positive-foreground" aria-hidden="true" /><code className="font-mono mt-3 block text-sm text-foreground">2 · tokens · primitives</code><span className="mt-2 block text-xs leading-5 text-muted-foreground"><LocalizedCopy select={(messages) => messages.designSystem.guidance.primitives} /></span></li>
          <li className="rounded-card border border-line bg-surface p-5"><Check className="size-5 text-positive-foreground" aria-hidden="true" /><code className="font-mono mt-3 block text-sm text-foreground">3 · /design</code><span className="mt-2 block text-xs leading-5 text-muted-foreground"><LocalizedCopy select={(messages) => messages.designSystem.description} /></span></li>
        </ol>
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          <LocalizedCopy select={(messages) => messages.designSystem.guidance.usage} />
        </p>
        <Link href={PUBLIC_ROUTES.overview} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control text-sm font-semibold text-primary-deep underline decoration-primary/45 underline-offset-4 hover:text-foreground">
          <LocalizedCopy select={(messages) => messages.documents.overview.title} /> <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </ShowcaseSection>
    </div>
  );
}
