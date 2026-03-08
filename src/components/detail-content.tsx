import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import type { CodeLanguage, ContentBlock } from "@/content/site"

type ImageBlock = Extract<ContentBlock, { readonly kind: "image" }>
type CodeBlock = Extract<ContentBlock, { readonly kind: "code" }>

type CodeTokenKind =
  | "plain"
  | "comment"
  | "command"
  | "keyword"
  | "number"
  | "property"
  | "string"
  | "variable"

type CodeToken = {
  readonly kind: CodeTokenKind
  readonly content: string
}

const highlightPatternByLanguage: Record<CodeLanguage, RegExp> = {
  bash: /#[^\n]*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\$[A-Za-z_][\w]*|\b(?:if|then|fi|for|in|do|done|case|esac|function|local|export)\b|--?[A-Za-z][\w-]*|\b\d+(?:\.\d+)?\b/g,
  json: /"(?:\\.|[^"])*"\s*:|"(?:\\.|[^"])*"|\b(?:true|false|null)\b|\b\d+(?:\.\d+)?\b/g,
  ts: /\/\/[^\n]*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\b(?:const|export|function|if|import|readonly|return|switch|type)\b|\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b/g,
  tsx: /\/\/[^\n]*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\b(?:const|export|function|if|import|readonly|return|switch|type)\b|\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b/g,
}

const tokenClassNameByKind: Record<CodeTokenKind, string> = {
  plain: "text-foreground/88",
  comment: "text-muted-foreground italic",
  command: "font-medium text-primary",
  keyword: "font-medium text-primary",
  number: "text-sky-700 dark:text-sky-300",
  property: "text-emerald-700 dark:text-emerald-300",
  string: "text-amber-700 dark:text-amber-300",
  variable: "text-rose-700 dark:text-rose-300",
}

export function DetailContent({ blocks }: { blocks: readonly ContentBlock[] }) {
  const [previewImage, setPreviewImage] = useState<ImageBlock | null>(null)

  useEffect(() => {
    if (!previewImage) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewImage(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [previewImage])

  return (
    <>
      <article className="border-b border-border/80 px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {blocks.map((block, index) => {
            switch (block.kind) {
              case "paragraph":
                return (
                  <p
                    key={`paragraph-${index}`}
                    className="text-sm leading-7 text-foreground/88"
                  >
                    {block.content}
                  </p>
                )
              case "image":
                return (
                  <figure
                    key={`image-${index}`}
                    className="space-y-3 border border-border/80 bg-card/70 p-3"
                  >
                    <button
                      type="button"
                      className="group block w-full overflow-hidden border border-border/70 bg-accent/20 text-left focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                      aria-label={`Preview image: ${block.alt}`}
                      onClick={() => setPreviewImage(block)}
                    >
                      <img
                        alt={block.alt}
                        className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.015]"
                        src={block.src}
                      />
                    </button>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <figcaption className="max-w-2xl text-xs leading-6 text-muted-foreground">
                        {block.caption ?? block.alt}
                      </figcaption>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setPreviewImage(block)}
                      >
                        Preview image
                      </Button>
                    </div>
                  </figure>
                )
              case "code":
                return <CodeSnippet key={`code-${index}`} block={block} />
            }
          })}
        </div>
      </article>

      {previewImage ? (
        <div
          aria-label={previewImage.alt}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/55 p-4 backdrop-blur-sm"
          role="dialog"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="w-full max-w-5xl border border-border/80 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {previewImage.alt}
              </p>
              <Button
                aria-label="Close image preview"
                size="xs"
                variant="outline"
                onClick={() => setPreviewImage(null)}
              >
                Close
              </Button>
            </div>
            <figure className="space-y-3 p-4">
              <img
                alt={previewImage.alt}
                className="max-h-[78vh] w-full border border-border/70 object-contain"
                src={previewImage.src}
              />
              <figcaption className="text-xs leading-6 text-muted-foreground">
                {previewImage.caption ?? previewImage.alt}
              </figcaption>
            </figure>
          </div>
        </div>
      ) : null}
    </>
  )
}

