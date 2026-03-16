import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

const DESTINATION = "https://www.linkedin.com/in/zul-faza-makarima/"

export const Route = createFileRoute("/linkedin")({
  component: LinkedinRedirect,
})

function LinkedinRedirect() {
  useEffect(() => {
    window.gtag?.("event", "redirect_click", { destination: DESTINATION })
    window.location.replace(DESTINATION)
  }, [])
  return null
}