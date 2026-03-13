import { Badge } from "@/components/ui/badge"
import { formatProjectStatus } from "@/content/site"

import type { ProjectStatus } from "@/content/site"

function getProjectStatusBadgeClassName(status: ProjectStatus) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "draft":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-300"
    case "archived":
      return "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300"
  }
}

export function ProjectStatusBadge({
  className,
  status,
}: {
  readonly className?: string
  readonly status: ProjectStatus
}) {
  const classes =
    className === undefined
      ? getProjectStatusBadgeClassName(status)
      : `${className} ${getProjectStatusBadgeClassName(status)}`

  return (
    <Badge variant="outline" className={classes}>
      {formatProjectStatus(status)}
    </Badge>
  )
}
