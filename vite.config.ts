import { cloudflare } from "@cloudflare/vite-plugin"
import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import viteTsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
