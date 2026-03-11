---
name: makarima.dev
summary: Personal site shell for writing, shipping small experiments, and keeping project notes close to code.
year: 2026
stack:
  - TanStack Start
  - React
  - Tailwind CSS
status: active
---

This project is the public index for notes and side work.

![Preview card wall with a highlighted detail panel](/images/content-preview.svg "The detail page now supports visual blocks without changing the route contract.")

The current version keeps everything in typed mock data, but the intended next step is reading local markdown files and mapping them into the same route structure.

```ts title="Project entry" caption="The entry type stays narrow while the renderer handles variants."
export type ProjectEntry = {
  readonly slug: string
  readonly name: string
  readonly body: readonly ContentBlock[]
}
```

The main constraint is to keep the UI direct and editable without introducing CMS overhead.
