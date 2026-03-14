import type { RouteLinkEntry } from "@tanstack/react-router"
import type { BlogEntry, ProjectEntry } from "@/content/site"

const siteTitle = "makarima.dev"
const defaultKeywords = [
  "software engineering",
  "personal website",
  "projects",
  "notes",
  "typescript",
  "react",
] as const

type SitePath = `/${string}`

type JsonLdScalar = boolean | number | string | null
type JsonLdValue =
  | JsonLdScalar
  | JsonLdObject
  | ReadonlyArray<JsonLdScalar | JsonLdObject>

export type JsonLdObject = {
  readonly [key: string]: JsonLdValue
}

type PageMetadata = {
  readonly title?: string
  readonly description?: string
  readonly keywords?: ReadonlyArray<string>
  readonly path: SitePath
  readonly publishedAt?: string
  readonly type?: "article" | "website"
}

type AuthorMetadata = {
  readonly name: string
  readonly sameAs: ReadonlyArray<string>
}

type PageMetaTag =
  | {
      readonly title: string
    }
  | {
      readonly content: string
      readonly name: string
    }
  | {
      readonly content: string
      readonly property: string
    }

export const siteMetadata = {
  title: siteTitle,
  siteName: siteTitle,
  description:
    "Notes, projects, and experiments by Zul Faza Makarima, kept close to the codebase.",
  language: "en",
  locale: "en_US",
  manifestPath: "/site.webmanifest",
  origin: "https://makarima.dev",
  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  themeColor: "#141111",
  author: {
    name: "Zul Faza Makarima",
    sameAs: [
      "https://github.com/zulfaza",
      "https://www.linkedin.com/in/zul-faza-makarima/",
    ],
  } satisfies AuthorMetadata,
  ogImage: {
    alt: "Preview image for makarima.dev",
    height: 630,
    path: "/og.png",
    width: 1200,
  },
  logoPath: "/favicon.png",
} as const

function getPageTitle(title?: string) {
  if (title === undefined) {
    return siteMetadata.title
  }

  return `${title} | ${siteMetadata.title}`
}

export function getAbsoluteSiteUrl(path: SitePath) {
  return new URL(path, siteMetadata.origin).toString()
}

function getPageKeywords(keywords?: ReadonlyArray<string>) {
  const allKeywords = [...defaultKeywords, ...(keywords ?? [])]

  return Array.from(new Set(allKeywords)).join(", ")
}

export function createPageMeta({
  title,
  description,
  keywords,
  path,
  publishedAt,
  type = "website",
}: PageMetadata): Array<PageMetaTag> {
  const pageTitle = getPageTitle(title)
  const pageDescription = description ?? siteMetadata.description
  const pageKeywords = getPageKeywords(keywords)
  const pageUrl = getAbsoluteSiteUrl(path)
  const imageUrl = getAbsoluteSiteUrl(siteMetadata.ogImage.path)
  const logoUrl = getAbsoluteSiteUrl(siteMetadata.logoPath)
  const meta: Array<PageMetaTag> = [
    {
      title: pageTitle,
    },
    {
      name: "description",
      content: pageDescription,
    },
    {
      name: "robots",
      content: siteMetadata.robots,
    },
    {
      name: "author",
      content: siteMetadata.author.name,
    },
    {
      name: "keywords",
      content: pageKeywords,
    },
    {
      property: "og:locale",
      content: siteMetadata.locale,
    },
    {
      property: "og:site_name",
      content: siteMetadata.siteName,
    },
    {
      property: "og:type",
      content: type,
    },
    {
      property: "og:title",
      content: pageTitle,
    },
    {
      property: "og:description",
      content: pageDescription,
    },
    {
      property: "og:url",
      content: pageUrl,
    },
    {
      property: "og:image",
      content: imageUrl,
    },
    {
      property: "og:logo",
      content: logoUrl,
    },
    {
      property: "og:image:alt",
      content: siteMetadata.ogImage.alt,
    },
    {
      property: "og:image:width",
      content: String(siteMetadata.ogImage.width),
    },
    {
      property: "og:image:height",
      content: String(siteMetadata.ogImage.height),
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: pageTitle,
    },
    {
      name: "twitter:description",
      content: pageDescription,
    },
    {
      name: "twitter:image",
      content: imageUrl,
    },
  ]

  if (type === "article" && publishedAt !== undefined) {
    meta.push({
      property: "article:published_time",
      content: publishedAt,
    })
  }

  return meta
}

export function createSiteLinks(): ReadonlyArray<RouteLinkEntry> {
  return [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
    {
      rel: "icon",
      href: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      rel: "icon",
      href: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
    },
    {
      rel: "manifest",
      href: siteMetadata.manifestPath,
    },
  ]
}

export function createRootHeadLinks({
  appCssHref,
  fontHref,
}: {
  readonly appCssHref: string
  readonly fontHref: string
}): Array<RouteLinkEntry> {
  return [
    {
      rel: "stylesheet",
      href: appCssHref,
    },
    {
      rel: "preload",
      href: fontHref,
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    },
    ...createSiteLinks(),
  ]
}

export function createPageHead(
  page: PageMetadata & { readonly jsonLd?: ReadonlyArray<JsonLdObject> }
){
  return {
    meta: createPageMeta(page),
    links: [
      {
        rel: "canonical",
        href: getAbsoluteSiteUrl(page.path),
      },
    ],
    scripts: (page.jsonLd ?? []).map((entry) => ({
      children: JSON.stringify(entry),
      type: "application/ld+json" as const,
    })),
  }
}

export function createPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteMetadata.author.name,
    sameAs: siteMetadata.author.sameAs,
    url: siteMetadata.origin,
  } satisfies JsonLdObject
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: siteMetadata.description,
    inLanguage: siteMetadata.language,
    name: siteMetadata.siteName,
    publisher: {
      "@type": "Person",
      name: siteMetadata.author.name,
      url: siteMetadata.origin,
    },
    url: siteMetadata.origin,
  } satisfies JsonLdObject
}

export function createBlogPostingJsonLd(entry: BlogEntry) {
  const pageUrl = getAbsoluteSiteUrl(`/blogs/${entry.slug}`)

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    author: {
      "@type": "Person",
      name: siteMetadata.author.name,
      url: siteMetadata.origin,
    },
    dateModified: entry.publishedAt,
    datePublished: entry.publishedAt,
    description: entry.summary,
    headline: entry.title,
    image: getAbsoluteSiteUrl(siteMetadata.ogImage.path),
    inLanguage: siteMetadata.language,
    keywords: entry.tags.join(", "),
    mainEntityOfPage: pageUrl,
    publisher: {
      "@type": "Person",
      name: siteMetadata.author.name,
      url: siteMetadata.origin,
    },
    url: pageUrl,
  } satisfies JsonLdObject
}

export function createProjectJsonLd(entry: ProjectEntry) {
  const pageUrl = getAbsoluteSiteUrl(`/projects/${entry.slug}`)
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    author: {
      "@type": "Person",
      name: siteMetadata.author.name,
      url: siteMetadata.origin,
    },
    dateCreated: `${entry.year}-01-01`,
    description: entry.summary,
    genre: "Software project",
    keywords: entry.stack.join(", "),
    name: entry.name,
    url: pageUrl,
  }

  if (entry.access.kind === "external") {
    return {
      ...projectSchema,
      sameAs: [entry.access.href],
    } satisfies JsonLdObject
  }

  return projectSchema satisfies JsonLdObject
}
