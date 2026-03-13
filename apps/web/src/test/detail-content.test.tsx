import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DetailContent } from "@/components/detail-content";
import { setMatchMediaMatches } from "@/test/setup";

const mermaidMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  render: vi.fn(async (id: string, code: string) => ({
    svg: `<svg data-render-id="${id}"><desc>${code}</desc></svg>`,
  })),
}));

vi.mock("mermaid", () => ({
  default: mermaidMock,
}));

afterEach(() => {
  mermaidMock.initialize.mockClear();
  mermaidMock.render.mockClear();
});

describe("DetailContent", () => {
  test("renders a mermaid block with theme-aware svg output", async () => {
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
      />,
    );

    expect(screen.getByText("Sample flow")).toBeTruthy();
    expect(screen.getByText("Request lifecycle")).toBeTruthy();
    expect(screen.getByText("Rendering diagram...")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId("mermaid-diagram").querySelector("svg")).not.toBeNull();
    });

    expect(mermaidMock.initialize).toHaveBeenLastCalledWith(
      expect.objectContaining({
        securityLevel: "strict",
        startOnLoad: false,
        theme: "default",
      }),
    );
    expect(mermaidMock.render).toHaveBeenCalledWith(
      expect.stringContaining("mermaid-"),
      "flowchart TD\n  A[Start] --> B[Done]",
    );
  });

  test("rerenders mermaid when effective theme changes", async () => {
    render(
      <DetailContent
        blocks={[
          {
            kind: "mermaid",
            code: "flowchart LR\n  A --> B",
          },
        ]}
      />,
    );

    await waitFor(() => {
      expect(mermaidMock.render).toHaveBeenCalledTimes(1);
    });

    act(() => {
      setMatchMediaMatches(true);
    });

    await waitFor(() => {
      expect(mermaidMock.initialize).toHaveBeenLastCalledWith(
        expect.objectContaining({
          theme: "dark",
        }),
      );
    });
    expect(mermaidMock.render).toHaveBeenCalledTimes(2);
  });

  test("falls back to raw mermaid source when rendering fails", async () => {
    mermaidMock.render.mockRejectedValueOnce(new Error("Parse failed"));

    render(
      <DetailContent
        blocks={[
          {
            kind: "mermaid",
            code: "flowchart TD\n  A --> B",
          },
        ]}
      />,
    );

    expect(await screen.findByText("Unable to render diagram.")).toBeTruthy();
    expect(screen.getByText("Parse failed")).toBeTruthy();
    expect(
      screen.getByText((_, node) => node?.textContent === "flowchart TD\n  A --> B"),
    ).toBeTruthy();
  });
});
