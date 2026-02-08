import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MeetingCard } from "./meeting-card";
import type { Meeting } from "@/types/race";

const mockMeeting: Meeting = {
  meetingId: "m123",
  trackName: "Flemington",
  state: "VIC",
  meetingDate: "2026-02-08",
  raceType: "Thoroughbred",
  races: [
    {
      raceId: "r1",
      raceNumber: 1,
      raceName: "Maiden Plate",
      raceTime: "2026-02-08T01:30:00.000Z",
      distance: 1200,
      raceType: "Thoroughbred",
      runners: [],
    },
    {
      raceId: "r2",
      raceNumber: 2,
      raceName: "Class 1",
      raceTime: "2026-02-08T02:00:00.000Z",
      distance: 1400,
      raceType: "Thoroughbred",
      runners: [],
    },
  ],
};

describe("MeetingCard", () => {
  it("displays track name prominently", () => {
    render(<MeetingCard meeting={mockMeeting} />);

    const trackName = screen.getByText("Flemington");
    expect(trackName).toBeInTheDocument();
    // Track name should be in a heading or prominent element
    expect(trackName.tagName).toMatch(/^H[1-6]$/);
  });

  it("displays start time of first race in HH:MM format", () => {
    render(<MeetingCard meeting={mockMeeting} />);

    // First race is at 01:30 UTC, but we show local time
    // The format should be HH:MM (24-hour)
    const timeElement = screen.getByText(/\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  it("displays race type indicator", () => {
    render(<MeetingCard meeting={mockMeeting} />);

    expect(screen.getByText("Thoroughbred")).toBeInTheDocument();
  });

  it("is clickable and calls onClick handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<MeetingCard meeting={mockMeeting} onClick={onClick} />);

    const card = screen.getByRole("button");
    await user.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("handles meeting with no races gracefully", () => {
    const emptyMeeting: Meeting = {
      ...mockMeeting,
      races: [],
    };

    render(<MeetingCard meeting={emptyMeeting} />);

    expect(screen.getByText("Flemington")).toBeInTheDocument();
    // Should show "No races" or similar instead of time
    expect(screen.getByText(/no races|tba/i)).toBeInTheDocument();
  });

  it("applies dark mode styling with appropriate classes", () => {
    render(<MeetingCard meeting={mockMeeting} />);

    const card = screen.getByRole("button");
    // Should have dark background class
    expect(card.className).toMatch(/bg-(zinc|neutral|gray)-[89]00/);
  });
});
