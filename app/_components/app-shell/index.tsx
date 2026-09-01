import type { PropsWithChildren, ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SkipLink } from "./skip-link";

export function AppShell({ children }: PropsWithChildren): ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SkipLink />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
