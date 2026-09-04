"use client";

import * as React from "react";
import { OpportunitiesPage } from "@/app/opportunities/_components/opportunities-page";
import { ShareableProfileKind } from "@/app/opportunities/_components/opportunities-screen/types";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { getSnapshotUserByHandle, type UserSummary } from "@/lib/opportunities/users";

function authorFromLocation(): string | null {
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || !["authors", "users"].includes(segments[0] ?? "")) return null;
  try {
    return decodeURIComponent(segments[1] ?? "") || null;
  } catch {
    return null;
  }
}

export function ClientAuthorPage(): React.ReactNode {
  const { messages } = useI18n();
  const [profile, setProfile] = React.useState<UserSummary | null | undefined>(undefined);

  React.useEffect(() => {
    const handle = authorFromLocation();
    if (!handle) {
      queueMicrotask(() => setProfile(null));
      return;
    }
    let active = true;
    getSnapshotUserByHandle(handle)
      .then((value) => { if (active) setProfile(value); })
      .catch(() => { if (active) setProfile(null); });
    return () => { active = false; };
  }, []);

  if (profile) {
    return <OpportunitiesPage profile={{ kind: ShareableProfileKind.Publisher, profile }} />;
  }
  return (
    <p className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 text-center text-sm text-muted-foreground" role="status">
      {profile === undefined
        ? messages.opportunities.feedback.selectedLoading
        : messages.opportunities.feedback.selectedNotFound}
    </p>
  );
}
