import { createFileRoute, Link, notFound } from "@tanstack/react-router"

import { DetailContent } from "@/components/detail-content"
import {
  type ProjectEntry,
  formatProjectStatus,
  getProjectBySlug,
} from "@/content/site"
import { SiteFrame, siteMetaClassName } from "@/components/site-frame"

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => loadProjectEntry(params.slug),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.name} | makarima.dev`
          : "Project | makarima.dev",
      },
      {
        name: "description",
        content: loaderData?.summary ?? "Project entry",
      },
    ],
  }),
  component: ProjectRouteComponent,
})

export function loadProjectEntry(slug: string) {
  const entry = getProjectBySlug(slug)

  if (!entry) {
    throw notFound()
  }

  return entry
}

function ProjectRouteComponent() {
  const entry = Route.useLoaderData()

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
            <p className={siteMetaClassName}>
              {formatProjectStatus(entry.status)}
            </p>
          </div>
          <ul
            aria-label={`${entry.name} stack`}
            className="flex flex-wrap gap-x-3 gap-y-1"
          >
            {entry.stack.map((item) => (
              <li key={item} className={siteMetaClassName}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <DetailContent blocks={entry.body} />
    </SiteFrame>
  )
}
