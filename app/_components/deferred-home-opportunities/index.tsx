"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";

type OpportunitiesScreenComponent = typeof import(
  "@/app/opportunities/_components/opportunities-screen"
)["OpportunitiesScreen"];

export function DeferredHomeOpportunities(): React.ReactNode {
  const { messages } = useI18n();
  const regionRef = useRef<HTMLElement>(null);
  const [Screen, setScreen] = useState<OpportunitiesScreenComponent | null>(null);

  useEffect(() => {
    const region = regionRef.current;

    if (!region || typeof IntersectionObserver === "undefined") {
      return;
    }

    let active = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();
        void import("@/app/opportunities/_components/opportunities-screen").then(
          ({ OpportunitiesScreen }) => {
            if (active) {
              setScreen(() => OpportunitiesScreen);
            }
          },
        );
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(region);

    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={regionRef}
      id="opportunity-results"
      className="min-h-[42rem] scroll-mt-20"
      aria-label={messages.opportunities.header.kicker}
    >
      {Screen ? (
        <Screen showHeader={false} />
      ) : (
        <div className="mx-auto w-full max-w-[90rem] px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8 xl:px-10 xl:pt-12">
          <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
            <p className="text-label font-semibold text-primary-deep">
              {messages.opportunities.header.kicker}
            </p>
            <p className="font-display mt-3 text-2xl font-semibold tracking-[-0.035em] text-foreground">
              {messages.opportunities.header.title}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {messages.opportunities.header.description}
            </p>
            <Link
              href="/opportunities"
              className="mt-5 inline-flex min-h-11 items-center rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {messages.home.primaryAction}
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
