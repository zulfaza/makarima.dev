import { parseBlogMarkdown, parseProjectMarkdown } from "@/content/markdown";

const blogDateFormatter = new Intl.DateTimeFormat("en", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export type BlogEntry = {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly publishedAt: string;
  readonly tags: ReadonlyArray<string>;
  readonly body: ReadonlyArray<ContentBlock>;
};

export type ProjectStatus = "active" | "archived" | "draft";

export type ProjectAccess =
  | {
      readonly kind: "none";
    }
  | {
      readonly kind: "external";
      readonly href: string;
      readonly label: string;
    };

export type ProjectEntry = {
  readonly slug: string;
  readonly name: string;
  readonly faviconHref?: string;
  readonly summary: string;
  readonly year: number;
  readonly stack: ReadonlyArray<string>;
  readonly status: ProjectStatus;
  readonly access: ProjectAccess;
  readonly body: ReadonlyArray<ContentBlock>;
};

export type CodeLanguage = "bash" | "json" | "ts" | "tsx";

export type ContentBlock =
  | {
      readonly kind: "paragraph";
      readonly content: string;
    }
  | {
      readonly kind: "image";
      readonly src: string;
      readonly alt: string;
      readonly caption?: string;
    }
  | {
      readonly kind: "code";
      readonly language: CodeLanguage;
      readonly code: string;
      readonly title?: string;
      readonly caption?: string;
    }
  | {
      readonly kind: "mermaid";
      readonly code: string;
      readonly title?: string;
      readonly caption?: string;
    };

type BaseSocialLink = {
  readonly label: string;
  readonly href: string;
};

export type SocialLink =
  | ({ readonly kind: "github" } & BaseSocialLink)
  | ({ readonly kind: "linkedin" } & BaseSocialLink);

function fail(message: string): never {
  throw new Error(`[content] ${message}`);
}

function readSlug(path: string, collection: "blogs" | "projects") {
  const pattern = new RegExp(`^\\./${collection}/([^/]+)\\.md$`);
  const match = pattern.exec(path);

  if (!match) {
    fail(`Unexpected ${collection} content path: ${path}`);
  }

  return match[1];
}

function compareBlogs(left: BlogEntry, right: BlogEntry) {
  const publishedAtDiff = Date.parse(right.publishedAt) - Date.parse(left.publishedAt);

  if (publishedAtDiff !== 0) {
    return publishedAtDiff;
  }

  return left.slug.localeCompare(right.slug);
}

function projectStatusRank(status: ProjectStatus) {
  switch (status) {
    case "active":
      return 0;
    case "draft":
      return 1;
    case "archived":
      return 2;
  }
}

function compareProjects(left: ProjectEntry, right: ProjectEntry) {
  const statusDiff = projectStatusRank(left.status) - projectStatusRank(right.status);

  if (statusDiff !== 0) {
    return statusDiff;
  }

  const yearDiff = right.year - left.year;

  if (yearDiff !== 0) {
    return yearDiff;
  }

  return left.slug.localeCompare(right.slug);
}

export function loadBlogs() {
  const blogModules = import.meta.glob<string>("./blogs/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  });

  return Object.entries(blogModules)
    .map(([path, source]) => parseBlogMarkdown(readSlug(path, "blogs"), source))
    .sort(compareBlogs);
}

export function loadProjects() {
  const projectModules = import.meta.glob<string>("./projects/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  });

  return Object.entries(projectModules)
    .map(([path, source]) => parseProjectMarkdown(readSlug(path, "projects"), source))
    .sort(compareProjects);
}

export function findBlogBySlug(slug: string) {
  return loadBlogs().find((entry) => entry.slug === slug);
}

export function findProjectBySlug(slug: string) {
  return loadProjects().find((project) => project.slug === slug);
}

export const socials: ReadonlyArray<SocialLink> = [
  {
    kind: "github",
    label: "GitHub",
    href: "https://github.com/zulfaza",
  },
  {
    kind: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/zul-faza-makarima/",
  },
] as const;

export function formatBlogDate(publishedAt: BlogEntry["publishedAt"]) {
  return blogDateFormatter.format(new Date(publishedAt));
}

export function formatProjectStatus(status: ProjectStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "archived":
      return "Archived";
    case "draft":
      return "Draft";
  }
}
