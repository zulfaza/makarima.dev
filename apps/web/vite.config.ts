import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

import { getSitemapPages, sitemapHost } from "./src/lib/sitemap-pages";

/**
 * Strips empty source map comments from node_modules to suppress browser
 * console warnings like "No sources are declared in this source map".
 * Some packages (e.g. @tanstack/*) ship source maps with `sources: []`.
 */
const stripEmptySourcemaps = (): Plugin => ({
  name: "strip-empty-sourcemaps",
  enforce: "post",
  transform(code, id) {
    if (!id.includes("node_modules")) return null;
    const mapMatch = code.match(
      /\n\/\/# sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)\s*$/,
    );
    if (!mapMatch) return null;
    try {
      const map = JSON.parse(Buffer.from(mapMatch[1], "base64").toString("utf8"));
      if (Array.isArray(map.sources) && map.sources.length === 0) {
        return code.slice(0, mapMatch.index);
      }
    } catch {
      // ignore malformed source map
    }
    return null;
  },
});

const config = defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    stripEmptySourcemaps(),
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
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        failOnError: true,
      },
      sitemap: {
        host: sitemapHost,
      },
    }),
    viteReact(),
  ],
});

export default config;
