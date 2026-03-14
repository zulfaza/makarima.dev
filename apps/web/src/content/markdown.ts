import { fromMarkdown } from "mdast-util-from-markdown";

import { parseFrontmatter } from "@/content/frontmatter";
import type { BlogEntry, CodeLanguage, ContentBlock, ProjectEntry } from "@/content/site";

type MarkdownRoot = ReturnType<typeof fromMarkdown>;
type MarkdownNode = MarkdownRoot["children"][number];
type ParagraphNode = Extract<MarkdownNode, { readonly type: "paragraph" }>;
type ParagraphChildNode = ParagraphNode["children"][number];
type ImageNode = Extract<ParagraphChildNode, { readonly type: "image" }>;
type CodeNode = Extract<MarkdownNode, { readonly type: "code" }>;
type BlockMeta = {
  readonly title?: string;
  readonly caption?: string;
};

type ParsedBlogFrontmatter = Omit<BlogEntry, "body" | "slug">;
type ParsedProjectFrontmatter = Omit<ProjectEntry, "body" | "slug">;

const supportedCodeLanguages = ["bash", "json", "ts", "tsx"] as const;

function fail(context: string, message: string): never {
  throw new Error(`[content:${context}] ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStringField(data: Record<string, unknown>, field: string, context: string) {
  const value = data[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    fail(context, `Expected "${field}" to be a non-empty string`);
  }

  return value;
}

function readOptionalStringField(data: Record<string, unknown>, field: string, context: string) {
  const value = data[field];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    fail(context, `Expected "${field}" to be a non-empty string when provided`);
  }

  return value;
}

function readStringArrayField(data: Record<string, unknown>, field: string, context: string) {
  const value = data[field];

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    fail(context, `Expected "${field}" to be a string array`);
  }

  return value;
}

function readNumberField(data: Record<string, unknown>, field: string, context: string) {
  const value = data[field];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(context, `Expected "${field}" to be a finite number`);
  }

  return value;
}

function parseHttpUrl(value: string, field: string, context: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    fail(context, `Expected "${field}" to be a valid URL`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    fail(context, `Expected "${field}" to use http or https`);
  }

  return url.toString();
}

function parseProjectFaviconHref(value: string, context: string) {
  if (value.startsWith("//")) {
    fail(context, 'Expected "faviconHref" to be a root-relative path or http/https URL');
  }

  if (value.startsWith("/")) {
    return value;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)) {
    try {
      return parseHttpUrl(value, "faviconHref", context);
    } catch {
      fail(context, 'Expected "faviconHref" to be a root-relative path or http/https URL');
    }
  }

  fail(context, 'Expected "faviconHref" to be a root-relative path or http/https URL');
}

function readPublishedAt(data: Record<string, unknown>, context: string): BlogEntry["publishedAt"] {
  const rawValue = data.publishedAt;

  if (typeof rawValue !== "string") {
    fail(context, 'Expected "publishedAt" to be a non-empty string');
  }

  const value = rawValue.trim();

  if (value.length === 0) {
    fail(context, 'Expected "publishedAt" to be a non-empty string');
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    fail(context, 'Expected "publishedAt" to use YYYY-MM-DD');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    fail(context, 'Expected "publishedAt" to be a valid calendar date');
  }

  return value;
}

function readProjectStatus(data: Record<string, unknown>, context: string): ProjectEntry["status"] {
  const value = readStringField(data, "status", context);

  switch (value) {
    case "active":
    case "archived":
    case "draft":
      return value;
    default:
      fail(context, 'Expected "status" to be one of: active, archived, draft');
  }
}

function buildProjectFaviconHref(href: string) {
  const origin = new URL(href).origin;
  const searchParams = new URLSearchParams({
    domain_url: origin,
    sz: "64",
  });

  return `https://www.google.com/s2/favicons?${searchParams.toString()}`;
}

function parseBlogFrontmatter(source: string, context: string): ParsedBlogFrontmatter {
  const data: unknown = parseFrontmatter(source, context).data;

  if (!isRecord(data)) {
    fail(context, "Expected frontmatter object");
  }

  return {
    title: readStringField(data, "title", context),
    summary: readStringField(data, "summary", context),
    publishedAt: readPublishedAt(data, context),
    tags: readStringArrayField(data, "tags", context),
  };
}

function parseProjectFrontmatter(source: string, context: string): ParsedProjectFrontmatter {
  const data: unknown = parseFrontmatter(source, context).data;

  if (!isRecord(data)) {
    fail(context, "Expected frontmatter object");
  }

  const accessHref = readOptionalStringField(data, "accessHref", context);
  const accessLabel = readOptionalStringField(data, "accessLabel", context);
  const faviconHref = readOptionalStringField(data, "faviconHref", context);

  let access: ProjectEntry["access"];

  if (accessHref === undefined) {
    if (accessLabel !== undefined) {
      fail(context, 'Expected "accessLabel" only when "accessHref" is provided');
    }

    access = { kind: "none" };
  } else {
    access = {
      kind: "external",
      href: parseHttpUrl(accessHref, "accessHref", context),
      label: accessLabel ?? "Open project",
    };
  }

  return {
    faviconHref:
      faviconHref !== undefined
        ? parseProjectFaviconHref(faviconHref, context)
        : access.kind === "external"
          ? buildProjectFaviconHref(access.href)
          : undefined,
    name: readStringField(data, "name", context),
    summary: readStringField(data, "summary", context),
    year: readNumberField(data, "year", context),
    stack: readStringArrayField(data, "stack", context),
    status: readProjectStatus(data, context),
    access,
  };
}

function collapseMarkdownParagraph(text: string) {
  return text
    .split("\n")
    .map((segment) => segment.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCodeLanguage(language: string | null | undefined, context: string): CodeLanguage {
  if (language === null || language === undefined) {
    fail(context, "Code blocks must declare a supported language");
  }

  for (const supportedLanguage of supportedCodeLanguages) {
    if (language === supportedLanguage) {
      return supportedLanguage;
    }
  }

  fail(
    context,
    `Unsupported code language "${language}". Supported: ${supportedCodeLanguages.join(", ")}`,
  );
}

function parseCodeMeta(meta: string | null | undefined, context: string): BlockMeta {
  if (meta === null || meta === undefined || meta.trim().length === 0) {
    return {};
  }

  let title: string | undefined;
  let caption: string | undefined;
  let remaining = meta.trim();

  while (remaining.length > 0) {
    const match = /^(title|caption)="([^"]*)"(?:\s+|$)/.exec(remaining);

    if (!match) {
      fail(context, 'Invalid code meta. Use title="..." and/or caption="..."');
    }

    const key = match[1];
    const value = match[2];

    if (key === "title") {
      if (title !== undefined) {
        fail(context, 'Duplicate code meta key "title"');
      }

      title = value;
    } else {
      if (caption !== undefined) {
        fail(context, 'Duplicate code meta key "caption"');
      }

      caption = value;
    }

    remaining = remaining.slice(match[0].length).trimStart();
  }

  return {
    caption,
    title,
  };
}

function lineSuffix(node: { readonly position?: { readonly start?: { readonly line?: number } } }) {
  const line = node.position?.start?.line;

  return typeof line === "number" ? `:line ${line}` : "";
}

function parseImageBlock(node: ImageNode): Extract<ContentBlock, { readonly kind: "image" }> {
  return {
    kind: "image",
    src: node.url,
    alt: node.alt ?? "",
    caption: node.title === null ? undefined : node.title,
  };
}

function parseParagraphBlock(
  node: ParagraphNode,
  context: string,
): Extract<ContentBlock, { readonly kind: "image" | "paragraph" }> {
  if (node.children.length === 1 && node.children[0]?.type === "image") {
    return parseImageBlock(node.children[0]);
  }

  const contentParts: Array<string> = [];

  for (const child of node.children) {
    if (child.type !== "text") {
      fail(
        `${context}${lineSuffix(child)}`,
        `Unsupported inline markdown node "${child.type}" inside paragraph`,
      );
    }

    contentParts.push(child.value);
  }

  const content = collapseMarkdownParagraph(contentParts.join(""));

  if (content.length === 0) {
    fail(`${context}${lineSuffix(node)}`, "Paragraph content cannot be empty");
  }

  return {
    kind: "paragraph",
    content,
  };
}

function parseCodeBlock(
  node: CodeNode,
  context: string,
): Extract<ContentBlock, { readonly kind: "code" }> {
  const nextContext = `${context}${lineSuffix(node)}`;

  return {
    kind: "code",
    language: parseCodeLanguage(node.lang, nextContext),
    code: node.value,
    ...parseCodeMeta(node.meta, nextContext),
  };
}

function parseMermaidBlock(
  node: CodeNode,
  context: string,
): Extract<ContentBlock, { readonly kind: "mermaid" }> {
  const nextContext = `${context}${lineSuffix(node)}`;

  return {
    kind: "mermaid",
    code: node.value,
    ...parseCodeMeta(node.meta, nextContext),
  };
}

export function parseMarkdownBody(source: string, context: string): ReadonlyArray<ContentBlock> {
  const parsed = parseFrontmatter(source, context);
  const content = parsed.content.startsWith("\n") ? parsed.content.slice(1) : parsed.content;
  const tree = fromMarkdown(content);
  const blocks: Array<ContentBlock> = [];

  for (const child of tree.children) {
    switch (child.type) {
      case "paragraph":
        blocks.push(parseParagraphBlock(child, context));
        break;
      case "code":
        blocks.push(
          child.lang === "mermaid"
            ? parseMermaidBlock(child, context)
            : parseCodeBlock(child, context),
        );
        break;
      default:
        fail(`${context}${lineSuffix(child)}`, `Unsupported markdown node "${child.type}"`);
    }
  }

  return blocks;
}

export function parseBlogMarkdown(slug: string, source: string): BlogEntry {
  const context = `blog:${slug}`;

  return {
    slug,
    ...parseBlogFrontmatter(source, context),
    body: parseMarkdownBody(source, context),
  };
}

export function parseProjectMarkdown(slug: string, source: string): ProjectEntry {
  const context = `project:${slug}`;

  return {
    slug,
    ...parseProjectFrontmatter(source, context),
    body: parseMarkdownBody(source, context),
  };
}
