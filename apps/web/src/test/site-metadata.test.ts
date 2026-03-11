import { createPageMeta, siteMetadata } from "@/lib/site-metadata"

describe("createPageMeta", () => {
  test("includes absolute og and twitter image metadata", () => {
    const meta = createPageMeta({
      title: "Hello",
      description: "World",
      path: "/blogs/hello",
    })

    expect(meta).toContainEqual({
      property: "og:image",
      content: "https://makarima.dev/og.png",
    })
    expect(meta).toContainEqual({
      name: "twitter:image",
      content: "https://makarima.dev/og.png",
    })
    expect(meta).toContainEqual({
      property: "og:url",
      content: "https://makarima.dev/blogs/hello",
    })
  })

  test("stores theme color for browser ui metadata", () => {
    expect(siteMetadata.themeColor).toBe("#141111")
  })
})
