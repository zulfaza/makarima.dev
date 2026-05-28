import { Check, Copy } from "lucide-react"
import { lazy, Suspense, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

import type { CodeBlock } from "./types"

const ShikiHighlighterLazy = lazy(() =>
  import("react-shiki/core").then(async (mod) => {
    const highlighter = await mod.createHighlighterCore({
      engine: mod.createJavaScriptRegexEngine({ forgiving: true }),
      langs: [
        import("@shikijs/langs/bash"),
        import("@shikijs/langs/json"),
        import("@shikijs/langs/typescript"),
        import("@shikijs/langs/tsx"),
      ],
      themes: [
        import("@shikijs/themes/dark-plus"),
        import("@shikijs/themes/light-plus"),
      ],
    })
    return {
      default: function ShikiHighlighterReady({
        code,
        language,
        theme,
      }: {
        readonly code: string
        readonly language: string
        readonly theme: { readonly dark: string; readonly light: string }
      }) {
        return (
          <mod.default
            className="shiki-code min-w-full text-[13px] leading-6 [&_pre]:m-0 [&>pre]:rounded-none!"
            defaultColor={false}
            highlighter={highlighter}
            language={language}
            showLanguage={false}
            showLineNumbers
            theme={theme}
          >
            {code}
          </mod.default>
        )
      },
    }
  }),
)

const shikiLanguageByCodeLanguage: Record<CodeBlock["language"], string> = {
  bash: "bash",
  json: "json",
  ts: "typescript",
  tsx: "tsx",
}

export function CodeSnippet({ block }: { block: CodeBlock }) {
  const [copyState, setCopyState] = useState<"copied" | "failed" | "idle">(
    "idle"
  )
  const isCopied = copyState === "copied"
  const timeoutId = useRef<number | null>(null)

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(block.code)

      if (timeoutId.current !== null) {
        window.clearTimeout(timeoutId.current)
      }

      setCopyState("copied")
      timeoutId.current = window.setTimeout(() => {
        setCopyState("idle")
        timeoutId.current = null
      }, 2000)
    } catch {
      setCopyState("failed")
    }
  }

  return (
    <figure className="border border-border/80">
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
            aria-label={
              isCopied
                ? `Copied code: ${block.title ?? block.language}`
                : copyState === "failed"
                  ? `Retry copy: ${block.title ?? block.language}`
                  : `Copy code: ${block.title ?? block.language}`
            }
            size="icon-xs"
            title={
              isCopied
                ? "Copied"
                : copyState === "failed"
                  ? "Retry copy"
                  : "Copy code"
            }
            variant="outline"
            data-status={copyState}
            className="relative overflow-hidden transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out hover:scale-[1.02] data-[status='copied']:border-emerald-500/40 data-[status='copied']:bg-emerald-500/10 data-[status='copied']:text-emerald-700 dark:data-[status='copied']:border-emerald-400/40 dark:data-[status='copied']:bg-emerald-400/12 dark:data-[status='copied']:text-emerald-300"
            onClick={() => {
              void handleCopyCode()
            }}
          >
            <span className="relative block size-3">
              <Copy
                data-status={copyState}
                aria-hidden="true"
                className="absolute inset-0 size-3 transition-all duration-200 ease-out data-[status='copied']:scale-70 data-[status='copied']:opacity-0"
              />
              <Check
                data-status={copyState}
                aria-hidden="true"
                className="absolute inset-0 size-3 scale-70 opacity-0 transition-all duration-200 ease-out data-[status='copied']:scale-100 data-[status='copied']:opacity-100"
              />
            </span>
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Suspense
          fallback={
            <pre className="m-0 min-w-full px-4 py-4 text-[13px] leading-6">
              <code>{block.code}</code>
            </pre>
          }
        >
          <ShikiHighlighterLazy
            code={block.code}
            language={shikiLanguageByCodeLanguage[block.language]}
            theme={{ dark: "dark-plus", light: "light-plus" }}
          />
        </Suspense>
      </div>
    </figure>
  )
}
