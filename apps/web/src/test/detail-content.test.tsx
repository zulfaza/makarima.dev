import { act, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { DetailContent } from "@/components/detail-content"
import { setMatchMediaMatches } from "@/test/setup"

describe("DetailContent", () => {
  test("renders a flowchart block as svg output", async () => {
    render(
      <DetailContent
        blocks={[
          {
            kind: "mermaid",
            code: "flowchart TD\n  A[Start] --> B[Done]",
            title: "Sample flow",
            caption: "Request lifecycle",
          },
        ]}
      />
    )

    expect(screen.getByText("Sample flow")).toBeTruthy()
    expect(screen.getByText("Request lifecycle")).toBeTruthy()
    expect(screen.getByText("Rendering diagram...")).toBeTruthy()

    await waitFor(() => {
      expect(
        screen.getByTestId("mermaid-diagram").querySelector("svg")
      ).not.toBeNull()
    })
    expect(screen.getByText("Start")).toBeTruthy()
    expect(screen.getByText("Done")).toBeTruthy()
  })

  test("keeps flowchart rendered when effective theme changes", async () => {
    render(
      <DetailContent
        blocks={[
          {
            kind: "mermaid",
            code: "flowchart LR\n  A --> B",
          },
        ]}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByTestId("mermaid-diagram").querySelector("svg")
      ).not.toBeNull()
    })

    act(() => {
      setMatchMediaMatches(true)
    })

    await waitFor(() => {
      expect(
        screen.getByTestId("mermaid-diagram").querySelector("svg")
      ).not.toBeNull()
    })
  })

  test("falls back to raw mermaid source for unsupported diagrams", async () => {
    render(
      <DetailContent
        blocks={[
          {
            kind: "mermaid",
            code: "sequenceDiagram\n  A->>B: Hello",
          },
        ]}
      />
    )

    expect(await screen.findByText("Unable to render diagram.")).toBeTruthy()
    expect(
      screen.getByText("Only flowchart TD/LR diagrams are supported")
    ).toBeTruthy()
    expect(
      screen.getByText(
        (_, node) => node?.textContent === "sequenceDiagram\n  A->>B: Hello"
      )
    ).toBeTruthy()
  })
})
