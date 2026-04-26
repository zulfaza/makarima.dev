import { useEffect, useState } from "react";

import type { ContentBlock } from "@/content/site";

import { CodeSnippet } from "./code-snippet";
import { InlineContent } from "./inline-content";
import { MermaidDiagram } from "./mermaid-diagram";
import { MermaidModal } from "./mermaid-modal";
import type { ExpandedMermaid, ImageBlock } from "./types";

import type { ContentSegment } from "@/content/site";

import { Button } from "@/components/ui/button";

const headingClassByLevel: Record<number, string> = {
  1: "text-lg font-semibold tracking-tight text-foreground",
  2: "text-base font-semibold tracking-tight text-foreground",
  3: "text-sm font-semibold text-foreground",
  4: "text-sm font-medium text-foreground",
  5: "text-xs font-medium text-muted-foreground",
  6: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
};

function HeadingBlock({ level, content }: { level: number; content: ReadonlyArray<ContentSegment> }) {
  const Tag = `h${level}` as `h1` | `h2` | `h3` | `h4` | `h5` | `h6`;
  return <Tag className={headingClassByLevel[level]}><InlineContent segments={content} /></Tag>;
}

export function DetailContent({ blocks }: { blocks: ReadonlyArray<ContentBlock> }) {
  const [previewImage, setPreviewImage] = useState<ImageBlock | null>(null);
  const [expandedMermaid, setExpandedMermaid] = useState<ExpandedMermaid | null>(null);

  useEffect(() => {
    if (!previewImage && !expandedMermaid) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewImage(null);
        setExpandedMermaid(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewImage, expandedMermaid]);

  return (
    <>
      <article className="border-b border-border/80 px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {blocks.map((block, index) => {
            switch (block.kind) {
              case "paragraph":
                return (
                  <p key={`paragraph-${index}`} className="text-sm leading-7 text-foreground/88">
                    <InlineContent segments={block.content} />
                  </p>
                );
              case "heading":
                return <HeadingBlock key={`heading-${index}`} level={block.level} content={block.content} />;
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
                return (
                  <MermaidDiagram
                    key={`mermaid-${index}`}
                    block={block}
                    onExpand={(svg) => setExpandedMermaid({ block, svg })}
                  />
                );
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

      {expandedMermaid ? (
        <MermaidModal
          block={expandedMermaid.block}
          svg={expandedMermaid.svg}
          onClose={() => setExpandedMermaid(null)}
        />
      ) : null}
    </>
  );
}
