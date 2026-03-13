import { Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useEffectiveTheme } from "@/lib/theme";

import type { CodeLanguage, ContentBlock } from "@/content/site";

type ImageBlock = Extract<ContentBlock, { readonly kind: "image" }>;
type CodeBlock = Extract<ContentBlock, { readonly kind: "code" }>;
type MermaidBlock = Extract<ContentBlock, { readonly kind: "mermaid" }>;
type MermaidRenderer = (typeof import("mermaid"))["default"];
type MermaidTheme = "dark" | "default";
type MermaidRenderState =
  | {
      readonly status: "loading";
    }
  | {
      readonly status: "failed";
      readonly message: string;
    }
  | {
      readonly status: "ready";
      readonly svg: string;
    };

type CodeTokenKind =
  | "plain"
  | "comment"
  | "command"
  | "keyword"
  | "number"
  | "property"
  | "string"
  | "variable";

type CodeToken = {
  readonly kind: CodeTokenKind;
  readonly content: string;
};

const highlightPatternByLanguage: Record<CodeLanguage, RegExp> = {
  bash: /#[^\n]*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\$[A-Za-z_][\w]*|\b(?:if|then|fi|for|in|do|done|case|esac|function|local|export)\b|--?[A-Za-z][\w-]*|\b\d+(?:\.\d+)?\b/g,
  json: /"(?:\\.|[^"])*"\s*:|"(?:\\.|[^"])*"|\b(?:true|false|null)\b|\b\d+(?:\.\d+)?\b/g,
  ts: /\/\/[^\n]*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\b(?:const|export|function|if|import|readonly|return|switch|type)\b|\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b/g,
  tsx: /\/\/[^\n]*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\b(?:const|export|function|if|import|readonly|return|switch|type)\b|\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b/g,
};

const tokenClassNameByKind: Record<CodeTokenKind, string> = {
  plain: "text-foreground/88",
  comment: "text-muted-foreground italic",
  command: "font-medium text-primary",
  keyword: "font-medium text-primary",
  number: "text-sky-700 dark:text-sky-300",
  property: "text-emerald-700 dark:text-emerald-300",
  string: "text-amber-700 dark:text-amber-300",
  variable: "text-rose-700 dark:text-rose-300",
};

let mermaidRendererPromise: Promise<MermaidRenderer> | null = null;

function loadMermaidRenderer() {
  mermaidRendererPromise ??= import("mermaid").then((module) => module.default);

  return mermaidRendererPromise;
}

export function DetailContent({ blocks }: { blocks: ReadonlyArray<ContentBlock> }) {
  const [previewImage, setPreviewImage] = useState<ImageBlock | null>(null);

  useEffect(() => {
    if (!previewImage) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImage]);

  return (
    <>
      <article className="border-b border-border/80 px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {blocks.map((block, index) => {
            switch (block.kind) {
              case "paragraph":
                return (
                  <p key={`paragraph-${index}`} className="text-sm leading-7 text-foreground/88">
                    {block.content}
                  </p>
                );
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
                    <figcaption className="max-w-2xl text-xs leading-6 text-muted-foreground">
                      {block.caption ?? block.alt}
                    </figcaption>
                  </figure>
                );
              case "code":
                return <CodeSnippet key={`code-${index}`} block={block} />;
              case "mermaid":
                return <MermaidDiagram key={`mermaid-${index}`} block={block} />;
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
              <p className="text-xs text-muted-foreground">{previewImage.alt}</p>
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
  );
}

function MermaidDiagram({ block }: { block: MermaidBlock }) {
  const theme = useEffectiveTheme();
  const blockId = useId().replaceAll(":", "-");
  const renderAttempt = useRef(0);
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const [renderState, setRenderState] = useState<MermaidRenderState>({
    status: "loading",
  });
  const mermaidTheme: MermaidTheme = theme === "dark" ? "dark" : "default";

  useEffect(() => {
    let isActive = true;

    renderAttempt.current += 1;
    const currentAttempt = renderAttempt.current;

    setRenderState({
      status: "loading",
    });

    void loadMermaidRenderer()
      .then(async (mermaid) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: mermaidTheme,
        });

        const result = await mermaid.render(`mermaid-${blockId}-${currentAttempt}`, block.code);

        if (!isActive || renderAttempt.current !== currentAttempt) {
          return;
        }

        setRenderState({
          status: "ready",
          svg: result.svg,
        });
      })
      .catch((error: unknown) => {
        if (!isActive || renderAttempt.current !== currentAttempt) {
          return;
        }

        setRenderState({
          status: "failed",
          message:
            error instanceof Error && error.message.length > 0
              ? error.message
              : "Unknown Mermaid render error",
        });
      });

    return () => {
      isActive = false;
    };
  }, [block.code, blockId, mermaidTheme]);

  useEffect(() => {
    if (renderState.status !== "ready") {
      return;
    }

    const container = diagramRef.current;

    if (!container) {
      return;
    }

    const template = document.createElement("template");
    template.innerHTML = renderState.svg.trim();
    const firstChild = template.content.firstElementChild;

    if (!(firstChild instanceof SVGElement)) {
      setRenderState({
        status: "failed",
        message: "Invalid Mermaid SVG output",
      });

      return;
    }

    container.replaceChildren(firstChild);
  }, [renderState]);

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
        <span className="text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
          diagram
        </span>
      </div>
      <div className="overflow-x-auto px-4 py-4">
        {renderState.status === "ready" ? (
          <div className="flex min-w-fit justify-center">
            <div
              ref={diagramRef}
              data-testid="mermaid-diagram"
              aria-label={block.title ?? block.caption ?? "Mermaid diagram"}
              className="text-foreground [&_svg]:h-auto [&_svg]:max-w-none [&_svg]:overflow-visible"
            />
          </div>
        ) : renderState.status === "failed" ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-foreground">Unable to render diagram.</p>
            <p className="text-xs leading-5 text-muted-foreground">{renderState.message}</p>
            <pre className="overflow-x-auto border border-border/70 bg-muted/30 px-4 py-4 text-[13px] leading-6 whitespace-pre-wrap">
              {block.code}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Rendering diagram...</p>
        )}
      </div>
    </figure>
  );
}

