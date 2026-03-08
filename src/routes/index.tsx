import { createFileRoute, Link } from "@tanstack/react-router"

import {
  blogs,
  formatBlogDate,
  formatProjectStatus,
  projects,
} from "@/content/site"
import { SiteFrame, siteMetaClassName } from "@/components/site-frame"

export const Route = createFileRoute("/")({ component: HomePage })

const sectionLinkClassName =
  "border-b border-transparent pb-1 text-sm text-foreground transition-colors hover:border-foreground/40 hover:text-foreground focus-visible:border-foreground focus-visible:outline-none"

export function HomePage() {
  return (
    <SiteFrame>
      <header className="border-b border-border/80">
        <div className="grid gap-6 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-3">
            <h1 className="max-w-2xl text-2xl leading-tight font-medium text-foreground sm:text-3xl">
              makarima.dev
            </h1>
          </div>
          <nav aria-label="Section navigation" className="flex flex-wrap gap-4">
            <a className={sectionLinkClassName} href="#blogs">
              Blogs
            </a>
            <a className={sectionLinkClassName} href="#projects">
              Projects
            </a>
          </nav>
        </div>
      </header>

      <div className="grid flex-1 border-t border-border/80 lg:grid-cols-2">
        <section
          aria-labelledby="blogs"
          className="px-5 py-6 sm:px-8 lg:border-r lg:border-border/80"
        >
          <div className="space-y-5">
            <h2 id="blogs" className="text-base font-medium text-foreground">
              Blogs
            </h2>
            <ol className="divide-y divide-border/80 border-y border-border/80">
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
                      className="flex flex-wrap gap-x-3 gap-y-1"
                    >
                      {entry.tags.map((tag) => (
                        <li key={tag} className={siteMetaClassName}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="projects" className="px-5 py-6 sm:px-8">
          <div className="space-y-5">
            <h2 id="projects" className="text-base font-medium text-foreground">
              Projects
            </h2>
            <ol className="divide-y divide-border/80 border-y border-border/80">
              {projects.map((project) => (
                <li key={project.slug} className="grid gap-3 py-4">
                  <article className="space-y-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
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
                      <span className={siteMetaClassName}>{project.year}</span>
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-foreground/88">
                      {project.summary}
                    </p>
                  </article>
                  <div className="space-y-2">
                    <p className={siteMetaClassName}>
                      {formatProjectStatus(project.status)}
                    </p>
                    <ul
                      aria-label={`${project.name} stack`}
                      className="flex flex-wrap gap-x-3 gap-y-1"
                    >
                      {project.stack.map((item) => (
                        <li key={item} className={siteMetaClassName}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </SiteFrame>
  )
}
