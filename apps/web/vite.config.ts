import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

import { getSitemapPages, sitemapHost } from "./src/lib/sitemap-pages";

const config = defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    devtools({
      editor: {
        name: "Zed",
        open: async (filePath, lineNumber, columnNumber) => {
          const { exec } = await import("node:child_process");
          const path = await import("node:path");
          exec(
            `zed "${path.normalize(filePath)}${lineNumber ? `:${lineNumber}` : ""}${columnNumber ? `:${columnNumber}` : ""}"`,
          );
        },
      },
    }),
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
});

export default config;