function CodeSnippet({ block }: { block: CodeBlock }) {
  const [copyState, setCopyState] = useState<"copied" | "failed" | "idle">("idle");
  const lines = block.code.split("\n");
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
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-6">
        {lines.map((line, index) => (
          <code key={`line-${index}`} className="grid grid-cols-[2rem_1fr] gap-4 whitespace-pre">
            <span
              aria-hidden="true"
              className="text-right text-[11px] text-muted-foreground/70 select-none"
            >
              {index + 1}
            </span>
            <span>
              {tokenizeCodeLine(block.language, line).map((token, tokenIndex) => (
                <span
                  key={`token-${index}-${tokenIndex}`}
                  className={tokenClassNameByKind[token.kind]}
                >
                  {token.content}
                </span>
              ))}
            </span>
          </code>
        ))}
      </pre>
    </figure>
  );
}

function tokenizeCodeLine(language: CodeLanguage, line: string): ReadonlyArray<CodeToken> {
  if (line.length === 0) {
    return [{ kind: "plain", content: " " }];
  }

  const pattern = highlightPatternByLanguage[language];
  const tokens: Array<CodeToken> = [];
  let currentIndex = 0;

  for (const match of line.matchAll(pattern)) {
    const matchedToken = match[0];

    if (match.index > currentIndex) {
      tokens.push({
        kind: "plain",
        content: line.slice(currentIndex, match.index),
      });
    }

    tokens.push({
      kind: classifyCodeToken(language, matchedToken),
      content: matchedToken,
    });

    currentIndex = match.index + matchedToken.length;
  }

  if (currentIndex < line.length) {
    tokens.push({
      kind: "plain",
      content: line.slice(currentIndex),
    });
  }

  return tokens;
}

function classifyCodeToken(language: CodeLanguage, token: string): CodeTokenKind {
  if (token.startsWith("//") || token.startsWith("#")) {
    return "comment";
  }

  if (token.startsWith("$")) {
    return "variable";
  }

  if (language === "json" && token.trimEnd().endsWith(":")) {
    return "property";
  }

  if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
    return "string";
  }

  if (/^\d+(?:\.\d+)?$/u.test(token)) {
    return "number";
  }

  if (language === "bash" && token.startsWith("-")) {
    return "command";
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
    return "keyword";
  }

  return "plain";
}
