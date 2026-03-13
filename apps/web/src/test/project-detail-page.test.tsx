import { isNotFound } from "@tanstack/react-router";
import { screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { loadProjects } from "@/content/site";
import { ProjectDetailPage, loadProjectEntry } from "@/routes/projects/$slug";
import { renderWithRouter } from "@/test/render-with-router";

const mermaidMock = vi.hoisted(() => ({
  initialize: vi.fn(),
  render: vi.fn(async (_id: string, code: string) => ({
    svg: `<svg data-project-mermaid="true"><desc>${code}</desc></svg>`,
  })),
}));

vi.mock("mermaid", () => ({
  default: mermaidMock,
}));

describe("ProjectDetailPage", () => {
  test("renders project detail content", async () => {
    const entry = loadProjects()[0];

    renderWithRouter(<ProjectDetailPage entry={entry} />);

    const pageTitle = screen.getByRole("heading", {
      level: 1,
      name: entry.name,
    });

    expect(pageTitle).toBeTruthy();
    expect(screen.getByText("2026")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText(entry.summary)).toBeTruthy();
    expect(screen.getByText("Python")).toBeTruthy();
    expect(screen.getByTestId("project-favicon").getAttribute("src")).toBe(
      entry.faviconHref,
    );
    const accessLink = screen.getByRole("link", { name: "View source" });

    expect(accessLink.getAttribute("href")).toBe(
      "https://github.com/zulfaza/ai-meeting-notes-poc-py",
    );
    expect(screen.getByText(/This project explores a narrow but useful workflow:/)).toBeTruthy();
    expect(screen.getByText(/The pipeline is intentionally explicit\./)).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("button", { name: /Copy code:/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Preview image:/i })).toBeNull();
    expect(screen.getByText("Code flow")).toBeTruthy();
    expect(
      screen.getByText("Pipeline from source video to structured notes and action items."),
    ).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId("mermaid-diagram").querySelector("svg")).not.toBeNull();
    });
    expect(screen.queryByRole("heading", { name: "Pixel snake" })).toBeNull();
  });

  test("throws a TanStack not-found for missing slugs", async () => {
    expect.assertions(1);

    try {
      await loadProjectEntry("missing-project");
    } catch (error) {
      expect(isNotFound(error)).toBe(true);
    }
  });
});
