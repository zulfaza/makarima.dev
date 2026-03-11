import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    viteReact(),
  ],
  test: {
    css: true,
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
})
