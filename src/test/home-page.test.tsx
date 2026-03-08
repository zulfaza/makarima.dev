import { screen, within } from "@testing-library/react"

import { HomePage } from "@/routes/index"
import { renderWithRouter } from "@/test/render-with-router"

describe("HomePage", () => {
  test("renders home sections and detail links", () => {
    renderWithRouter(<HomePage />)

    expect(screen.getByRole("heading", { name: "Blogs" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Projects" })).toBeTruthy()

    expect(
      screen.getByRole("heading", { name: "Building With Calm Constraints" })
    ).toBeTruthy()
    expect(
      screen.getByRole("heading", { level: 1, name: "makarima.dev" })
    ).toBeTruthy()

    const blogLink = screen.getByRole("link", {
      name: "Building With Calm Constraints",
    })
    const projectLink = screen.getByRole("link", { name: "makarima.dev" })

    expect(blogLink.getAttribute("href")).toBe(
      "/blogs/building-with-calm-constraints"
    )
    expect(projectLink.getAttribute("href")).toBe("/projects/makarima-dev")

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
  })
})
