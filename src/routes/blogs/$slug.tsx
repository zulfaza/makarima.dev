import { createFileRoute, Link, notFound } from "@tanstack/react-router"

import { DetailContent } from "@/components/detail-content"
import { type BlogEntry, formatBlogDate, getBlogBySlug } from "@/content/site"
import { SiteFrame, siteMetaClassName } from "@/components/site-frame"

export const Route = createFileRoute("/blogs/$slug")({
  loader: ({ params }) => loadBlogEntry(params.slug),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} | makarima.dev`
          : "Blog | makarima.dev",
      },
      {
        name: "description",
        content: loaderData?.summary ?? "Blog entry",
      },
    ],
  }),
  component: BlogRouteComponent,
})

export function loadBlogEntry(slug: string) {
  const entry = getBlogBySlug(slug)

  if (!entry) {
    throw notFound()
  }

  return entry
}

function BlogRouteComponent() {
  const entry = Route.useLoaderData()

  return <BlogDetailPage entry={entry} />
}

export function BlogDetailPage({ entry }: { entry: BlogEntry }) {
  return (
    <SiteFrame>
      <header className="border-b border-border/80 px-5 py-5 sm:px-8">
        <div className="space-y-3">
          <div className="space-y-2">
            <Link
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              to="/"
            >
              Back to home
            </Link>

            <h1 className="text-2xl leading-tight font-medium text-foreground sm:text-3xl">
              {entry.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className={siteMetaClassName}>
              {formatBlogDate(entry.publishedAt)}
            </p>
            •
            <ul
              aria-label={`${entry.title} tags`}
              className="flex flex-wrap gap-x-3 gap-y-1"
            >
              {entry.tags.map((tag) => (
                <li key={tag} className={siteMetaClassName}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <DetailContent blocks={entry.body} />
    </SiteFrame>
  )
}
