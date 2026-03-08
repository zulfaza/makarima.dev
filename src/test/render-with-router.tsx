import { RouterContextProvider } from "@tanstack/react-router"
import { render, type RenderOptions } from "@testing-library/react"
import type { ReactElement } from "react"

import { getRouter } from "@/router"

export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  const router = getRouter()

  return render(
    <RouterContextProvider router={router}>{ui}</RouterContextProvider>,
    options
  )
}
