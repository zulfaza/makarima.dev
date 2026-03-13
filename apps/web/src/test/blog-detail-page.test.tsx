import { isNotFound } from "@tanstack/react-router"
import { fireEvent, screen } from "@testing-library/react"

import { BlogDetailPage, loadBlogEntry } from "@/routes/blogs/$slug"
import { renderWithRouter } from "@/test/render-with-router"
import { getClipboardText } from "@/test/setup"

import type { BlogEntry } from "@/content/site"

const sampleBlogEntry: BlogEntry = {
  slug: "content-boundary",
  title: "Content boundary",
  summary: "Personal projects last longer when the constraints stay visible.",
  publishedAt: "2026-02-14",
  tags: ["typescript"],
  body: [
    {
      kind: "paragraph",
      content: "Personal projects last longer when the constraints stay visible.",
    },
    {
      kind: "image",
      src: "/images/content-preview.svg",
      alt: "Editorial layout sketch with cards and code columns",
      caption: "A compact editorial sketch for the article layout.",
    },
    {
      kind: "code",
      language: "ts",
      title: "Typed snippet",
      code: "type ContentBlock = { readonly kind: 'paragraph'; readonly content: string }",
    },
  ],
}

describe("BlogDetailPage", () => {
  test("renders blog detail content", () => {
    renderWithRouter(<BlogDetailPage entry={sampleBlogEntry} />)

    const pageTitle = screen.getByRole("heading", {
      level: 1,
      name: sampleBlogEntry.title,
    })

    expect(pageTitle).toBeTruthy()
    expect(screen.getByText("Feb 14, 2026")).toBeTruthy()
    expect(screen.getAllByText(sampleBlogEntry.summary)).toHaveLength(2)
    expect(screen.getByText("typescript")).toBeTruthy()
    expect(
      screen.getByRole("img", {
        name: "Editorial layout sketch with cards and code columns",
      })
    ).toBeTruthy()
    const codeHeading = screen.getByText("Typed snippet")
    const codeBlock = codeHeading.closest("figure")

    expect(codeHeading).toBeTruthy()

    if (!codeBlock) {
      throw new Error("Expected code figure for blog detail")
    }

    expect(codeBlock.textContent.includes("type ContentBlock =")).toBe(true)
    expect(screen.getByRole("button", { name: /Copy code:/i })).toBeTruthy()
  })

  test("opens an image preview from rich content", () => {
    renderWithRouter(<BlogDetailPage entry={sampleBlogEntry} />)

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
    renderWithRouter(<BlogDetailPage entry={sampleBlogEntry} />)

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
