const siteTitle = "makarima.dev"

export const siteMetadata = {
  title: siteTitle,
  description:
    "Personal site with notes, projects, and links kept close to the codebase.",
  origin: "https://makarima.dev",
  themeColor: "#141111",
  ogImagePath: "/og.png",
  ogImageAlt: "Preview image for makarima.dev",
} as const

type PageMetadata = {
  readonly title?: string
  readonly description?: string
  readonly path: `/${string}`
}

function getPageTitle(title?: string) {
  if (title === undefined) {
    return siteMetadata.title
  }

  return `${title} | ${siteMetadata.title}`
}

function getAbsoluteSiteUrl(path: `/${string}`) {
  return new URL(path, siteMetadata.origin).toString()
}

export function createPageMeta({ title, description, path }: PageMetadata) {
  const pageTitle = getPageTitle(title)
  const pageDescription = description ?? siteMetadata.description
  const pageUrl = getAbsoluteSiteUrl(path)
  const imageUrl = getAbsoluteSiteUrl(siteMetadata.ogImagePath)

  return [
    {
      title: pageTitle,
    },
    {
      name: "description",
      content: pageDescription,
    },
    {
      property: "og:type",
      content: "website",
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
      property: "og:image:alt",
      content: siteMetadata.ogImageAlt,
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
}
