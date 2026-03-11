import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import viteTsConfigPaths from "vite-tsconfig-paths"

import { getSitemapPages, sitemapHost } from "./src/lib/sitemap-pages"

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
    tanstackStart({
      pages: getSitemapPages(),
      sitemap: {
        host: sitemapHost,
      },
    }),
    viteReact(),
  ],
})

export default config
