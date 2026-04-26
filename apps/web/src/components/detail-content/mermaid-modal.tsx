import { Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import type { MermaidBlock } from "./types";

export function MermaidModal({ block, svg, onClose }: { block: MermaidBlock; svg: string; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [naturalSize, setNaturalSize] = useState<{ readonly width: number; readonly height: number } | null>(null);

  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.15;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const template = document.createElement("template");
    template.innerHTML = svg.trim();
    const firstChild = template.content.firstElementChild;

    if (!(firstChild instanceof SVGElement)) {
      return;
    }

    container.replaceChildren(firstChild);

    requestAnimationFrame(() => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setNaturalSize({ width: rect.width, height: rect.height });
      }
    });
  }, [svg]);

  const zoomIn = useCallback(() => setZoom((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  const scaledWidth = naturalSize ? naturalSize.width * zoom : undefined;
  const scaledHeight = naturalSize ? naturalSize.height * zoom : undefined;

  return (
    <div
      aria-label={block.title ?? block.caption ?? "Mermaid diagram"}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/55 p-4 backdrop-blur-sm"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col border border-border/80 bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
          <p className="text-xs text-muted-foreground">{block.title ?? block.caption ?? "Mermaid diagram"}</p>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 border border-border/70 bg-muted/40 px-1.5 py-0.5">
              <Button aria-label="Zoom out" size="icon-xs" variant="ghost" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
                <Minus className="size-3" aria-hidden="true" />
              </Button>
              <span className="min-w-[3rem] text-center text-[11px] tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button aria-label="Zoom in" size="icon-xs" variant="ghost" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
                <Plus className="size-3" aria-hidden="true" />
              </Button>
              <Button aria-label="Reset zoom" size="icon-xs" variant="ghost" onClick={resetZoom} disabled={zoom === 1}>
                <RotateCcw className="size-3" aria-hidden="true" />
              </Button>
            </div>
            <Button
              aria-label="Close diagram preview"
              size="xs"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div
            style={naturalSize ? { width: scaledWidth, height: scaledHeight, overflow: "hidden" } : undefined}
          >
            <div
              ref={containerRef}
              style={naturalSize ? { transform: `scale(${zoom})`, transformOrigin: "top left", width: naturalSize.width, height: naturalSize.height } : undefined}
              className="text-foreground [&_svg]:h-auto [&_svg]:max-w-none [&_svg]:overflow-visible"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
