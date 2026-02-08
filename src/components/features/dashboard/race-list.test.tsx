import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RaceList } from "./race-list";
import type { Meeting } from "@/types/race";

// Mock the hook
vi.mock("./use-race-cards", () => ({
  useRaceCards: vi.fn(),
}));

import { useRaceCards } from "./use-race-cards";

const mockMeetings: Meeting[] = [
  {
    meetingId: "m1",
    trackName: "Flemington",
    state: "VIC",
    meetingDate: "2026-02-08",
    raceType: "Thoroughbred",
    races: [
      {
        raceId: "r1",
        raceNumber: 1,
        raceName: "Maiden",
        raceTime: "2026-02-08T01:30:00.000Z",
        distance: 1200,
        raceType: "Thoroughbred",
        runners: [],
      },
    ],
  },
  {
    meetingId: "m2",
    trackName: "Randwick",
    state: "NSW",
    meetingDate: "2026-02-08",
    raceType: "Thoroughbred",
    races: [],
  },
];

const mockMeetingsByState = {
  VIC: [mockMeetings[0]],
  NSW: [mockMeetings[1]],
};

describe("RaceList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DashboardSkeleton while loading", () => {
    vi.mocked(useRaceCards).mockReturnValue({
      meetings: [],
      meetingsByState: {},
      sortedStateKeys: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<RaceList />);

    expect(screen.getAllByTestId("state-group-skeleton").length).toBeGreaterThan(0);
  });

  it("renders error message with retry button on error", async () => {
    const refetch = vi.fn();
    vi.mocked(useRaceCards).mockReturnValue({
      meetings: [],
      meetingsByState: {},
      sortedStateKeys: [],
      isLoading: false,
      error: new Error("Network error"),
      refetch,
    });

    render(<RaceList />);

    expect(screen.getByText(/Error Loading Meetings/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(retryButton);

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders StateGroup for each state with meetings", () => {
    vi.mocked(useRaceCards).mockReturnValue({
      meetings: mockMeetings,
      meetingsByState: mockMeetingsByState,
      sortedStateKeys: ["VIC", "NSW"],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<RaceList />);

    // Should render state headers
    expect(screen.getByRole("heading", { name: "VIC" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "NSW" })).toBeInTheDocument();

    // Should render meeting cards
    expect(screen.getByText("Flemington")).toBeInTheDocument();
    expect(screen.getByText("Randwick")).toBeInTheDocument();
  });

  it("renders empty state when no meetings available", () => {
    vi.mocked(useRaceCards).mockReturnValue({
      meetings: [],
      meetingsByState: {},
      sortedStateKeys: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<RaceList />);

    expect(screen.getByText(/no meetings/i)).toBeInTheDocument();
  });

  it("renders states in sorted order", () => {
    vi.mocked(useRaceCards).mockReturnValue({
      meetings: mockMeetings,
      meetingsByState: mockMeetingsByState,
      sortedStateKeys: ["VIC", "NSW"], // VIC should come before NSW
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<RaceList />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    const stateNames = headings.map((h) => h.textContent);

    expect(stateNames.indexOf("VIC")).toBeLessThan(stateNames.indexOf("NSW"));
  });
});
