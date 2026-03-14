import { ExternalLink } from "lucide-react"
import { createFileRoute, Link } from "@tanstack/react-router"

import { FooterSnakeGame } from "@/components/footer-snake-game"
import { ProjectStatusBadge } from "@/components/project-status-badge"
import { ProjectTitle } from "@/components/project-title"
import {
  SiteFrame,
  siteBadgeClassName,
  siteMetaClassName,
} from "@/components/site-frame"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { formatBlogDate, loadBlogs, loadProjects } from "@/content/site"
import type { BlogEntry, ProjectEntry } from "@/content/site"
import {
  createPageHead,
  createPersonJsonLd,
  createWebsiteJsonLd,
} from "@/lib/site-metadata"

export const Route = createFileRoute("/")({
  loader: async () => {
    const [blogs, projects] = await Promise.all([loadBlogs(), loadProjects()])
    return { blogs, projects }
  },
  head: () =>
    createPageHead({
      title: "Notes, projects, and experiments",
      description:
        "Notes, projects, and experiments by Zul Faza Makarima, kept close to the codebase.",
      keywords: ["engineering notes", "software projects", "portfolio"],
      path: "/",
      jsonLd: [createWebsiteJsonLd(), createPersonJsonLd()],
    }),
  component: HomePageRoute,
})

const sectionLinkClassName =
  "border-b border-transparent pb-1 text-sm text-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:border-foreground focus-visible:outline-none"
const sectionClassName = "px-5 py-6 sm:px-8"
const sectionHeadingClassName = "text-base font-medium text-foreground"
const sectionListClassName = "divide-y divide-border/80 border-y border-border/80"
const projectSectionListClassName = "divide-y divide-border/80 border-t border-border/80"

function getSectionClassName(className?: string) {
  return className === undefined
    ? sectionClassName
    : `${sectionClassName} ${className}`
}

type HomePageProps = {
  blogs: ReadonlyArray<BlogEntry>
  projects: ReadonlyArray<ProjectEntry>
}

function HomePageRoute() {
  const { blogs, projects } = Route.useLoaderData()
  return <HomePage blogs={blogs} projects={projects} />
}

export function HomePage({ blogs, projects }: HomePageProps) {
  const hasBlogs = blogs.length > 0
  const hasProjects = projects.length > 0
  const showEmptyState = !hasBlogs && !hasProjects
  const showSectionNavigation = hasBlogs || hasProjects
  const showTwoColumnLayout = hasBlogs && hasProjects

  return (
    <SiteFrame footerAddon={<FooterSnakeGame />}>
      <header className="border-b border-border/80">
        <div className="grid gap-6 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-3">
            <h1 className="max-w-2xl text-2xl leading-tight font-medium text-foreground sm:text-3xl">
              makarima.dev
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Notes, projects, and experiments by Zul Faza Makarima, kept close
              to the codebase.
            </p>
          </div>
          {showSectionNavigation ? (
            <nav
              aria-label="Section navigation"
              className="flex flex-wrap gap-4"
            >
              {hasBlogs ? (
                <Link className={sectionLinkClassName} to="/" hash="blogs">
                  Blogs
                </Link>
              ) : null}
              {hasProjects ? (
                <Link className={sectionLinkClassName} to="/" hash="projects">
                  Projects
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </header>

      {showEmptyState ? (
        <HomeEmptyState />
      ) : (
        <div
          className={`flex-1 border-t border-border/80 ${
            showTwoColumnLayout ? "grid lg:grid-cols-2" : ""
          }`}
        >
          {hasBlogs ? (
            <BlogSection
              blogs={blogs}
              className={
                hasProjects ? "lg:border-r lg:border-border/80" : undefined
              }
            />
          ) : null}
          {hasProjects ? <ProjectsSection projects={projects} /> : null}
        </div>
      )}
    </SiteFrame>
  )
}

function HomeEmptyState() {
  return (
    <section
      className={`${sectionClassName} flex flex-1 border-t border-border/80`}
    >
      <div className="max-w-2xl space-y-4">
        <h2 className="text-2xl leading-tight font-medium text-foreground sm:text-3xl">
          Nothing published yet
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          Blog posts and projects will appear here once they are ready.
        </p>
      </div>
    </section>
  )
}

function BlogSection({ blogs, className }: { blogs: ReadonlyArray<BlogEntry>; className?: string }) {
  return (
    <section aria-labelledby="blogs" className={getSectionClassName(className)}>
      <div className="space-y-5">
        <h2 id="blogs" className={sectionHeadingClassName}>
          Blogs
        </h2>
        <ol className={sectionListClassName}>
          {blogs.map((entry) => (
            <li
              key={entry.slug}
              className="grid gap-3 py-4 sm:grid-cols-[8rem_minmax(0,1fr)]"
            >
              <div className={siteMetaClassName}>
                {formatBlogDate(entry.publishedAt)}
              </div>
              <article className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">
                  <Link
                    className="transition-colors hover:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    to="/blogs/$slug"
                    params={{
                      slug: entry.slug,
                    }}
                  >
                    {entry.title}
                  </Link>
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-foreground/88">
                  {entry.summary}
                </p>
                <ul
                  aria-label={`${entry.title} tags`}
                  className="flex flex-wrap gap-2"
                >
                  {entry.tags.map((tag) => (
                    <li key={tag}>
                      <Badge
                        variant="outline"
                        className={siteBadgeClassName}
                      >
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function ProjectsSection({ projects }: { projects: ReadonlyArray<ProjectEntry> }) {
  return (
    <section aria-labelledby="projects" className={sectionClassName}>
      <div className="space-y-5">
        <h2 id="projects" className={sectionHeadingClassName}>
          Projects
        </h2>
        <ol className={projectSectionListClassName}>
          {projects.map((project) => (
            <li key={project.slug} className="grid gap-3 py-4">
              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <article className="space-y-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <ProjectTitle faviconHref={project.faviconHref}>
                      <h3 className="text-sm font-medium text-foreground">
                        <Link
                          className="transition-colors hover:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                          to="/projects/$slug"
                          params={{
                            slug: project.slug,
                          }}
                        >
                          {project.name}
                        </Link>
                      </h3>
                    </ProjectTitle>
                    <span className={siteMetaClassName}>{project.year}</span>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-foreground/88">
                    {project.summary}
                  </p>
                  <ul
                    aria-label={`${project.name} stack`}
                    className="flex flex-wrap gap-2"
                  >
                    {project.stack.map((item) => (
                      <li key={item}>
                        <Badge
                          variant="outline"
                          className={siteBadgeClassName}
                        >
                          {item}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </article>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:pt-px">
                  <ProjectStatusBadge
                    className={siteBadgeClassName}
                    status={project.status}
                  />
                  {project.access.kind === "external" ? (
                    <a
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                      href={project.access.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {project.access.label}
                      <ExternalLink />
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
