type FlowDirection = "LR" | "TD"

type FlowNode = {
  readonly id: string
  readonly label: string
}

type LayoutNode = FlowNode & {
  readonly lines: ReadonlyArray<string>
  readonly width: number
  readonly height: number
}

type FlowEdge = {
  readonly from: string
  readonly to: string
  readonly label?: string
}

type ParsedFlowchart =
  | {
      readonly status: "ok"
      readonly direction: FlowDirection
      readonly nodes: ReadonlyArray<FlowNode>
      readonly edges: ReadonlyArray<FlowEdge>
    }
  | {
      readonly status: "failed"
      readonly message: string
    }

type RenderedFlowchart =
  | {
      readonly status: "ok"
      readonly svg: string
    }
  | {
      readonly status: "failed"
      readonly message: string
    }

const edgePattern =
  /^\s*([A-Za-z][\w-]*)(?:\[([^\]]+)])?\s*-->(?:\|([^|]+)\|)?\s*([A-Za-z][\w-]*)(?:\[([^\]]+)])?/

function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function normalizeNodeLabel(value: string) {
  return value.replaceAll("<br/>", "\n").replaceAll("<br>", "\n")
}

function splitLongWord(value: string, maxLineLength: number) {
  if (value.length <= maxLineLength) {
    return [value]
  }

  const parts = value.split(/([/\-.])/).filter((part) => part.length > 0)
  const lines: Array<string> = []
  let line = ""

  for (const part of parts) {
    const nextLine = `${line}${part}`

    if (nextLine.length <= maxLineLength) {
      line = nextLine
    } else {
      if (line.length > 0) {
        lines.push(line)
      }

      line = part.length <= maxLineLength ? part : part.slice(0, maxLineLength)
    }
  }

  if (line.length > 0) {
    lines.push(line)
  }

  return lines
}

function wrapWords(value: string, maxLineLength: number) {
  const words = value
    .split(/\s+/)
    .flatMap((word) => splitLongWord(word, maxLineLength))
    .filter((word) => word.length > 0)
  const lines: Array<string> = []
  let line = ""

  for (const word of words) {
    const nextLine = line.length === 0 ? word : `${line} ${word}`

    if (nextLine.length <= maxLineLength) {
      line = nextLine
    } else {
      if (line.length > 0) {
        lines.push(line)
      }

      line = word
    }
  }

  if (line.length > 0) {
    lines.push(line)
  }

  return lines.length > 0 ? lines : [value]
}

function wrapLabel(label: string) {
  return label
    .split("\n")
    .flatMap((line) => wrapWords(line, 24))
}

function wrapEdgeLabel(label: string) {
  return normalizeNodeLabel(label)
    .split("\n")
    .flatMap((line) => wrapWords(line, 22))
}

function parseDirection(value: string): FlowDirection | null {
  if (value === "TD" || value === "LR") {
    return value
  }

  return null
}

function addNode(
  nodes: Map<string, string>,
  id: string,
  label: string | undefined
) {
  if (label !== undefined || !nodes.has(id)) {
    nodes.set(id, normalizeNodeLabel(label ?? id))
  }
}

function parseFlowchart(code: string): ParsedFlowchart {
  const lines = code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { status: "failed", message: "Empty diagram" }
  }

  const header = lines[0]
  const [kind, rawDirection] = header.split(/\s+/)
  const direction = parseDirection(rawDirection)

  if (kind !== "flowchart" || direction === null) {
    return {
      status: "failed",
      message: "Only flowchart TD/LR diagrams are supported",
    }
  }

  const nodes = new Map<string, string>()
  const edges: Array<FlowEdge> = []

  for (const line of lines.slice(1)) {
    const match = edgePattern.exec(line)

    if (match === null) {
      continue
    }

    const from = match[1]
    const fromLabel = match[2]
    const edgeLabel = match[3]
    const to = match[4]
    const toLabel = match[5]

    addNode(nodes, from, fromLabel)
    addNode(nodes, to, toLabel)
    edges.push({ from, to, label: edgeLabel })
  }

  if (nodes.size === 0 || edges.length === 0) {
    return { status: "failed", message: "No supported flowchart edges found" }
  }

  return {
    status: "ok",
    direction,
    nodes: Array.from(nodes, ([id, label]) => ({ id, label })),
    edges,
  }
}

