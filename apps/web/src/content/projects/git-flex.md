---
name: GitFlex
summary: A web app for reshaping GitHub contribution calendars with custom layouts, themes, and exportable output.
year: 2025
stack:
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
  - TanStack Query
  - Zustand
status: active
accessHref: https://gitflex.xyz/
accessLabel: Open project
faviconHref: /images/git-flex/favicon.ico
---

GitFlex started from a simple frustration: GitHub contribution graphs are useful, but the default presentation is rigid and not especially friendly for portfolios or personal sites. This project turns that graph into something you can restyle, resize, and export without recreating it by hand.

![GitFlex landing page with a large contribution preview and profile URL input](/images/git-flex/landing-page.png "The landing page keeps the first action simple: paste a profile URL and start customizing.")

The app fetches contribution data for a GitHub user, keeps customization state in a small store, and updates the preview in real time as colors, square size, border radius, and layout options change. The interaction stays lightweight, but there is enough control to move beyond the standard green grid.

![GitFlex user page showing customized contribution colors and layout controls](/images/git-flex/username-page.png "The user view focuses on live preview, color controls, and export-ready output.")

I built it with Next.js, React, TanStack Query, and Zustand, then added SVG and PNG export so the customized result can leave the app and be reused elsewhere. That export path matters because the main value is not just viewing the calendar, but producing an asset that fits a README, portfolio, or presentation.

The project is a focused utility rather than a large platform. Its value is in making a familiar GitHub artifact more flexible, more presentable, and easier to adapt to different visual systems without touching design tools first.
