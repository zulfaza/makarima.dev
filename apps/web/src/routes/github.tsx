import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

const DESTINATION = "https://github.com/zulfaza"

export const Route = createFileRoute("/github")({
  component: GithubRedirect,
})

function GithubRedirect() {
  useEffect(() => {
    window.gtag?.("event", "redirect_click", { destination: DESTINATION })
    window.location.replace(DESTINATION)
  }, [])
  return null
}