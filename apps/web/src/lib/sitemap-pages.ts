import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import matter from "gray-matter"

import { siteMetadata } from "./site-metadata"

type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never"

type SitemapPage = {
  readonly path: string
  readonly sitemap?: {
    readonly changefreq?: SitemapChangeFrequency
    readonly lastmod?: string
    readonly priority?: number
  }
}

type SitemapPageOptions = {
  readonly blogsDirectory?: string
  readonly projectsDirectory?: string
}

type MarkdownCollection = "blogs" | "projects"

function fail(context: string, message: string): never {
  throw new Error(`[sitemap:${context}] ${message}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getCollectionDirectory(collection: MarkdownCollection) {
  return fileURLToPath(new URL(`../content/${collection}`, import.meta.url))
}

function listMarkdownFiles(directory: string) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
}

function readSlug(fileName: string, context: string) {
  if (!fileName.endsWith(".md")) {
    fail(context, "Expected markdown file")
  }

  const slug = fileName.slice(0, -3)

  if (slug.length === 0) {
    fail(context, "Expected file name before .md")
  }

  return slug
}

function readPublishedAt(source: string, context: string) {
  const data: unknown = matter(source).data

  if (!isRecord(data)) {
    fail(context, "Expected frontmatter object")
  }

  const rawValue = data.publishedAt

  if (typeof rawValue !== "string") {
    fail(context, 'Expected "publishedAt" to be a non-empty string')
  }

  const value = rawValue.trim()

  if (value.length === 0) {
    fail(context, 'Expected "publishedAt" to be a non-empty string')
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    fail(context, 'Expected "publishedAt" to use YYYY-MM-DD')
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    fail(context, 'Expected "publishedAt" to be a valid calendar date')
  }

  return value
}

function getBlogPages(directory: string): Array<SitemapPage> {
  return listMarkdownFiles(directory).map((fileName) => {
    const context = `blogs/${fileName}`
    const slug = readSlug(fileName, context)
    const filePath = `${directory}/${fileName}`
    const source = readFileSync(filePath, "utf8")

    return {
      path: `/blogs/${slug}`,
      sitemap: {
        changefreq: "monthly",
        lastmod: readPublishedAt(source, context),
        priority: 0.8,
      },
    }
  })
}

function getProjectPages(directory: string): Array<SitemapPage> {
  return listMarkdownFiles(directory).map((fileName) => {
    const context = `projects/${fileName}`
    const slug = readSlug(fileName, context)

    return {
      path: `/projects/${slug}`,
      sitemap: {
        changefreq: "monthly",
        priority: 0.7,
      },
    }
  })
}

export const sitemapHost = siteMetadata.origin

export function getSitemapPages(
  options: SitemapPageOptions = {}
): Array<SitemapPage> {
  const blogsDirectory = options.blogsDirectory ?? getCollectionDirectory("blogs")
  const projectsDirectory =
    options.projectsDirectory ?? getCollectionDirectory("projects")

  return [
    {
      path: "/",
      sitemap: {
        changefreq: "weekly",
        priority: 1,
      },
    },
    ...getBlogPages(blogsDirectory),
    ...getProjectPages(projectsDirectory),
  ]
}
