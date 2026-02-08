import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StateGroup } from "./state-group";
import type { Meeting } from "@/types/race";

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
        raceName: "Maiden Plate",
        raceTime: "2026-02-08T01:30:00.000Z",
        distance: 1200,
        raceType: "Thoroughbred",
        runners: [],
      },
    ],
  },
  {
    meetingId: "m2",
    trackName: "Moonee Valley",
    state: "VIC",
    meetingDate: "2026-02-08",
    raceType: "Thoroughbred",
    races: [
      {
        raceId: "r2",
        raceNumber: 1,
        raceName: "BM70",
        raceTime: "2026-02-08T02:00:00.000Z",
        distance: 1600,
        raceType: "Thoroughbred",
        runners: [],
      },
    ],
  },
];

describe("StateGroup", () => {
  it("renders state name as section header", () => {
    render(<StateGroup stateName="VIC" meetings={mockMeetings} />);

    const header = screen.getByRole("heading", { name: "VIC" });
    expect(header).toBeInTheDocument();
  });

  it("renders a MeetingCard for each meeting", () => {
    render(<StateGroup stateName="VIC" meetings={mockMeetings} />);

    expect(screen.getByText("Flemington")).toBeInTheDocument();
    expect(screen.getByText("Moonee Valley")).toBeInTheDocument();
  });

  it("renders empty state when no meetings provided", () => {
    render(<StateGroup stateName="TAS" meetings={[]} />);

    expect(screen.getByRole("heading", { name: "TAS" })).toBeInTheDocument();
    // Should indicate no meetings
    expect(screen.getByText(/no meetings/i)).toBeInTheDocument();
  });

  it("applies dark mode styling with border on header", () => {
    render(<StateGroup stateName="VIC" meetings={mockMeetings} />);

    const header = screen.getByRole("heading", { name: "VIC" });
    expect(header.className).toContain("text-white");
    expect(header.className).toContain("border-zinc-700");
  });

  it("passes onClick handler to MeetingCard components", async () => {
    const user = userEvent.setup();
    const onMeetingClick = vi.fn();

    render(
      <StateGroup
        stateName="VIC"
        meetings={mockMeetings}
        onMeetingClick={onMeetingClick}
      />
    );

    const firstCard = screen.getByText("Flemington").closest("button");
    await user.click(firstCard!);

    expect(onMeetingClick).toHaveBeenCalledWith(mockMeetings[0]);
  });
});
