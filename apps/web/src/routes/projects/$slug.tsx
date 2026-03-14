import { ExternalLink } from "lucide-react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"

import { DetailContent } from "@/components/detail-content"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import { ProjectTitle } from "@/components/project-title"
import {
  SiteFrame,
  siteBadgeClassName,
  siteMetaClassName,
} from "@/components/site-frame"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { findProjectBySlug } from "@/content/site"
import { createPageHead, createProjectJsonLd } from "@/lib/site-metadata"

import type { ProjectEntry } from "@/content/site"

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const entry = findProjectBySlug(params.slug)
    if (!entry) throw notFound()
    return entry
  },
  head: ({ loaderData }) =>
    createPageHead({
      title: loaderData?.name ?? "Project",
      description: loaderData?.summary ?? "Project entry",
      keywords: loaderData?.stack,
      path: loaderData ? `/projects/${loaderData.slug}` : "/projects",
      jsonLd: loaderData ? [createProjectJsonLd(loaderData)] : [],
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
      <header className="border-b border-border/80">
        <div className="border-b border-border/80 px-5 py-4 sm:px-8">
          <Link
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            to="/"
          >
            Back to home
          </Link>
        </div>
        <div className="grid gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <ProjectTitle faviconHref={entry.faviconHref}>
                <h1 className="text-2xl leading-tight font-medium text-foreground sm:text-3xl">
                  {entry.name}
                </h1>
              </ProjectTitle>
              <span className={siteMetaClassName}>{entry.year}</span>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {entry.summary}
            </p>
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
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <ProjectStatusBadge className={siteBadgeClassName} status={entry.status} />
            {entry.access.kind === "external" ? (
              <a
                className={buttonVariants({ size: "sm", variant: "outline" })}
                href={entry.access.href}
                rel="noreferrer"
                target="_blank"
              >
                {entry.access.label}
                <ExternalLink />
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <DetailContent blocks={entry.body} />
    </SiteFrame>
  )
}