function CodeSnippet({ block }: { block: CodeBlock }) {
  const [copyState, setCopyState] = useState<"copied" | "failed" | "idle">(
    "idle"
  )
  const lines = block.code.split("\n")

  useEffect(() => {
    if (copyState === "idle") {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle")
    }, 2000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [copyState])

  async function handleCopyCode() {
    if (!navigator.clipboard) {
      setCopyState("failed")
      return
    }

    try {
      await navigator.clipboard.writeText(block.code)
      setCopyState("copied")
    } catch {
      setCopyState("failed")
    }
  }

  return (
    <figure className="overflow-hidden border border-border/80 bg-card/80">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-muted/50 px-4 py-3">
        <div className="space-y-1">
          {block.title ? (
            <p className="text-xs font-medium text-foreground">{block.title}</p>
          ) : null}
          {block.caption ? (
            <figcaption className="text-xs leading-5 text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
            {block.language}
          </span>
          <Button
            aria-label={`Copy code: ${block.title ?? block.language}`}
            size="xs"
            variant="outline"
            onClick={() => {
              void handleCopyCode()
            }}
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Retry copy"
                : "Copy code"}
          </Button>
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-6">
        {lines.map((line, index) => (
          <code
            key={`line-${index}`}
            className="grid grid-cols-[2rem_1fr] gap-4 whitespace-pre"
          >
            <span
              aria-hidden="true"
              className="text-right text-[11px] text-muted-foreground/70 select-none"
            >
              {index + 1}
            </span>
            <span>
              {tokenizeCodeLine(block.language, line).map(
                (token, tokenIndex) => (
                  <span
                    key={`token-${index}-${tokenIndex}`}
                    className={tokenClassNameByKind[token.kind]}
                  >
                    {token.content}
                  </span>
                )
              )}
            </span>
          </code>
        ))}
      </pre>
    </figure>
  )
}

function tokenizeCodeLine(
  language: CodeLanguage,
  line: string
): readonly CodeToken[] {
  if (line.length === 0) {
    return [{ kind: "plain", content: " " }]
  }

  const pattern = highlightPatternByLanguage[language]
  const tokens: CodeToken[] = []
  let currentIndex = 0

  for (const match of line.matchAll(pattern)) {
    const matchedToken = match[0]

    if (matchedToken === undefined || match.index === undefined) {
      continue
    }

    if (match.index > currentIndex) {
      tokens.push({
        kind: "plain",
        content: line.slice(currentIndex, match.index),
      })
    }

    tokens.push({
      kind: classifyCodeToken(language, matchedToken),
      content: matchedToken,
    })

    currentIndex = match.index + matchedToken.length
  }

  if (currentIndex < line.length) {
    tokens.push({
      kind: "plain",
      content: line.slice(currentIndex),
    })
  }

  return tokens
}

function classifyCodeToken(
  language: CodeLanguage,
  token: string
): CodeTokenKind {
  if (token.startsWith("//") || token.startsWith("#")) {
    return "comment"
  }

  if (token.startsWith("$")) {
    return "variable"
  }

  if (language === "json" && token.trimEnd().endsWith(":")) {
    return "property"
  }

  if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
    return "string"
  }

  if (/^\d+(?:\.\d+)?$/u.test(token)) {
    return "number"
  }

  if (language === "bash" && token.startsWith("-")) {
    return "command"
  }

  if (
    token === "const" ||
    token === "export" ||
    token === "function" ||
    token === "if" ||
    token === "import" ||
    token === "readonly" ||
    token === "return" ||
    token === "switch" ||
    token === "type" ||
    token === "true" ||
    token === "false" ||
    token === "null" ||
    token === "undefined"
  ) {
    return "keyword"
  }

  return "plain"
}
