const blogDateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export type BlogEntry = {
  readonly slug: string
  readonly title: string
  readonly summary: string
  readonly publishedAt: string
  readonly tags: ReadonlyArray<string>
  readonly body: ReadonlyArray<ContentBlock>
}

export type ProjectStatus = "active" | "archived" | "draft"

export type ProjectEntry = {
  readonly slug: string
  readonly name: string
  readonly summary: string
  readonly year: number
  readonly stack: ReadonlyArray<string>
  readonly status: ProjectStatus
  readonly body: ReadonlyArray<ContentBlock>
}

export type CodeLanguage = "bash" | "json" | "ts" | "tsx"

export type ContentBlock =
  | {
      readonly kind: "paragraph"
      readonly content: string
    }
  | {
      readonly kind: "image"
      readonly src: string
      readonly alt: string
      readonly caption?: string
    }
  | {
      readonly kind: "code"
      readonly language: CodeLanguage
      readonly code: string
      readonly title?: string
      readonly caption?: string
    }

type BaseSocialLink = {
  readonly label: string
  readonly href: string
}

export type SocialLink =
  | ({ readonly kind: "github" } & BaseSocialLink)
  | ({ readonly kind: "linkedin" } & BaseSocialLink)

function paragraph(content: string): ContentBlock {
  return { kind: "paragraph", content }
}

export const blogs: ReadonlyArray<BlogEntry> = [
  {
    slug: "building-with-calm-constraints",
    title: "Building With Calm Constraints",
    summary:
      "Notes on keeping personal projects small, typed, and easy to edit when momentum is low.",
    publishedAt: "2026-02-14",
    tags: ["typescript", "workflow", "notes"],
    body: [
      paragraph(
        "Personal projects last longer when the constraints stay visible."
      ),
      {
        kind: "image",
        src: "/images/content-preview.svg",
        alt: "Editorial layout sketch with cards and code columns",
        caption:
          "A fast sketch helps keep hierarchy obvious before components harden.",
      },
      paragraph(
        "I prefer a small surface area, typed content boundaries, and fewer moving pieces than a polished abstraction that I will have to revisit later."
      ),
      {
        kind: "code",
        language: "tsx",
        title: "Content boundary",
        code: `type ContentBlock =
  | { kind: "paragraph"; content: string }
  | { kind: "image"; src: string; alt: string }
  | { kind: "code"; language: "tsx"; code: string }`,
        caption:
          "The route can stay simple once the content shape is explicit.",
      },
      paragraph(
        "That usually means writing simple data structures first, then letting the interface grow from the information instead of the other way around."
      ),
    ],
  },
  {
    slug: "content-first-ui-systems",
    title: "Content First UI Systems",
    summary:
      "A quick write-up on starting from information shape before choosing layout details.",
    publishedAt: "2026-01-26",
    tags: ["frontend", "design", "architecture"],
    body: [
      paragraph(
        "Interfaces get clearer when the content model settles before the layout does."
      ),
      paragraph(
        "When the information hierarchy is obvious, spacing, grouping, and interaction choices become much easier to defend."
      ),
      paragraph(
        "That approach also makes it easier to move later from mock data to markdown without rewriting half the UI tree."
      ),
    ],
  },
  {
    slug: "markdown-as-source-of-truth",
    title: "Markdown As Source Of Truth",
    summary:
      "Early thoughts on using local markdown files as the durable editing layer for blogs and projects.",
    publishedAt: "2025-12-18",
    tags: ["content", "markdown", "planning"],
    body: [
      paragraph(
        "Markdown stays attractive because it is boring in the best way."
      ),
      paragraph(
        "It travels well across tools, diff reviews stay readable, and the authoring format does not force a database decision too early."
      ),
      paragraph(
        "For a personal site, that is often enough structure to publish consistently without creating a maintenance project."
      ),
    ],
  },
] as const

export const projects: ReadonlyArray<ProjectEntry> = [
  {
    slug: "makarima-dev",
    name: "makarima.dev",
    summary:
      "Personal site shell for writing, shipping small experiments, and keeping project notes close to code.",
    year: 2026,
    stack: ["TanStack Start", "React", "Tailwind CSS"],
    status: "active",
    body: [
      paragraph("This project is the public index for notes and side work."),
      {
        kind: "image",
        src: "/images/content-preview.svg",
        alt: "Preview card wall with a highlighted detail panel",
        caption:
          "The detail page now supports visual blocks without changing the route contract.",
      },
      paragraph(
        "The current version keeps everything in typed mock data, but the intended next step is reading local markdown files and mapping them into the same route structure."
      ),
      {
        kind: "code",
        language: "ts",
        title: "Project entry",
        code: `export type ProjectEntry = {
  readonly slug: string
  readonly name: string
  readonly body: readonly ContentBlock[]
}`,
        caption:
          "The entry type stays narrow while the renderer handles variants.",
      },
      paragraph(
        "The main constraint is to keep the UI direct and editable without introducing CMS overhead."
      ),
    ],
  },
  {
    slug: "field-notes",
    name: "Field Notes",
    summary:
      "A local-first notebook concept for capturing drafts, code references, and publish-ready fragments.",
    year: 2025,
    stack: ["TypeScript", "Markdown", "Search"],
    status: "draft",
    body: [
      paragraph(
        "Field Notes is a rough concept for storing writing fragments and technical references close to active work."
      ),
      paragraph(
        "The goal is to make drafts searchable, linkable, and easy to graduate into published posts or project notes."
      ),
      paragraph(
        "It is still in draft state because the data model matters more than the interaction polish at this stage."
      ),
    ],
  },
  {
    slug: "tiny-ops",
    name: "Tiny Ops",
    summary:
      "A small toolbox for repeatable deploy and release tasks across side projects.",
    year: 2024,
    stack: ["Bun", "Cloudflare", "CLI"],
    status: "archived",
    body: [
      paragraph(
        "Tiny Ops started as a practical wrapper around repetitive release tasks."
      ),
      paragraph(
        "It bundled a few deploy, verification, and clean-up commands that were being copied between repositories too often."
      ),
      paragraph(
        "The project is archived now, but some of its conventions still shape newer tooling decisions."
      ),
    ],
  },
] as const

export const socials: ReadonlyArray<SocialLink> = [
  {
    kind: "github",
    label: "GitHub",
    href: "https://github.com/makarima",
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/makarima/",
  },
] as const

export function formatBlogDate(publishedAt: BlogEntry["publishedAt"]) {
  return blogDateFormatter.format(new Date(publishedAt))
}

export function formatProjectStatus(status: ProjectStatus) {
  switch (status) {
    case "active":
      return "Active"
    case "archived":
      return "Archived"
    case "draft":
      return "Draft"
  }
}

export function getBlogBySlug(slug: string) {
  return blogs.find((entry) => entry.slug === slug)
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug)
}
