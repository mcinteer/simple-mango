import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MeetingSkeleton, DashboardSkeleton } from "./meeting-skeleton";

describe("MeetingSkeleton", () => {
  it("renders a skeleton card with animate-pulse", () => {
    render(<MeetingSkeleton />);

    const skeleton = screen.getByTestId("meeting-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.className).toContain("animate-pulse");
  });

  it("matches the shape of a meeting card", () => {
    render(<MeetingSkeleton />);

    const skeleton = screen.getByTestId("meeting-skeleton");
    // Should have dark background like the real card
    expect(skeleton.className).toMatch(/bg-(zinc|neutral|gray)-[89]00/);
  });
});

describe("DashboardSkeleton", () => {
  it("renders multiple state group skeletons", () => {
    render(<DashboardSkeleton />);

    // Should render placeholder state groups
    const groups = screen.getAllByTestId("state-group-skeleton");
    expect(groups.length).toBeGreaterThanOrEqual(3);
  });

  it("renders multiple meeting skeletons per group", () => {
    render(<DashboardSkeleton />);

    const skeletons = screen.getAllByTestId("meeting-skeleton");
    // Each group should have multiple skeletons
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });
});
