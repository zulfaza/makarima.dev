import { load } from "js-yaml"

type ParsedFrontmatter = {
  readonly data: unknown
  readonly content: string
}

function fail(context: string, message: string): never {
  throw new Error(`[frontmatter:${context}] ${message}`)
}

export function parseFrontmatter(source: string, context: string): ParsedFrontmatter {
  if (!source.startsWith("---")) {
    return {
      data: {},
      content: source,
    }
  }

  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)

  if (!match) {
    return {
      data: {},
      content: source,
    }
  }

  const rawData = match[1]
  const rawContent = source.slice(match[0].length)

  let data: unknown

  try {
    data = load(rawData)
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Invalid YAML frontmatter"
    fail(context, message)
  }

  return {
    data: data ?? {},
    content: rawContent,
  }
}
