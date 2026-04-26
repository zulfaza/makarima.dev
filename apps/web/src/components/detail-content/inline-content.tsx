import type { InlineSegment } from "./types";

export function InlineContent({ segments }: { readonly segments: ReadonlyArray<InlineSegment> }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.kind === "inlineCode") {
          return (
            <code
              key={`inline-code-${index}`}
              className="rounded-[0.2em] border border-border/70 bg-accent/30 px-[0.35em] py-[0.1em] font-mono text-[0.9em] text-foreground/92"
            >
              {segment.value}
            </code>
          );
        }

        return <span key={`text-${index}`}>{segment.value}</span>;
      })}
    </>
  );
}