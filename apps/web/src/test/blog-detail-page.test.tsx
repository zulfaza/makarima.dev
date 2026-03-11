import { isNotFound } from "@tanstack/react-router"
import { fireEvent, screen } from "@testing-library/react"

import { loadBlogs } from "@/content/site"
import { BlogDetailPage, loadBlogEntry } from "@/routes/blogs/$slug"
import { renderWithRouter } from "@/test/render-with-router"
import { getClipboardText } from "@/test/setup"

describe("BlogDetailPage", () => {
  test("renders blog detail content", () => {
    const entry = loadBlogs()[0]

    renderWithRouter(<BlogDetailPage entry={entry} />)

    const pageTitle = screen.getByRole("heading", {
      level: 1,
      name: entry.title,
    })

    expect(pageTitle).toBeTruthy()
    expect(screen.getByText("Feb 14, 2026")).toBeTruthy()
    expect(screen.getByText("typescript")).toBeTruthy()
    expect(
      screen.getByText(
        "Personal projects last longer when the constraints stay visible."
      )
    ).toBeTruthy()
    expect(
      screen.getByRole("img", {
        name: "Editorial layout sketch with cards and code columns",
      })
    ).toBeTruthy()
    const codeHeading = screen.getByText("Content boundary")
    const codeBlock = codeHeading.closest("figure")

    expect(codeHeading).toBeTruthy()

    if (!codeBlock) {
      throw new Error("Expected code figure for blog detail")
    }

    expect(codeBlock.textContent.includes("type ContentBlock =")).toBe(true)
    expect(screen.getByRole("button", { name: /Copy code:/i })).toBeTruthy()
  })

  test("opens an image preview from rich content", () => {
    const entry = loadBlogs()[0]

    renderWithRouter(<BlogDetailPage entry={entry} />)

    fireEvent.click(screen.getByRole("button", { name: /Preview image:/i }))

    expect(
      screen.getByRole("dialog", {
        name: "Editorial layout sketch with cards and code columns",
      })
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Close image preview" })
    ).toBeTruthy()
  })

  test("copies highlighted blog code", async () => {
    const entry = loadBlogs()[0]

    renderWithRouter(<BlogDetailPage entry={entry} />)

    fireEvent.click(screen.getByRole("button", { name: /Copy code:/i }))

    expect(
      await screen.findByRole("button", { name: /Copied code:/i })
    ).toBeTruthy()
    expect(getClipboardText()).toContain("type ContentBlock =")
  })

  test("throws a TanStack not-found for missing slugs", async () => {
    expect.assertions(1)

    try {
      await loadBlogEntry("missing-blog")
    } catch (error) {
      expect(isNotFound(error)).toBe(true)
    }
  })
})
