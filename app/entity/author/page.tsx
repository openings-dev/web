import type { Metadata } from "next";
import { ClientAuthorPage } from "./client-author-page";

export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function AuthorEntityShell(): React.ReactNode {
  return <ClientAuthorPage />;
}
