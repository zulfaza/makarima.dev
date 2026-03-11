import { createRouter as createTanStackRouter } from "@tanstack/react-router"

import { SiteNotFound } from "@/components/site-not-found"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    defaultNotFoundComponent: SiteNotFound,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
