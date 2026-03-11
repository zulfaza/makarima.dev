import { Link } from "@tanstack/react-router"

import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { socials } from "@/content/site"

export const siteMetaClassName = "text-xs text-muted-foreground"
export const siteBadgeClassName =
  "h-auto border-border/80 px-2 py-1 text-[11px] font-normal text-muted-foreground"

export function SiteFrame({
  children,
  footerAddon,
}: {
  readonly children: React.ReactNode
  readonly footerAddon?: React.ReactNode
}) {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col border-x border-border/80">
        <div className="flex flex-1 flex-col">{children}</div>
        {footerAddon}
        <footer
          id="socials"
          className="flex flex-col gap-3 border-t border-b border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"
        >
          <p className="text-xs text-muted-foreground">
            Copyright © 2026 makarima.dev
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {socials.map((social) => (
              <Link
                key={social.kind}
                className={buttonVariants({ size: "sm", variant: "outline" })}
                to={social.href}
                rel="noreferrer"
                target="_blank"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </main>
  )
}
