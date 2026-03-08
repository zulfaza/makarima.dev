import { isNotFound } from "@tanstack/react-router"
import { fireEvent, screen } from "@testing-library/react"

import { projects } from "@/content/site"
import { ProjectDetailPage, loadProjectEntry } from "@/routes/projects/$slug"
import { renderWithRouter } from "@/test/render-with-router"

describe("ProjectDetailPage", () => {
  test("renders project detail content", () => {
    const entry = projects[0]

    if (!entry) {
      throw new Error("Expected a project entry in mock data")
    }

    renderWithRouter(<ProjectDetailPage entry={entry} />)

    expect(
      screen.getByRole("heading", { level: 1, name: entry.name })
    ).toBeTruthy()
    expect(screen.getByText("2026")).toBeTruthy()
    expect(screen.getByText("Active")).toBeTruthy()
    expect(screen.getByText("TanStack Start")).toBeTruthy()
    expect(
      screen.getByText(
        "This project is the public index for notes and side work."
      )
    ).toBeTruthy()
    expect(
      screen.getByRole("img", {
        name: "Preview card wall with a highlighted detail panel",
      })
    ).toBeTruthy()
    const codeHeading = screen.getByText("Project entry")
    const codeBlock = codeHeading.closest("figure")

    expect(codeHeading).toBeTruthy()

    if (!codeBlock) {
      throw new Error("Expected code figure for project detail")
    }

    expect(
      codeBlock.textContent?.includes("readonly body: readonly ContentBlock[]")
    ).toBe(true)
    expect(screen.getByRole("button", { name: /Copy code:/i })).toBeTruthy()
  })

  test("opens project image preview from detail content", () => {
    const entry = projects[0]

    if (!entry) {
      throw new Error("Expected a project entry in mock data")
    }

    renderWithRouter(<ProjectDetailPage entry={entry} />)

    fireEvent.click(screen.getByRole("button", { name: /Preview image:/i }))

    expect(
      screen.getByRole("dialog", {
        name: "Preview card wall with a highlighted detail panel",
      })
    ).toBeTruthy()
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
