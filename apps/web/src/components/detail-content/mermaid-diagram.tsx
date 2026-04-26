import { Maximize2 } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useEffectiveTheme } from "@/lib/theme";

import type { MermaidBlock } from "./types";
import type mermaid from "mermaid";

type MermaidRenderer = typeof mermaid;
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

let mermaidRendererPromise: Promise<MermaidRenderer> | null = null;

function loadMermaidRenderer() {
  mermaidRendererPromise ??= import("mermaid").then((module) => module.default);

  return mermaidRendererPromise;
}

export function MermaidDiagram({ block, onExpand }: { block: MermaidBlock; onExpand: (svg: string) => void }) {
  const theme = useEffectiveTheme();
  const blockId = useId().replaceAll(":", "-");
  const renderAttempt = useRef(0);
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const [renderState, setRenderState] = useState<MermaidRenderState>({
    status: "loading",
  });
  const mermaidTheme: MermaidTheme = theme === "dark" ? "dark" : "default";
  const handleExpand = useCallback(() => {
    if (renderState.status === "ready") {
      onExpand(renderState.svg);
    }
  }, [onExpand, renderState]);

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

    const svg = container.querySelector("svg");
    if (svg) {
      const scale = block.scale ?? 1;
      if (scale !== 1) {
        const width = svg.getAttribute("width");
        const height = svg.getAttribute("height");
        if (width) {
          const num = Number.parseFloat(width);
          if (Number.isFinite(num)) {
            svg.setAttribute("width", String(num * scale));
          }
        }
        if (height) {
          const num = Number.parseFloat(height);
          if (Number.isFinite(num)) {
            svg.setAttribute("height", String(num * scale));
          }
        }
      }
    }
  }, [renderState, block.scale]);

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
            diagram
          </span>
          <Button
            aria-label="Expand diagram"
            aria-disabled={renderState.status !== "ready" || undefined}
            size="icon-xs"
            variant="outline"
            onClick={handleExpand}
            className={renderState.status !== "ready" ? "pointer-events-none opacity-50" : ""}
          >
            <Maximize2 className="size-3" aria-hidden="true" />
          </Button>
        </div>
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
