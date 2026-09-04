import type { Metadata } from "next";
import { ClientCommunityPage } from "./client-community-page";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function CommunityEntityShell(): React.ReactNode {
  return <ClientCommunityPage />;
}
