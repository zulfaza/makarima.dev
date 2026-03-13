import { loadBlogs, loadProjects } from "@/content/site";
import { parseBlogMarkdown, parseProjectMarkdown } from "@/content/markdown";

describe("content markdown", () => {
  test("parses a blog entry into the public route shape", () => {
    const entry = parseBlogMarkdown(
      "sample-blog",
      `---
title: Sample Blog
summary: Sample summary
publishedAt: "2026-03-01"
tags:
  - one
  - two
---

Paragraph copy.

![Sample alt](/images/sample.svg "Sample caption")

\`\`\`ts title="Sample code" caption="Sample caption"
const sample = true
\`\`\`

\`\`\`mermaid title="Sample flow" caption="Sample diagram"
flowchart TD
  A[Start] --> B[Done]
\`\`\`
`,
    );

    expect(entry).toEqual({
      slug: "sample-blog",
      title: "Sample Blog",
      summary: "Sample summary",
      publishedAt: "2026-03-01",
      tags: ["one", "two"],
      body: [
        {
          kind: "paragraph",
          content: "Paragraph copy.",
        },
        {
          kind: "image",
          src: "/images/sample.svg",
          alt: "Sample alt",
          caption: "Sample caption",
        },
        {
          kind: "code",
          language: "ts",
          code: "const sample = true",
          title: "Sample code",
          caption: "Sample caption",
        },
        {
          kind: "mermaid",
          code: "flowchart TD\n  A[Start] --> B[Done]",
          title: "Sample flow",
          caption: "Sample diagram",
        },
      ],
    });
  });

  test("parses a project entry into the public route shape", () => {
    const entry = parseProjectMarkdown(
      "sample-project",
      `---
name: Sample Project
summary: Sample project summary
year: 2025
stack:
  - TypeScript
  - Vitest
status: active
accessHref: https://example.com/project
accessLabel: Open project
---

Project paragraph.
`,
    );

    expect(entry).toEqual({
      slug: "sample-project",
      name: "Sample Project",
      faviconHref:
        "https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fexample.com&sz=64",
      summary: "Sample project summary",
      year: 2025,
      stack: ["TypeScript", "Vitest"],
      status: "active",
      access: {
        kind: "external",
        href: "https://example.com/project",
        label: "Open project",
      },
      body: [
        {
          kind: "paragraph",
          content: "Project paragraph.",
        },
      ],
    });
  });

  test("fails on missing required frontmatter", () => {
    expect(() =>
      parseBlogMarkdown(
        "missing-title",
        `---
summary: Missing title
publishedAt: "2026-03-01"
tags:
  - one
---

Body.
`,
      ),
    ).toThrowError('[content:blog:missing-title] Expected "title" to be a non-empty string');
  });

  test("fails on invalid blog dates", () => {
    expect(() =>
      parseBlogMarkdown(
        "bad-date",
        `---
title: Bad Date
summary: Invalid date
publishedAt: "2026-02-31"
tags:
  - one
---

Body.
`,
      ),
    ).toThrowError('[content:blog:bad-date] Expected "publishedAt" to be a valid calendar date');
  });

  test("fails on invalid project status", () => {
    expect(() =>
      parseProjectMarkdown(
        "bad-status",
        `---
name: Bad Status
summary: Invalid status
year: 2026
stack:
  - TypeScript
status: live
---

Body.
`,
      ),
    ).toThrowError(
      '[content:project:bad-status] Expected "status" to be one of: active, archived, draft',
    );
  });

  test("defaults project access to none when omitted", () => {
    const entry = parseProjectMarkdown(
      "project-without-access",
      `---
name: No Access
summary: No access link
year: 2025
stack:
  - TypeScript
status: active
---

Body.
`,
    );

    expect(entry.access).toEqual({ kind: "none" });
    expect(entry.faviconHref).toBeUndefined();
  });

  test("fails on unsupported markdown nodes", () => {
    expect(() =>
      parseBlogMarkdown(
        "bad-node",
        `---
title: Bad Node
summary: Unsupported node
publishedAt: "2026-03-01"
tags:
  - one
---

# Heading
`,
      ),
    ).toThrowError('[content:blog:bad-node:line 1] Unsupported markdown node "heading"');
  });

  test("fails on unsupported inline markdown", () => {
    expect(() =>
      parseBlogMarkdown(
        "bad-inline",
        `---
title: Bad Inline
summary: Unsupported inline node
publishedAt: "2026-03-01"
tags:
  - one
---

Plain with [link](/docs).
`,
      ),
    ).toThrowError(
      '[content:blog:bad-inline:line 1] Unsupported inline markdown node "link" inside paragraph',
    );
  });

  test("fails on invalid code meta", () => {
    expect(() =>
      parseBlogMarkdown(
        "bad-meta",
        `---
title: Bad Meta
summary: Invalid code meta
publishedAt: "2026-03-01"
tags:
  - one
---

\`\`\`ts label="oops"
const value = true
\`\`\`
`,
      ),
    ).toThrowError(
      '[content:blog:bad-meta:line 1] Invalid code meta. Use title="..." and/or caption="..."',
    );
  });

  test("loads deterministic project order from markdown", () => {
    expect(loadBlogs()).toEqual([]);
    expect(loadProjects().map((entry) => entry.slug)).toEqual([
      "ai-meeting-notes-poc-py",
      "git-flex",
      "jwt-debugger",
    ]);
  });
});
