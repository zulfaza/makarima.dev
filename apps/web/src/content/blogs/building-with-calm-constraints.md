---
title: Building With Calm Constraints
summary: Notes on keeping personal projects small, typed, and easy to edit when momentum is low.
publishedAt: "2026-02-14"
tags:
  - typescript
  - workflow
  - notes
---

Personal projects last longer when the constraints stay visible.

![Editorial layout sketch with cards and code columns](/images/content-preview.svg "A fast sketch helps keep hierarchy obvious before components harden.")

I prefer a small surface area, typed content boundaries, and fewer moving pieces than a polished abstraction that I will have to revisit later.

```tsx title="Content boundary" caption="The route can stay simple once the content shape is explicit."
type ContentBlock =
  | { kind: "paragraph"; content: string }
  | { kind: "image"; src: string; alt: string }
  | { kind: "code"; language: "tsx"; code: string }
```

That usually means writing simple data structures first, then letting the interface grow from the information instead of the other way around.
