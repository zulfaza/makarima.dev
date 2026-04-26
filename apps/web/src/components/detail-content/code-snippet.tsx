import ShikiHighlighter, { createJavaScriptRegexEngine } from "react-shiki";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import type { CodeBlock } from "./types";
import { useEffectiveTheme } from "@/lib/theme";

const jsEngine = createJavaScriptRegexEngine({ forgiving: true });

const shikiLanguageByCodeLanguage: Record<CodeBlock["language"], string> = {
  bash: "bash",
  json: "json",
  ts: "typescript",
  tsx: "tsx",
};

export function CodeSnippet({ block }: { block: CodeBlock }) {
  const theme = useEffectiveTheme();
  const [copyState, setCopyState] = useState<"copied" | "failed" | "idle">("idle");
  const isCopied = copyState === "copied";
  const timeoutId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId.current !== null) {
        window.clearTimeout(timeoutId.current);
      }
    };
  }, []);

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(block.code);

      if (timeoutId.current !== null) {
        window.clearTimeout(timeoutId.current);
      }

      setCopyState("copied");
      timeoutId.current = window.setTimeout(() => {
        setCopyState("idle");
        timeoutId.current = null;
      }, 2000);
    } catch {
      setCopyState("failed");
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
            title={isCopied ? "Copied" : copyState === "failed" ? "Retry copy" : "Copy code"}
            variant="outline"
            data-status={copyState}
            className="relative overflow-hidden transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out data-[status='copied']:border-emerald-500/40 data-[status='copied']:bg-emerald-500/10 data-[status='copied']:text-emerald-700 hover:scale-[1.02] dark:data-[status='copied']:border-emerald-400/40 dark:data-[status='copied']:bg-emerald-400/12 dark:data-[status='copied']:text-emerald-300"
            onClick={() => {
              void handleCopyCode();
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
        <ShikiHighlighter
          className="shiki-code [&_pre]:m-0 min-w-full text-[13px] leading-6 [&>pre]:rounded-none!"
          engine={jsEngine}
          language={shikiLanguageByCodeLanguage[block.language]}
          showLanguage={false}
          showLineNumbers
          theme={{ dark: "dark-plus", light: "light-plus" }}
          defaultColor={theme}
        >
          {block.code}
        </ShikiHighlighter>
      </div>
    </figure>
  );
}
