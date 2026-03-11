import { createFileRoute, Link, notFound } from "@tanstack/react-router"

import { DetailContent } from "@/components/detail-content"
import {
  SiteFrame,
  siteBadgeClassName,
  siteMetaClassName,
} from "@/components/site-frame"
import { Badge } from "@/components/ui/badge"
import { findProjectBySlug, formatProjectStatus, getProjectBySlug } from "@/content/site"
import { createPageMeta } from "@/lib/site-metadata"

import type { ProjectEntry } from "@/content/site"

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const entry = await getProjectBySlug({ data: params.slug })
    if (!entry) throw notFound()
    return entry
  },
  head: ({ loaderData }) => ({
    meta: createPageMeta({
      title: loaderData?.name ?? "Project",
      description: loaderData?.summary ?? "Project entry",
      path: loaderData ? `/projects/${loaderData.slug}` : "/projects",
    }),
  }),
  component: ProjectRouteComponent,
})

export function loadProjectEntry(slug: string) {
  const entry = findProjectBySlug(slug)
  if (!entry) throw notFound()
  return entry
}

function ProjectRouteComponent() {
  const entry = Route.useLoaderData()

  if (!entry) {
    throw notFound()
  }

  return <ProjectDetailPage entry={entry} />
}

export function ProjectDetailPage({ entry }: { entry: ProjectEntry }) {
  return (
    <SiteFrame>
      <header className="border-b border-border/80 px-5 py-5 sm:px-8">
        <div className="space-y-3">
          <Link
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            to="/"
          >
            Back to home
          </Link>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-2xl leading-tight font-medium text-foreground sm:text-3xl">
                {entry.name}
              </h1>
              <span className={siteMetaClassName}>{entry.year}</span>
            </div>
            <p className={siteMetaClassName}>{formatProjectStatus(entry.status)}</p>
          </div>
          <ul aria-label={`${entry.name} stack`} className="flex flex-wrap gap-2">
            {entry.stack.map((item) => (
              <li key={item}>
                <Badge variant="outline" className={siteBadgeClassName}>
                  {item}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <DetailContent blocks={entry.body} />
    </SiteFrame>
  )
}
