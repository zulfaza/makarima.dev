import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { LinksPage } from "@/routes/links"
import { renderWithRouter } from "@/test/render-with-router"

describe("LinksPage", () => {
  afterEach(() => {
    window.history.pushState(null, "", "/")
    window.gtag = () => undefined
  })

  test("renders personal links", async () => {
    renderWithRouter(<LinksPage />)

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Zul Faza Makarima",
      })
    ).toBeTruthy()
    expect(screen.getByText("Links and profiles.")).toBeTruthy()

    const personalLinks = screen.getByRole("navigation", {
      name: "Personal links",
    })
    const linkedinLink = within(personalLinks).getByRole("link", {
      name: /LinkedIn/,
    })
    const githubLink = within(personalLinks).getByRole("link", {
      name: /GitHub/,
    })
    const xLink = within(personalLinks).getByRole("link", { name: /X/ })

    expect(linkedinLink.getAttribute("href")).toBe(
      "https://www.linkedin.com/in/zul-faza-makarima/"
    )
    expect(githubLink.getAttribute("href")).toBe("https://github.com/zulfaza")
    expect(xLink.getAttribute("href")).toBe("https://x.com/contoh_unipdai")
    expect(
      screen.getByRole("contentinfo").compareDocumentPosition(personalLinks) &
        Node.DOCUMENT_POSITION_PRECEDING
    ).not.toBe(0)
  })

  test("tracks campaign params and removes them from url", async () => {
    const gtag = vi.fn()
    window.gtag = gtag
    window.history.pushState(
      null,
      "",
      "/links?utm_campaign=codex-meetup&utm_source=linkedin&preview=true#profile"
    )

    renderWithRouter(<LinksPage />)

    expect(gtag).toHaveBeenCalledWith("event", "links_campaign_visit", {
      utm_campaign: "codex-meetup",
      utm_source: "linkedin",
    })
    expect(window.location.pathname).toBe("/links")
    expect(window.location.search).toBe("?preview=true")
    expect(window.location.hash).toBe("#profile")
  })
})
