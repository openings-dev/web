import Link from "next/link";
import { Download, Smartphone } from "lucide-react";
import { GithubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";

interface FooterPromotionProps {
  title: string;
  description: string;
  githubAction: string;
  iosAction: string;
  androidAction: string;
  githubHref: string;
  iosHref: string;
  androidHref: string;
}

export function FooterPromotion({
  title,
  description,
  githubAction,
  iosAction,
  androidAction,
  githubHref,
  iosHref,
  androidHref,
}: FooterPromotionProps): React.ReactNode {
  const links = [
    { href: githubHref, label: githubAction, icon: GithubIcon, primary: true },
    { href: iosHref, label: iosAction, icon: Download, primary: false },
    { href: androidHref, label: androidAction, icon: Smartphone, primary: false },
  ];

  return (
    <section
      className="grid gap-6 rounded-card border border-night-foreground/20 bg-night-foreground/[0.06] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-8"
      aria-labelledby="footer-promotion-title"
    >
      <div className="max-w-2xl space-y-2">
        <h2
          id="footer-promotion-title"
          className="text-lg font-semibold tracking-[-0.02em] text-night-foreground sm:text-xl"
        >
          {title}
        </h2>
        <p className="text-sm leading-6 text-night-muted-foreground sm:text-base sm:leading-7">
          {description}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-end">
        {links.map(({ href, label, icon: Icon, primary }) => (
          <Button
            key={href}
            asChild
            variant={primary ? "default" : "outline"}
            className={
              primary
                ? "border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover"
                : "border-night-foreground/25 text-night-foreground hover:border-night-foreground/40 hover:bg-night-foreground/10"
            }
          >
            <Link href={href} target="_blank" rel="noreferrer">
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