function buildRanks(
  nodes: ReadonlyArray<FlowNode>,
  edges: ReadonlyArray<FlowEdge>
) {
  const ranks = new Map<string, number>()

  for (const node of nodes) {
    ranks.set(node.id, 0)
  }

  for (const edge of edges) {
    const fromRank = ranks.get(edge.from) ?? 0
    const toRank = ranks.get(edge.to) ?? 0

    if (toRank <= fromRank) {
      ranks.set(edge.to, fromRank + 1)
    }
  }

  return ranks
}

function renderTextLines(lines: ReadonlyArray<string>, x: number, y: number) {
  const startY = y - ((lines.length - 1) * 16) / 2

  return lines
    .map(
      (line, index) =>
        `<tspan x="${x}" y="${startY + index * 16}">${escapeSvgText(line)}</tspan>`
    )
    .join("")
}

export function renderFlowchartSvg(code: string): RenderedFlowchart {
  const parsed = parseFlowchart(code)

  if (parsed.status === "failed") {
    return parsed
  }

  const columnGap = 72
  const rowGap = 58
  const margin = 24
  const charWidth = 7.6
  const minNodeWidth = 184
  const horizontalPadding = 48
  const verticalPadding = 30
  const lineHeight = 16
  const layoutNodes: ReadonlyArray<LayoutNode> = parsed.nodes.map((node) => {
    const lines = wrapLabel(node.label)
    const maxLineLength = lines.reduce(
      (max, line) => Math.max(max, line.length),
      0
    )

    return {
      ...node,
      lines,
      width: Math.max(minNodeWidth, maxLineLength * charWidth + horizontalPadding),
      height: Math.max(58, lines.length * lineHeight + verticalPadding),
    }
  })
  const nodeById = new Map(layoutNodes.map((node) => [node.id, node]))
  const ranks = buildRanks(parsed.nodes, parsed.edges)
  const groupedNodes = new Map<number, ReadonlyArray<LayoutNode>>()

  for (const node of layoutNodes) {
    const rank = ranks.get(node.id) ?? 0
    groupedNodes.set(rank, [...(groupedNodes.get(rank) ?? []), node])
  }

  const rankEntries = Array.from(groupedNodes.entries()).sort(
    ([left], [right]) => left - right
  )
  const rankBreadths = new Map<number, number>()
  const rankDepths = new Map<number, number>()
  const rankGaps = new Map<number, number>()

  for (const [rank, nodes] of rankEntries) {
    const breadth = nodes.reduce((total, node, index) => {
      return total + node.width + (index === 0 ? 0 : columnGap)
    }, 0)
    const depth = nodes.reduce((max, node) => Math.max(max, node.height), 0)

    rankBreadths.set(rank, breadth)
    rankDepths.set(rank, depth)
  }

  for (const edge of parsed.edges) {
    if (edge.label === undefined) {
      continue
    }

    const fromRank = ranks.get(edge.from)
    const toRank = ranks.get(edge.to)

    if (fromRank === undefined || toRank === undefined || toRank <= fromRank) {
      continue
    }

    const labelLines = wrapEdgeLabel(edge.label).length
    const labelGap = Math.max(rowGap, labelLines * 18 + 48)
    const currentGap = rankGaps.get(fromRank) ?? rowGap

    rankGaps.set(fromRank, Math.max(currentGap, labelGap))
  }

  const maxRankBreadth = Math.max(...Array.from(rankBreadths.values()))
  const width =
    parsed.direction === "TD"
      ? margin * 2 + maxRankBreadth
      : margin * 2 + rankEntries.reduce((total, [rank], index) => {
          return total + (rankDepths.get(rank) ?? 0) + (index === 0 ? 0 : columnGap)
        }, 0)
  const height =
    parsed.direction === "TD"
      ? margin * 2 +
        rankEntries.reduce((total, [rank], index) => {
          return (
            total +
            (rankDepths.get(rank) ?? 0) +
            (index === 0 ? 0 : (rankGaps.get(rank - 1) ?? rowGap))
          )
        }, 0)
      : margin * 2 + maxRankBreadth
  const positions = new Map<
    string,
    { readonly x: number; readonly y: number }
  >()
  let rankOffset = margin

  for (const [, [rank, nodes]] of rankEntries.entries()) {
    const rankBreadth = rankBreadths.get(rank) ?? 0
    const rankDepth = rankDepths.get(rank) ?? 0
    const breadthOffset =
      parsed.direction === "TD"
        ? (maxRankBreadth - rankBreadth) * 0.5
        : (maxRankBreadth - rankBreadth) * 0.5
    let nodeOffset = margin + breadthOffset

    for (const node of nodes) {
      const x =
        parsed.direction === "TD"
          ? nodeOffset
          : rankOffset + (rankDepth - node.width) * 0.5
      const y =
        parsed.direction === "TD"
          ? rankOffset + (rankDepth - node.height) * 0.5
          : nodeOffset

      positions.set(node.id, { x, y })
      nodeOffset += (parsed.direction === "TD" ? node.width : node.height) + rowGap
    }

    rankOffset +=
      rankDepth +
      (parsed.direction === "TD" ? (rankGaps.get(rank) ?? rowGap) : columnGap)
  }

  const edgeSvg = parsed.edges
    .map((edge) => {
      const from = positions.get(edge.from)
      const to = positions.get(edge.to)

      if (from === undefined || to === undefined) {
        return ""
      }

      const fromNode = nodeById.get(edge.from)
      const toNode = nodeById.get(edge.to)

      if (fromNode === undefined || toNode === undefined) {
        return ""
      }

      const fromX = from.x + fromNode.width / 2
      const fromY = from.y + fromNode.height
      const toX = to.x + toNode.width / 2
      const toY = to.y
      const path =
        parsed.direction === "TD"
          ? `M ${fromX} ${fromY} V ${(fromY + toY) / 2} H ${toX} V ${toY}`
          : `M ${from.x + fromNode.width} ${from.y + fromNode.height / 2} H ${(from.x + fromNode.width + to.x) / 2} V ${to.y + toNode.height / 2} H ${to.x}`
      const edgeLabelLines =
        edge.label === undefined ? [] : wrapEdgeLabel(edge.label)
      const label =
        edgeLabelLines.length === 0
          ? ""
          : `<text class="edge-label" x="${(fromX + toX) / 2}" y="${(fromY + toY) / 2}">${renderTextLines(edgeLabelLines, (fromX + toX) / 2, (fromY + toY) / 2)}</text>`

      return `<path class="edge" d="${path}" marker-end="url(#arrow)" />${label}`
    })
    .join("")
  const nodeSvg = layoutNodes
    .map((node) => {
      const position = positions.get(node.id)

      if (position === undefined) {
        return ""
      }

      return `<g class="node"><rect x="${position.x}" y="${position.y}" width="${node.width}" height="${node.height}" rx="3" /><text x="${position.x + node.width / 2}" y="${position.y + node.height / 2}">${renderTextLines(node.lines, position.x + node.width / 2, position.y + node.height / 2)}</text></g>`
    })
    .join("")

  return {
    status: "ok",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" role="img" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M 0 0 L 8 4 L 0 8 z" /></marker></defs><style>.node rect{fill:var(--card);stroke:var(--border);stroke-width:1}.node text{fill:var(--foreground);font:500 12px var(--font-mono,monospace);text-anchor:middle;dominant-baseline:middle}.edge{fill:none;stroke:var(--muted-foreground);stroke-width:1.4}.edge-label{fill:var(--muted-foreground);font:11px var(--font-mono,monospace);text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:var(--card);stroke-width:8px;stroke-linejoin:round}.edge-label tspan{dominant-baseline:middle}marker path{fill:var(--muted-foreground)}</style>${edgeSvg}${nodeSvg}</svg>`,
  }
}
