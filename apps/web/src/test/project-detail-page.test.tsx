import { isNotFound } from "@tanstack/react-router"
import { screen, waitFor } from "@testing-library/react"

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
    expect(screen.getByText("2026-05-06")).toBeTruthy()
    expect(screen.getByText("Active")).toBeTruthy()
    expect(screen.getByText(entry.summary)).toBeTruthy()
    expect(screen.getByText("Python")).toBeTruthy()
    expect(screen.getByTestId("project-favicon").getAttribute("src")).toBe(
      entry.faviconHref
    )
    const accessLink = screen.getByRole("link", { name: "View source" })

    expect(accessLink.getAttribute("href")).toBe(
      "https://github.com/zulfaza/ai-meeting-notes-poc-py?utm_source=makarima.dev&utm_medium=project_page&utm_campaign=ai-meeting-notes-poc-py"
    )
    expect(
      await screen.findByText(/This project explores a narrow but useful workflow:/)
    ).toBeTruthy()
    expect(
      await screen.findByText(/The pipeline is intentionally explicit\./)
    ).toBeTruthy()
    expect(screen.queryByRole("img")).toBeNull()
    expect(screen.queryByRole("button", { name: /Copy code:/i })).toBeNull()
    expect(screen.queryByRole("button", { name: /Preview image:/i })).toBeNull()
    expect(await screen.findByText("Code flow")).toBeTruthy()
    expect(
      await screen.findByText(
        "Pipeline from source video to structured notes and action items."
      )
    ).toBeTruthy()
    await waitFor(() => {
      expect(
        screen.getByTestId("mermaid-diagram").querySelector("svg")
      ).not.toBeNull()
    })
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
