import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { getSitemapPages } from "@/lib/sitemap-pages"

describe("getSitemapPages", () => {
  const tempDirectories: Array<string> = []

  afterEach(() => {
    while (tempDirectories.length > 0) {
      const directory = tempDirectories.pop()

      if (directory !== undefined) {
        rmSync(directory, { force: true, recursive: true })
      }
    }
  })

  function createCollectionDirectories() {
    const rootDirectory = mkdtempSync(path.join(tmpdir(), "sitemap-pages-"))
    const blogsDirectory = path.join(rootDirectory, "blogs")
    const projectsDirectory = path.join(rootDirectory, "projects")

    mkdirSync(blogsDirectory)
    mkdirSync(projectsDirectory)
    tempDirectories.push(rootDirectory)

    return {
      blogsDirectory,
      projectsDirectory,
    }
  }

  it("builds sitemap pages from markdown collections", () => {
    const { blogsDirectory, projectsDirectory } = createCollectionDirectories()

    writeFileSync(
      path.join(blogsDirectory, "hello-world.md"),
      `---
title: Hello World
summary: Intro post
publishedAt: "2026-03-01"
tags:
  - intro
---
`
    )
    writeFileSync(
      path.join(blogsDirectory, "zebra-notes.md"),
      `---
title: Zebra Notes
summary: Follow-up post
publishedAt: "2026-03-04"
tags:
  - notes
---
`
    )
    writeFileSync(
      path.join(projectsDirectory, "alpha.md"),
      `---
name: Alpha
summary: Alpha project
year: 2026
stack:
  - React
status: active
---
`
    )
    writeFileSync(
      path.join(projectsDirectory, "omega.md"),
      `---
name: Omega
summary: Omega project
year: 2025
stack:
  - TypeScript
status: archived
---
`
    )

    expect(
      getSitemapPages({
        blogsDirectory,
        projectsDirectory,
      })
    ).toEqual([
      {
        path: "/",
        prerender: {
          enabled: true,
        },
        sitemap: {
          changefreq: "weekly",
          priority: 1,
        },
      },
      {
        path: "/blogs/hello-world",
        prerender: {
          enabled: true,
        },
        sitemap: {
          changefreq: "monthly",
          lastmod: "2026-03-01",
          priority: 0.8,
        },
      },
      {
        path: "/blogs/zebra-notes",
        prerender: {
          enabled: true,
        },
        sitemap: {
          changefreq: "monthly",
          lastmod: "2026-03-04",
          priority: 0.8,
        },
      },
      {
        path: "/projects/alpha",
        prerender: {
          enabled: true,
        },
        sitemap: {
          changefreq: "monthly",
          priority: 0.7,
        },
      },
      {
        path: "/projects/omega",
        prerender: {
          enabled: true,
        },
        sitemap: {
          changefreq: "monthly",
          priority: 0.7,
        },
      },
    ])
  })

  it("rejects invalid blog publish dates", () => {
    const { blogsDirectory, projectsDirectory } = createCollectionDirectories()

    writeFileSync(
      path.join(blogsDirectory, "broken.md"),
      `---
title: Broken
summary: Broken post
publishedAt: 03-09-2026
tags:
  - broken
---
`
    )

    expect(() =>
      getSitemapPages({
        blogsDirectory,
        projectsDirectory,
      })
    ).toThrowError(
      '[sitemap:blogs/broken.md] Expected "publishedAt" to use YYYY-MM-DD'
    )
  })

  it("rejects malformed YAML frontmatter", () => {
    const { blogsDirectory, projectsDirectory } = createCollectionDirectories()

    writeFileSync(
      path.join(blogsDirectory, "broken-yaml.md"),
      `---
title: Broken
summary: Broken post
publishedAt:
  - "2026-03-09"
tags:
  - broken
---
`
    )

    expect(() =>
      getSitemapPages({
        blogsDirectory,
        projectsDirectory,
      })
    ).toThrowError('[sitemap:blogs/broken-yaml.md] Expected "publishedAt" to be a non-empty string')
  })

  it("returns the prerendered root page when content collections are empty", () => {
    const { blogsDirectory, projectsDirectory } = createCollectionDirectories()

    expect(
      getSitemapPages({
        blogsDirectory,
        projectsDirectory,
      })
    ).toEqual([
      {
        path: "/",
        prerender: {
          enabled: true,
        },
        sitemap: {
          changefreq: "weekly",
          priority: 1,
        },
      },
    ])
  })
})
