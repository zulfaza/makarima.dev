import { createFileRoute } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"
import type { ComponentType } from "react"
import { useEffect } from "react"

import { SiteFrame, siteMetaClassName } from "@/components/site-frame"
import { createPageHead, createPersonJsonLd } from "@/lib/site-metadata"

type LinkEntry = {
  readonly description: string
  readonly href: string
  readonly icon: ComponentType<{ readonly className?: string }>
  readonly label: string
}

const personalLinks = [
  {
    label: "LinkedIn",
    description: "Work history and professional updates",
    href: "https://www.linkedin.com/in/zul-faza-makarima/",
    icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    description: "Code, projects, and experiments",
    href: "https://github.com/zulfaza",
    icon: GitHubIcon,
  },
  {
    label: "X",
    description: "Short notes and public posts",
    href: "https://x.com/contoh_unipdai",
    icon: ExternalLink,
  },
] satisfies ReadonlyArray<LinkEntry>

function LinkedInIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitHubIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

const campaignParamNames: ReadonlyArray<string> = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
]

export const Route = createFileRoute("/links")({
  head: () =>
    createPageHead({
      title: "Links",
      description: "Links for Zul Faza Makarima.",
      keywords: ["links", "social links", "profile"],
      path: "/links",
      jsonLd: [createPersonJsonLd()],
    }),
  component: LinksPage,
})

export function LinksPage() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const campaignParams = readCampaignParams(url.searchParams)

    if (Object.keys(campaignParams).length === 0) {
      return
    }

    window.gtag("event", "links_campaign_visit", campaignParams)

    for (const paramName of campaignParamNames) {
      url.searchParams.delete(paramName)
    }

    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`
    )
  }, [])

  return (
    <SiteFrame>
      <section className="flex flex-1 items-center px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <header className="space-y-2 text-center">
            <h1 className="text-2xl leading-tight font-medium text-foreground">
              Zul Faza Makarima
            </h1>
            <p className="text-sm leading-7 text-muted-foreground">
              Links and profiles.
            </p>
          </header>

          <nav aria-label="Personal links">
            <ul className="divide-y divide-border/80 border-y border-border/80">
              {personalLinks.map((link) => (
                <li key={link.href}>
                  <PersonalLink link={link} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </SiteFrame>
  )
}

function readCampaignParams(searchParams: URLSearchParams) {
  const campaignParams: Record<string, string> = {}

  for (const paramName of campaignParamNames) {
    const value = searchParams.get(paramName)

    if (value !== null && value !== "") {
      campaignParams[paramName] = value
    }
  }

  return campaignParams
}

function PersonalLink({ link }: { readonly link: LinkEntry }) {
  const Icon = link.icon

  return (
    <a
      className="grid grid-cols-[1.25rem_minmax(0,1fr)_1rem] items-center gap-3 py-4 transition-colors hover:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      href={link.href}
      rel="noreferrer"
      target="_blank"
      onClick={() => {
        window.gtag("event", "link_click", { destination: link.href })
      }}
    >
      <Icon className="size-5" />
      <span className="min-w-0 space-y-1">
        <span className="block text-sm font-medium text-foreground">
          {link.label}
        </span>
        <span className={`${siteMetaClassName} block leading-6`}>
          {link.description}
        </span>
      </span>
      <ExternalLink className="size-4 text-muted-foreground" />
    </a>
  )
}
