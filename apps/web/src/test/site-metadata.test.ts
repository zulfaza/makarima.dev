import {
  createBlogPostingJsonLd,
  createPageHead,
  createProjectJsonLd,
  createRootHeadLinks,
  createSiteLinks,
  createWebsiteJsonLd,
  siteMetadata,
} from "@/lib/site-metadata"

import type { BlogEntry, ProjectEntry } from "@/content/site"

const sampleBlogEntry: BlogEntry = {
  slug: "hello",
  title: "Hello",
  summary: "World",
  publishedAt: "2026-03-01",
  tags: ["TypeScript", "SEO"],
  body: [],
}

const sampleProjectEntry: ProjectEntry = {
  slug: "git-flex",
  name: "GitFlex",
  summary: "CLI helpers for cleaner branch work.",
  year: 2026,
  stack: ["TypeScript", "React"],
  status: "active",
  access: {
    kind: "external",
    href: "https://github.com/zulfaza/git-flex",
    label: "View source",
  },
  body: [],
}

describe("site metadata", () => {
  test("includes canonical, robots, and absolute social metadata", () => {
    const head = createPageHead({
      title: "Hello",
      description: "World",
      path: "/blogs/hello",
    })

    expect(head.links).toContainEqual({
      rel: "canonical",
      href: "https://makarima.dev/blogs/hello",
    })
    expect(head.meta).toContainEqual({
      name: "robots",
      content: siteMetadata.robots,
    })
    expect(head.meta).toContainEqual({
      property: "og:image",
      content: "https://makarima.dev/og.png",
    })
    expect(head.meta).toContainEqual({
      name: "twitter:image",
      content: "https://makarima.dev/og.png",
    })
    expect(head.meta).toContainEqual({
      property: "og:url",
      content: "https://makarima.dev/blogs/hello",
    })
  })

  test("exposes site links for manifest and icons", () => {
    expect(createSiteLinks()).toEqual([
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
        href: "/site.webmanifest",
      },
    ])
  })

  test("builds root head links with stylesheet and font preload", () => {
    expect(
      createRootHeadLinks({
        appCssHref: "/assets/styles.css",
        fontHref: "/assets/geist-mono-latin.woff2",
      }),
    ).toEqual([
      {
        rel: "stylesheet",
        href: "/assets/styles.css",
      },
      {
        rel: "preload",
        href: "/assets/geist-mono-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      ...createSiteLinks(),
    ])
  })

  test("builds website and content schema with absolute urls", () => {
    const websiteSchema = createWebsiteJsonLd()
    const blogSchema = createBlogPostingJsonLd(sampleBlogEntry)
    const projectSchema = createProjectJsonLd(sampleProjectEntry)

    expect(websiteSchema).toMatchObject({
      "@type": "WebSite",
      url: "https://makarima.dev",
    })
    expect(blogSchema).toMatchObject({
      "@type": "BlogPosting",
      datePublished: "2026-03-01",
      url: "https://makarima.dev/blogs/hello",
    })
    expect(projectSchema).toMatchObject({
      "@type": "CreativeWork",
      sameAs: ["https://github.com/zulfaza/git-flex"],
      url: "https://makarima.dev/projects/git-flex",
    })
  })

  test("stores theme color for browser ui metadata", () => {
    expect(siteMetadata.themeColor).toBe("#141111")
  })
})
