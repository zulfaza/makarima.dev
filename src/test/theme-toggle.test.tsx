import { fireEvent, render, screen } from "@testing-library/react"

import { ThemeToggle } from "@/components/theme-toggle"
import { themeStorageKey } from "@/lib/theme"
import { setMatchMediaMatches } from "@/test/setup"

describe("ThemeToggle", () => {
  test("saved dark preference applies html.dark on mount", () => {
    window.localStorage.setItem(themeStorageKey, "dark")

    render(<ThemeToggle />)

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeTruthy()
  })

  test("saved light preference removes html.dark on mount", () => {
    document.documentElement.classList.add("dark")
    window.localStorage.setItem(themeStorageKey, "light")

    render(<ThemeToggle />)

    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" })
    ).toBeTruthy()
  })

  test("system preference is used when no saved theme exists", () => {
    setMatchMediaMatches(true)

    render(<ThemeToggle />)

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeTruthy()
  })

  test("clicking toggle flips theme and persists explicit preference", () => {
    render(<ThemeToggle />)

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }))

    expect(window.localStorage.getItem(themeStorageKey)).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeTruthy()
  })
})
