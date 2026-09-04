import type { Metadata } from "next";
import { ClientJobPage } from "./_components/client-job-page";

export const metadata: Metadata = {
  title: "Opportunity | Openings.dev",
  robots: { index: false, follow: true },
};

export default function JobsClientRoute(): React.ReactNode {
  return <ClientJobPage />;
}
