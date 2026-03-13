import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type ProjectTitleProps = {
  readonly children: ReactNode
  readonly faviconHref?: string
  readonly className?: string
}

export function ProjectTitle({ children, faviconHref, className }: ProjectTitleProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {faviconHref !== undefined ? (
        <img
          alt=""
          aria-hidden="true"
          className="size-4 shrink-0 rounded-[4px]"
          data-testid="project-favicon"
          decoding="async"
          height="16"
          loading="lazy"
          src={faviconHref}
          width="16"
        />
      ) : null}
      {children}
    </div>
  )
}
