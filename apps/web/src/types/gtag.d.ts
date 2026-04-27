export {}

declare global {
  interface Window {
    gtag: (...args: Array<unknown>) => void
  }
}