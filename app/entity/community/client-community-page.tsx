"use client";

import * as React from "react";
import { OpportunitiesPage } from "@/app/opportunities/_components/opportunities-page";
import { ShareableProfileKind } from "@/app/opportunities/_components/opportunities-screen/types";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import {
  getSnapshotCommunityByRepository,
  type CommunitySummary,
} from "@/lib/opportunities/communities";

function repositoryFromLocation(): string | null {
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments.length !== 3 || !["communities", "community"].includes(segments[0] ?? "")) return null;
  try {
    return `${decodeURIComponent(segments[1] ?? "")}/${decodeURIComponent(segments[2] ?? "")}`;
  } catch {
    return null;
  }
}

export function ClientCommunityPage(): React.ReactNode {
  const { messages } = useI18n();
  const [profile, setProfile] = React.useState<CommunitySummary | null | undefined>(undefined);

  React.useEffect(() => {
    const repository = repositoryFromLocation();
    if (!repository) {
      queueMicrotask(() => setProfile(null));
      return;
    }
    let active = true;
    getSnapshotCommunityByRepository(repository)
      .then((value) => { if (active) setProfile(value); })
      .catch(() => { if (active) setProfile(null); });
    return () => { active = false; };
  }, []);

  if (profile) {
    return <OpportunitiesPage profile={{ kind: ShareableProfileKind.Community, profile }} />;
  }
  return (
    <p className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 text-center text-sm text-muted-foreground" role="status">
      {profile === undefined
        ? messages.opportunities.feedback.selectedLoading
        : messages.opportunities.feedback.selectedNotFound}
    </p>
  );
}
