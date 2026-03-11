import { screen, within } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import type { BlogEntry, ProjectEntry } from "@/content/site"

const sampleBlogEntry: BlogEntry = {
  slug: "sample-blog",
  title: "Sample Blog",
  summary: "Sample blog summary",
  publishedAt: "2026-03-01",
  tags: ["TypeScript"],
  body: [],
}

const sampleProjectEntry: ProjectEntry = {
  slug: "sample-project",
  name: "Sample Project",
  summary: "Sample project summary",
  year: 2026,
  stack: ["React"],
  status: "active",
  body: [],
}

async function renderHomePageWithContent(content?: {
  blogs?: ReadonlyArray<BlogEntry>
  projects?: ReadonlyArray<ProjectEntry>
}) {
  const { loadBlogs, loadProjects } = await import("@/content/site")
  const [{ HomePage }, { renderWithRouter }] = await Promise.all([
    import("@/routes/index"),
    import("@/test/render-with-router"),
  ])

  const blogs = content?.blogs ?? loadBlogs()
  const projects = content?.projects ?? loadProjects()

  renderWithRouter(<HomePage blogs={blogs} projects={projects} />)
}

describe("HomePage", () => {
  test("renders home sections and detail links", async () => {
    await renderHomePageWithContent()

    expect(screen.getByRole("heading", { name: "Blogs" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Projects" })).toBeTruthy()

    expect(
      screen.getByRole("heading", { name: "Building With Calm Constraints" })
    ).toBeTruthy()
    const pageTitle = screen.getByRole("heading", {
      level: 1,
      name: "makarima.dev",
    })

    expect(pageTitle).toBeTruthy()

    const blogLink = screen.getByRole("link", {
      name: "Building With Calm Constraints",
    })
    const projectLink = screen.getByRole("link", { name: "makarima.dev" })

    expect(blogLink.getAttribute("href")).toBe(
      "/blogs/building-with-calm-constraints"
    )
    expect(projectLink.getAttribute("href")).toBe("/projects/makarima-dev")

    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy()
    expect(screen.queryByText("Pixel snake")).toBeNull()
    expect(screen.queryByText("Use arrow keys, WASD, or HJKL.")).toBeNull()

    const gameBoard = screen.getByTestId("footer-snake-board")
    const footer = screen.getByRole("contentinfo")
    const links = within(footer).getAllByRole("link")
    const themeToggle = within(footer).getByRole("button", {
      name: "Switch to dark mode",
    })
    const githubLink = within(footer).getByRole("link", { name: "GitHub" })

    expect(links).toHaveLength(2)
    expect(themeToggle).toBeTruthy()
    expect(within(footer).getByRole("link", { name: "GitHub" })).toBeTruthy()
    expect(within(footer).getByRole("link", { name: "LinkedIn" })).toBeTruthy()
    expect(themeToggle.nextElementSibling).toBe(githubLink)
    expect(
      gameBoard.compareDocumentPosition(footer) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0)
  })

  test("renders shared empty state when blogs and projects are empty", async () => {
    await renderHomePageWithContent({
      blogs: [],
      projects: [],
    })

    expect(
      screen.getByRole("heading", { level: 2, name: "Nothing published yet" })
    ).toBeTruthy()
    expect(
      screen.getByText(
        "Blog posts and projects will appear here once they are ready."
      )
    ).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Blogs" })).toBeNull()
    expect(screen.queryByRole("heading", { name: "Projects" })).toBeNull()
    expect(
      screen.queryByRole("navigation", { name: "Section navigation" })
    ).toBeNull()
    expect(screen.queryByRole("link", { name: "Sample Blog" })).toBeNull()
    expect(screen.queryByRole("link", { name: "Sample Project" })).toBeNull()
  })

  test("hides blog section when blogs are empty", async () => {
    await renderHomePageWithContent({
      blogs: [],
      projects: [sampleProjectEntry],
    })

    expect(screen.queryByRole("heading", { name: "Blogs" })).toBeNull()
    expect(screen.getByRole("heading", { name: "Projects" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Projects" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Sample Project" })).toBeTruthy()
    expect(
      screen.queryByRole("heading", { name: "Nothing published yet" })
    ).toBeNull()
  })

  test("hides project section when projects are empty", async () => {
    await renderHomePageWithContent({
      blogs: [sampleBlogEntry],
      projects: [],
    })

    expect(screen.getByRole("heading", { name: "Blogs" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Blogs" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Sample Blog" })).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Projects" })).toBeNull()
    expect(
      screen.queryByRole("heading", { name: "Nothing published yet" })
    ).toBeNull()
  })
})
