import { Apple, ExternalLink, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXTERNAL_ROUTES } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils/tailwind";

export interface AppDownloadMessages {
  title: string;
  iosAction: string;
  androidAction: string;
  iosAriaLabel: string;
  androidAriaLabel: string;
}

interface AppDownloadLinksProps {
  messages: AppDownloadMessages;
  className?: string;
  layout?: "responsive" | "stacked";
  tone?: "surface" | "inverse";
}

const downloadLinks = [
  {
    id: "ios",
    href: EXTERNAL_ROUTES.iosApp,
    icon: Apple,
    action: "iosAction",
    ariaLabel: "iosAriaLabel",
  },
  {
    id: "android",
    href: EXTERNAL_ROUTES.androidApp,
    icon: Smartphone,
    action: "androidAction",
    ariaLabel: "androidAriaLabel",
  },
] as const;

export function AppDownloadLinks({
  messages,
  className,
  layout = "responsive",
  tone = "surface",
}: AppDownloadLinksProps): React.ReactNode {
  const inverse = tone === "inverse";

  return (
    <section className={cn("space-y-3", className)} aria-label={messages.title}>
      <p
        className={cn(
          "text-label font-semibold",
          inverse ? "text-night-foreground" : "text-foreground",
        )}
      >
        {messages.title}
      </p>
      <div
        className={cn(
          "grid gap-2",
          layout === "responsive" && "sm:grid-cols-2",
        )}
      >
        {downloadLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Button
              key={link.id}
              asChild
              size="sm"
              variant={inverse ? "ghost" : "secondary"}
              className={cn(
                "w-full justify-start px-4",
                inverse &&
                  "border-night-foreground/25 bg-night-foreground/5 text-night-foreground hover:border-night-foreground/40 hover:bg-night-foreground/10 hover:text-night-foreground focus-visible:ring-offset-night",
              )}
            >
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={messages[link.ariaLabel]}
              >
                <Icon aria-hidden="true" />
                <span className="min-w-0 flex-1 text-left">
                  {messages[link.action]}
                </span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
