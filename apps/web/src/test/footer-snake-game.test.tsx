import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { FooterSnakeGame } from "@/components/footer-snake-game"

const morphDurationMs = 20
const tickDurationMs = 20
const foodAheadRandom = 174.5 / 402
const foodAboveAfterEatRandom = 150.5 / 401

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function createRandomSequence(values: ReadonlyArray<number>) {
  let index = 0

  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0

    index += 1

    return value
  }
}

describe("FooterSnakeGame", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("renders idle state with centered board and play button", () => {
    render(<FooterSnakeGame />)

    const board = screen.getByTestId("footer-snake-board")
    const section = screen.getByRole("region", { name: "Footer snake game" })
    const score = screen.getByTestId("snake-score")

    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy()
    expect(screen.queryByText("Pixel snake")).toBeNull()
    expect(screen.queryByText("Use arrow keys, WASD, or HJKL.")).toBeNull()
    expect(screen.queryByRole("button", { name: "Move up" })).toBeNull()
    expect(screen.queryByText(".dev")).toBeNull()
    expect(board.style.backgroundColor).toBe("")
    expect(board.className).toContain("w-full")
    expect(board.style.aspectRatio).toBe("27 / 15")
    expect(section.firstElementChild?.className).toContain("items-center")
    expect(score.textContent).toBe("Score 0")
    expect(score.className).toContain("opacity-0")
  })

  test("clicking play morphs then starts the game and shows mobile controls", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))

    const board = screen.getByTestId("footer-snake-board")

    expect(board.getAttribute("data-phase")).toBe("morphing")
    expect(screen.queryByRole("button", { name: "Pause" })).toBeNull()
    expect(screen.getByRole("button", { name: "Move up" })).toBeTruthy()

    advance(morphDurationMs)

    expect(board.getAttribute("data-phase")).toBe("playing")
    expect(screen.getByRole("button", { name: "Play again" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy()
    expect(screen.getByTestId("snake-score").textContent).toBe("Score 0")
  })

  test("pause button pauses and resumes the active run", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)

    const board = screen.getByTestId("footer-snake-board")

    fireEvent.click(screen.getByRole("button", { name: "Pause" }))

    expect(board.getAttribute("data-phase")).toBe("paused")
    expect(screen.getByRole("button", { name: "Resume" })).toBeTruthy()
    expect(screen.getByRole("status").textContent).toContain("Paused")

    fireEvent.click(screen.getByRole("button", { name: "Resume" }))

    expect(board.getAttribute("data-phase")).toBe("playing")
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy()
  })

  test("auto pauses when the window blurs", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)

    const board = screen.getByTestId("footer-snake-board")

    fireEvent.blur(window)

    expect(board.getAttribute("data-phase")).toBe("paused")
    expect(screen.getByRole("button", { name: "Resume" })).toBeTruthy()
  })

  test("keyboard mappings steer with arrows, wasd, and hjkl", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        random={() => 0}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)

    const head = screen.getByTestId("snake-head")

    expect(head.getAttribute("data-col")).toBe("14")
    expect(head.getAttribute("data-row")).toBe("6")

    fireEvent.keyDown(window, { key: "ArrowUp" })
    advance(tickDurationMs)
    expect(head.getAttribute("data-col")).toBe("14")
    expect(head.getAttribute("data-row")).toBe("5")

    fireEvent.keyDown(window, { key: "d" })
    advance(tickDurationMs)
    expect(head.getAttribute("data-col")).toBe("15")
    expect(head.getAttribute("data-row")).toBe("5")

    fireEvent.keyDown(window, { key: "j" })
    advance(tickDurationMs)
    expect(head.getAttribute("data-col")).toBe("15")
    expect(head.getAttribute("data-row")).toBe("6")
  })

  test("ignores opposite-direction reversal within the same tick", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        random={() => 0}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)

    const head = screen.getByTestId("snake-head")

    fireEvent.keyDown(window, { key: "ArrowUp" })
    fireEvent.keyDown(window, { key: "ArrowLeft" })
    advance(tickDurationMs)

    expect(head.getAttribute("data-col")).toBe("14")
    expect(head.getAttribute("data-row")).toBe("5")
  })

  test("food stays in place until it gets eaten", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        random={() => 0}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)

    const food = screen.getByTestId("snake-food")
    const initialFoodPosition = `${food.getAttribute("data-col")},${food.getAttribute("data-row")}`

    fireEvent.keyDown(window, { key: "ArrowUp" })
    advance(tickDurationMs)

    expect(
      `${food.getAttribute("data-col")},${food.getAttribute("data-row")}`
    ).toBe(initialFoodPosition)
  })

  test("eating food grows the snake and relocates the next food", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        random={() => foodAheadRandom}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)
    const food = screen.getByTestId("snake-food")
    const initialFoodPosition = `${food.getAttribute("data-col")},${food.getAttribute("data-row")}`

    fireEvent.keyDown(window, { key: "ArrowRight" })
    advance(tickDurationMs)

    expect(document.querySelectorAll('[data-segment="snake"]').length).toBe(4)
    expect(screen.getByRole("status").textContent).toContain("Score 1")
    expect(
      `${food.getAttribute("data-col")},${food.getAttribute("data-row")}`
    ).not.toBe(initialFoodPosition)
  })

  test("wall collision ends the run", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        random={() => 0.75}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)
    fireEvent.keyDown(window, { key: "ArrowUp" })
    advance(tickDurationMs * 7)

    expect(screen.getByRole("status").textContent).toContain("Game over")
  })

  test("self collision ends the run", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        random={createRandomSequence([
          foodAheadRandom,
          foodAboveAfterEatRandom,
        ])}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)

    fireEvent.keyDown(window, { key: "ArrowRight" })
    advance(tickDurationMs)
    fireEvent.keyDown(window, { key: "ArrowUp" })
    advance(tickDurationMs)
    fireEvent.keyDown(window, { key: "ArrowLeft" })
    advance(tickDurationMs)
    fireEvent.keyDown(window, { key: "ArrowDown" })
    advance(tickDurationMs)

    expect(screen.getByRole("status").textContent).toContain("Game over")
  })

  test("play again resets score, food, and snake position", () => {
    render(
      <FooterSnakeGame
        morphDurationMs={morphDurationMs}
        random={() => foodAheadRandom}
        tickDurationMs={tickDurationMs}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    advance(morphDurationMs)
    fireEvent.keyDown(window, { key: "ArrowRight" })
    advance(tickDurationMs)

    const head = screen.getByTestId("snake-head")
    const food = screen.getByTestId("snake-food")

    expect(screen.getByRole("status").textContent).toContain("Score 1")
    expect(head.getAttribute("data-col")).toBe("15")
    expect(head.getAttribute("data-row")).toBe("6")
    expect(food.getAttribute("data-col")).toBeTruthy()
    expect(food.getAttribute("data-row")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Play again" }))
    expect(screen.getByTestId("footer-snake-board").getAttribute("data-phase")).toBe(
      "morphing"
    )

    advance(morphDurationMs)

    expect(screen.getByRole("status").textContent).toContain("Score 0")
    expect(screen.getByTestId("footer-snake-board").getAttribute("data-phase")).toBe(
      "playing"
    )
    expect(head.getAttribute("data-col")).toBe("14")
    expect(head.getAttribute("data-row")).toBe("6")
    expect(food.getAttribute("data-col")).toBeTruthy()
    expect(food.getAttribute("data-row")).toBeTruthy()
    expect(document.querySelectorAll('[data-segment="snake"]').length).toBe(3)
  })
})
