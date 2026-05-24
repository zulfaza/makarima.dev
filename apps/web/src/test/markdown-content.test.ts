import { loadBlogs, loadProjects } from "@/content/site";
import { parseBlogMarkdown, parseProjectMarkdown } from "@/content/markdown";

describe("content markdown", () => {
  test("treats markdown without frontmatter as missing required frontmatter", () => {
    expect(() =>
      parseBlogMarkdown(
        "no-frontmatter",
        `Paragraph only.
`,
      ),
    ).toThrowError(
      '[content:blog:no-frontmatter] Expected "title" to be a non-empty string',
    );
  });

  test("fails on malformed YAML frontmatter", () => {
    expect(() =>
      parseBlogMarkdown(
        "bad-yaml",
        `---
title: Sample Blog
tags:
  - one
  broken
---

Body.
`,
      ),
    ).toThrowError('[frontmatter:blog:bad-yaml]');
  });

  test("parses frontmatter-only markdown into an empty body", () => {
    const entry = parseBlogMarkdown(
      "frontmatter-only",
      `---
title: Sample Blog
summary: Sample summary
publishedAt: "2026-03-01"
tags:
  - one
---
`,
    );

    expect(entry.body).toEqual([]);
  });

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
          content: [{ kind: "text", value: "Paragraph copy." }],
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
date: "2025-01-01"
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
      date: "2025-01-01",
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
          content: [{ kind: "text", value: "Project paragraph." }],
        },
      ],
    });
  });

  test("prefers explicit project faviconHref over derived favicon", () => {
    const entry = parseProjectMarkdown(
      "sample-project-override",
      `---
name: Sample Project Override
summary: Sample project summary
date: "2025-03-15"
stack:
  - TypeScript
status: active
accessHref: https://example.com/project
faviconHref: /images/sample/favicon.ico
---

Project paragraph.
`,
    );

    expect(entry.faviconHref).toBe("/images/sample/favicon.ico");
  });

  test("parses local project favicon paths", () => {
    const entry = parseProjectMarkdown(
      "sample-project-local-favicon",
      `---
name: Sample Project Local Favicon
summary: Sample project summary
date: "2025-06-20"
stack:
  - TypeScript
status: active
faviconHref: /images/sample/favicon.ico
---

Project paragraph.
`,
    );

    expect(entry.faviconHref).toBe("/images/sample/favicon.ico");
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
date: "2026-01-01"
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
date: "2025-12-01"
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

  test("fails on invalid project faviconHref", () => {
    expect(() =>
      parseProjectMarkdown(
        "bad-favicon-href",
        `---
name: Bad Favicon
summary: Invalid favicon URL
date: "2025-08-15"
stack:
  - TypeScript
status: active
faviconHref: ftp://example.com/favicon.ico
---

Body.
`,
      ),
    ).toThrowError(
      '[content:project:bad-favicon-href] Expected "faviconHref" to be a root-relative path or http/https URL',
    );
  });

  test("fails on non-root-relative project favicon paths", () => {
    expect(() =>
      parseProjectMarkdown(
        "bad-favicon-path",
        `---
name: Bad Favicon Path
summary: Invalid favicon path
date: "2025-04-10"
stack:
  - TypeScript
status: active
faviconHref: images/sample/favicon.ico
---

Body.
`,
      ),
    ).toThrowError(
      '[content:project:bad-favicon-path] Expected "faviconHref" to be a root-relative path or http/https URL',
    );
  });

  test("parses heading blocks with segments", () => {
    const entry = parseBlogMarkdown(
      "heading-node",
      `---
title: Heading Node
summary: Heading node
publishedAt: "2026-03-01"
tags:
  - one
---

# Heading 1

## Heading 2
`,
    );

    expect(entry.body).toEqual([
      {
        kind: "heading",
        level: 1,
        content: [{ kind: "text", value: "Heading 1" }],
      },
      {
        kind: "heading",
        level: 2,
        content: [{ kind: "text", value: "Heading 2" }],
      },
    ]);
  });

  test("parses inline code in paragraphs and headings", () => {
    const entry = parseBlogMarkdown(
      "inline-code",
      `---
title: Inline Code
summary: Inline code test
publishedAt: "2026-03-01"
tags:
  - one
---

## The \`score\` formula

The score is computed as \`score = 0.45 * co_occurrence + 0.25 * customer_history\`.
`,
    );

    expect(entry.body).toEqual([
      {
        kind: "heading",
        level: 2,
        content: [
          { kind: "text", value: "The " },
          { kind: "inlineCode", value: "score" },
          { kind: "text", value: " formula" },
        ],
      },
      {
        kind: "paragraph",
        content: [
          { kind: "text", value: "The score is computed as " },
          {
            kind: "inlineCode",
            value: "score = 0.45 * co_occurrence + 0.25 * customer_history",
          },
          { kind: "text", value: "." },
        ],
      },
    ]);
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

> A blockquote
`,
      ),
    ).toThrowError('[content:blog:bad-node:line 1] Unsupported markdown node "blockquote"');
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
      '[content:blog:bad-inline:line 1] Unsupported inline markdown node "link"',
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
      '[content:blog:bad-meta:line 1] Invalid code meta. Use title="...", caption="...", and/or scale="..."',
    );
  });

  test("loads deterministic project order from markdown", () => {
    expect(loadBlogs()).toEqual([]);
    expect(loadProjects().map((entry) => entry.slug)).toEqual([
      "ai-meeting-notes-poc-py",
      "recommendation-system",
      "jwt-debugger",
      "git-flex",
    ]);
  });
});
