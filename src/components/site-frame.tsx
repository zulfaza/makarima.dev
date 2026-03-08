import { buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { socials } from "@/content/site"

export const siteMetaClassName = "text-xs text-muted-foreground"

export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col border-x border-border/80">
        <div className="flex flex-1 flex-col">{children}</div>
        <footer
          id="socials"
          className="flex flex-col gap-3 border-t border-b border-border/80 px-5 py-4 sm:px-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs text-muted-foreground">
            Copyright © 2026 makarima.dev
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {socials.map((social) => (
              <a
                key={social.kind}
                className={buttonVariants({ size: "sm", variant: "outline" })}
                href={social.href}
                rel="noreferrer"
                target="_blank"
              >
                {social.label}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </main>
  )
}
