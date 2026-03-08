import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

import { darkModeMediaQuery } from "@/lib/theme"

let systemPrefersDark = false
let clipboardText = ""
const mediaQueryListeners = new Set<EventListenerOrEventListenerObject>()
type LegacyMediaQueryListener = (
  this: MediaQueryList,
  event: MediaQueryListEvent
) => unknown
const legacyMediaQueryListeners = new Set<LegacyMediaQueryListener>()

class MatchMediaChangeEvent extends Event implements MediaQueryListEvent {
  readonly matches: boolean
  readonly media: string

  constructor(matches: boolean, media: string) {
    super("change")
    this.matches = matches
    this.media = media
  }
}

function addMediaQueryListener(listener: EventListenerOrEventListenerObject | null) {
  if (listener) {
    mediaQueryListeners.add(listener)
  }
}

function removeMediaQueryListener(listener: EventListenerOrEventListenerObject | null) {
  if (listener) {
    mediaQueryListeners.delete(listener)
  }
}

function addLegacyMediaQueryListener(listener: LegacyMediaQueryListener | null) {
  if (listener) {
    legacyMediaQueryListeners.add(listener)
  }
}

function removeLegacyMediaQueryListener(listener: LegacyMediaQueryListener | null) {
  if (listener) {
    legacyMediaQueryListeners.delete(listener)
  }
}

function createMediaQueryList(query: string): MediaQueryList {
  return {
    get matches() {
      return query === darkModeMediaQuery ? systemPrefersDark : false
    },
    media: query,
    onchange: null,
    addListener(listener: LegacyMediaQueryListener | null) {
      addLegacyMediaQueryListener(listener)
    },
    removeListener(listener: LegacyMediaQueryListener | null) {
      removeLegacyMediaQueryListener(listener)
    },
    addEventListener(
      _type: string,
      listener: EventListenerOrEventListenerObject | null
    ) {
      addMediaQueryListener(listener)
    },
    removeEventListener(
      _type: string,
      listener: EventListenerOrEventListenerObject | null
    ) {
      removeMediaQueryListener(listener)
    },
    dispatchEvent(_event: Event) {
      return true
    },
  }
}

function notifyMediaQueryListeners() {
  const event = new MatchMediaChangeEvent(systemPrefersDark, darkModeMediaQuery)
  const mediaQueryList = window.matchMedia(darkModeMediaQuery)

  for (const listener of mediaQueryListeners) {
    if (typeof listener === "function") {
      listener(event)
      continue
    }

    listener.handleEvent(event)
  }

  for (const listener of legacyMediaQueryListeners) {
    listener.call(mediaQueryList, event)
  }
}

export function setMatchMediaMatches(matches: boolean) {
  systemPrefersDark = matches
  notifyMediaQueryListeners()
}

export function getClipboardText() {
  return clipboardText
}

window.matchMedia = (query: string) => createMediaQueryList(query)

Object.defineProperty(window.navigator, "clipboard", {
  configurable: true,
  value: {
    readText() {
      return Promise.resolve(clipboardText)
    },
    writeText(text: string) {
      clipboardText = text
      return Promise.resolve()
    },
  },
})

afterEach(() => {
  cleanup()
  clipboardText = ""
  window.localStorage.clear()
  document.documentElement.classList.remove("dark")
  setMatchMediaMatches(false)
})
