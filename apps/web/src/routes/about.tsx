import { createFileRoute, Link } from "@tanstack/react-router"
import { lazy, Suspense } from "react"

import { SiteFrame } from "@/components/site-frame"
import aboutSource from "@/content/about.md?raw"
import { parseMarkdownBody } from "@/content/markdown"
import { createPageHead, createPersonJsonLd } from "@/lib/site-metadata"

const DetailContent = lazy(() =>
  import("@/components/detail-content").then((mod) => ({
    default: mod.DetailContent,
  }))
)

function DetailContentFallback() {
  return (
    <div className="border-b border-border/80 px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl" />
    </div>
  )
}

const aboutTitle = "About"
const aboutSummary =
  "Full-stack software engineer based in Cirebon, Indonesia, building web products end to end in TypeScript and React."
const aboutBody = parseMarkdownBody(aboutSource, "about")

export const Route = createFileRoute("/about")({
  head: () =>
    createPageHead({
      title: aboutTitle,
      description: aboutSummary,
      keywords: [
        "about",
        "full-stack software engineer",
        "Zul Faza Makarima",
        "Cirebon",
      ],
      path: "/about",
      jsonLd: [createPersonJsonLd()],
    }),
  component: AboutPage,
})

export function AboutPage() {
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
            <h1 className="text-2xl leading-tight font-medium text-foreground sm:text-3xl">
              {aboutTitle}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {aboutSummary}
            </p>
          </div>
        </div>
      </header>

      <Suspense fallback={<DetailContentFallback />}>
        <DetailContent blocks={aboutBody} />
      </Suspense>
    </SiteFrame>
  )
}
