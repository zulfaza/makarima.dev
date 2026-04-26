import type { ContentBlock, ContentSegment } from "@/content/site";

export type ImageBlock = Extract<ContentBlock, { readonly kind: "image" }>;
export type CodeBlock = Extract<ContentBlock, { readonly kind: "code" }>;
export type MermaidBlock = Extract<ContentBlock, { readonly kind: "mermaid" }>;
export type InlineSegment = ContentSegment;

export type ExpandedMermaid = {
  readonly block: MermaidBlock;
  readonly svg: string;
};
