import { buttonVariants } from "@/components/ui/button"
import { SiteFrame } from "@/components/site-frame"

export function SiteNotFound() {
  return (
    <SiteFrame>
      <section className="border-b border-border/80 px-5 py-6 sm:px-8">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">404</p>
          <h1 className="text-2xl leading-tight font-medium text-foreground sm:text-3xl">
            Page not found
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            The page you requested does not exist or has moved.
          </p>
          <div>
            <a className={buttonVariants({ size: "sm", variant: "outline" })} href="/">
              Back to home
            </a>
          </div>
        </div>
      </section>
    </SiteFrame>
  )
}
