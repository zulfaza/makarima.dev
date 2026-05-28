import { isNotFound } from "@tanstack/react-router"
import { screen } from "@testing-library/react"

import { loadProjects } from "@/content/site"
import { ProjectDetailPage, loadProjectEntry } from "@/routes/projects/$slug"
import { renderWithRouter } from "@/test/render-with-router"

describe("ProjectDetailPage", () => {
  test("renders project detail content", async () => {
    const entry = loadProjects()[0]

    renderWithRouter(<ProjectDetailPage entry={entry} />)

    const pageTitle = screen.getByRole("heading", {
      level: 1,
      name: entry.name,
    })

    expect(pageTitle).toBeTruthy()
    expect(screen.getByText("2025-06-20")).toBeTruthy()
    expect(screen.getByText("Active")).toBeTruthy()
    expect(screen.getByText(entry.summary)).toBeTruthy()
    expect(screen.getByText("React")).toBeTruthy()
    expect(screen.getByTestId("project-favicon").getAttribute("src")).toBe(
      entry.faviconHref
    )
    const accessLink = screen.getByRole("link", { name: "Open project" })

    expect(accessLink.getAttribute("href")).toBe(
      "https://jwt.makarima.dev/?utm_source=makarima.dev&utm_medium=project_page&utm_campaign=jwt-debugger"
    )
    expect(
      await screen.findByText(/JWT Debugger is a small utility/)
    ).toBeTruthy()
    expect(screen.queryByRole("heading", { name: "Pixel snake" })).toBeNull()
  })

  test("throws a TanStack not-found for missing slugs", () => {
    expect.assertions(1)

    try {
      loadProjectEntry("missing-project")
    } catch (error) {
      expect(isNotFound(error)).toBe(true)
    }
  })
})
