import { createFileRoute, Link, notFound } from "@tanstack/react-router"

import { DetailContent } from "@/components/detail-content"
import {
  SiteFrame,
  siteBadgeClassName,
  siteMetaClassName,
} from "@/components/site-frame"
import { Badge } from "@/components/ui/badge"
import { findBlogBySlug, formatBlogDate } from "@/content/site"
import { createBlogPostingJsonLd, createPageHead } from "@/lib/site-metadata"

import type { BlogEntry } from "@/content/site"

export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    const entry = findBlogBySlug(params.slug)
    if (!entry) throw notFound()
    return entry
  },
  head: ({ loaderData }) =>
    createPageHead({
      title: loaderData?.title ?? "Blog",
      description: loaderData?.summary ?? "Blog entry",
      keywords: loaderData?.tags,
      path: loaderData ? `/blogs/${loaderData.slug}` : "/blogs",
      publishedAt: loaderData?.publishedAt,
      type: "article",
      jsonLd: loaderData ? [createBlogPostingJsonLd(loaderData)] : [],
    }),
  component: BlogRouteComponent,
})

export function loadBlogEntry(slug: string) {
  const entry = findBlogBySlug(slug)
  if (!entry) throw notFound()
  return entry
}

function BlogRouteComponent() {
  const entry = Route.useLoaderData()

  if (!entry) {
    throw notFound()
  }

  return <BlogDetailPage entry={entry} />
}

export function BlogDetailPage({ entry }: { entry: BlogEntry }) {
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
                {entry.title}
              </h1>
              <span className={siteMetaClassName}>
                {formatBlogDate(entry.publishedAt)}
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {entry.summary}
            </p>
          </div>
          <ul aria-label={`${entry.title} tags`} className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline" className={siteBadgeClassName}>
                  {tag}
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
