import { createMemoryHistory } from "@tanstack/history"
import {
  RouterContextProvider,
  RouterProvider,
  createRouter as createTanStackRouter,
} from "@tanstack/react-router"
import { render } from "@testing-library/react"

import { SiteNotFound } from "@/components/site-not-found"
import { getRouter } from "@/router"
import { routeTree } from "@/routeTree.gen"

import type { RenderOptions } from "@testing-library/react"
import type { ReactElement } from "react"

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

export async function renderRoute(path: string) {
  const router = createTanStackRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [path],
    }),
    defaultNotFoundComponent: SiteNotFound,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })

  await router.load()

  return render(<RouterProvider router={router} />)
}
