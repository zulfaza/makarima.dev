import { screen } from "@testing-library/react"

import { SiteNotFound } from "@/components/site-not-found"
import { renderWithRouter } from "@/test/render-with-router"

describe("SiteNotFound", () => {
  test("renders the custom 404 page", () => {
    renderWithRouter(<SiteNotFound />)

    expect(
      screen.getByRole("heading", { level: 1, name: "Page not found" })
    ).toBeTruthy()
    expect(screen.getByText("404")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Back to home" }).getAttribute("href")
    ).toBe("/")
  })
})
