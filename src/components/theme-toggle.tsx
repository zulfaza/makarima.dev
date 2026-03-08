import { useEffect } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { applyTheme, setThemePreference, useEffectiveTheme } from "@/lib/theme"

export function ThemeToggle() {
  const theme = useEffectiveTheme()
  const isDark = theme === "dark"
  const label = isDark ? "Switch to light mode" : "Switch to dark mode"
  const Icon = isDark ? Sun : Moon

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <Button
      aria-label={label}
      onClick={() => {
        setThemePreference(isDark ? "light" : "dark")
      }}
      size="icon-sm"
      title={label}
      type="button"
      variant="outline"
    >
      <Icon />
      <span className="sr-only">{label}</span>
    </Button>
  )
}
