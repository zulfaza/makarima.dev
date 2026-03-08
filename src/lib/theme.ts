import { useSyncExternalStore } from "react"

export const themeStorageKey = "makarima-theme"
export const darkModeMediaQuery = "(prefers-color-scheme: dark)"

const darkClassName = "dark"
const themeChangeEventName = "makarima:theme-change"

export type ThemePreference = "system" | "light" | "dark"
export type EffectiveTheme = Exclude<ThemePreference, "system">

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark"
}

function readThemePreferenceFromStorage(
  storage: Pick<Storage, "getItem">
): ThemePreference {
  try {
    const value = storage.getItem(themeStorageKey)

    return isThemePreference(value) ? value : "system"
  } catch {
    return "system"
  }
}

function writeThemePreferenceToStorage(
  preference: ThemePreference,
  storage: Pick<Storage, "removeItem" | "setItem">
) {
  try {
    if (preference === "system") {
      storage.removeItem(themeStorageKey)

      return
    }

    storage.setItem(themeStorageKey, preference)
  } catch {
    return
  }
}

export function resolveThemePreference(
  preference: ThemePreference,
  systemPrefersDark: boolean
): EffectiveTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light"
  }

  return preference
}

export function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system"
  }

  return readThemePreferenceFromStorage(window.localStorage)
}

export function getEffectiveTheme(): EffectiveTheme {
  if (typeof window === "undefined") {
    return "light"
  }

  return resolveThemePreference(
    readThemePreferenceFromStorage(window.localStorage),
    window.matchMedia(darkModeMediaQuery).matches
  )
}

export function applyTheme(theme: EffectiveTheme, root: Element = document.documentElement) {
  root.classList.toggle(darkClassName, theme === "dark")
}

export function setThemePreference(preference: ThemePreference) {
  if (typeof window === "undefined") {
    return
  }

  writeThemePreferenceToStorage(preference, window.localStorage)
  applyTheme(
    resolveThemePreference(preference, window.matchMedia(darkModeMediaQuery).matches)
  )
  window.dispatchEvent(new Event(themeChangeEventName))
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const mediaQueryList = window.matchMedia(darkModeMediaQuery)
  const notify = () => {
    onStoreChange()
  }

  window.addEventListener(themeChangeEventName, notify)
  window.addEventListener("storage", notify)
  mediaQueryList.addEventListener("change", notify)

  return () => {
    window.removeEventListener(themeChangeEventName, notify)
    window.removeEventListener("storage", notify)
    mediaQueryList.removeEventListener("change", notify)
  }
}

function getServerSnapshot(): EffectiveTheme {
  return "light"
}

export function useEffectiveTheme() {
  return useSyncExternalStore(
    subscribeToThemeChanges,
    getEffectiveTheme,
    getServerSnapshot
  )
}

export const themeBootScript = `
(() => {
  const storageKey = ${JSON.stringify(themeStorageKey)};
  const darkClassName = ${JSON.stringify(darkClassName)};
  const mediaQuery = ${JSON.stringify(darkModeMediaQuery)};
  let preference = "system";

  try {
    const stored = window.localStorage.getItem(storageKey);

    if (stored === "system" || stored === "light" || stored === "dark") {
      preference = stored;
    }
  } catch {}

  const systemPrefersDark = window.matchMedia(mediaQuery).matches;
  const theme = preference === "system"
    ? (systemPrefersDark ? "dark" : "light")
    : preference;

  document.documentElement.classList.toggle(darkClassName, theme === "dark");
})();
`
