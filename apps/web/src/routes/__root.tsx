import { TanStackDevtools } from "@tanstack/react-devtools"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

import {
  createPageMeta,
  createRootHeadLinks,
  siteMetadata,
} from "@/lib/site-metadata"
import { themeBootScript } from "@/lib/theme"

import appCss from "../styles.css?url"
import geistMonoLatinFont from "@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url"

const googleTagId = "G-TXF9TQ8FWX"
const googleTagScriptSrc = `https://www.googletagmanager.com/gtag/js?id=${googleTagId}`
const googleTagBootScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleTagId}');
`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "theme-color",
        content: siteMetadata.themeColor,
      },
      ...createPageMeta({
        path: "/",
      }),
    ],
    links: createRootHeadLinks({
      appCssHref: appCss,
      fontHref: geistMonoLatinFont,
    }),
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src={googleTagScriptSrc} />
        <script>{googleTagBootScript}</script>
        <script>{themeBootScript}</script>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
