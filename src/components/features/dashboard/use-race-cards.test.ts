import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useRaceCards } from "./use-race-cards";
import type { Meeting } from "@/types/race";

const mockMeetings: Meeting[] = [
  {
    meetingId: "m1",
    trackName: "Flemington",
    state: "VIC",
    meetingDate: "2026-02-08",
    raceType: "Thoroughbred",
    races: [],
  },
  {
    meetingId: "m2",
    trackName: "Randwick",
    state: "NSW",
    meetingDate: "2026-02-08",
    raceType: "Thoroughbred",
    races: [],
  },
  {
    meetingId: "m3",
    trackName: "Moonee Valley",
    state: "VIC",
    meetingDate: "2026-02-08",
    raceType: "Harness",
    races: [],
  },
];

describe("useRaceCards", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with loading state", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useRaceCards());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.meetings).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches meetings from /api/race-cards", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockMeetings, meta: { cached: true } }),
    } as Response);

    const { result } = renderHook(() => useRaceCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith("/api/race-cards", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(result.current.meetings).toEqual(mockMeetings);
  });

  it("groups meetings by state", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockMeetings, meta: { cached: true } }),
    } as Response);

    const { result } = renderHook(() => useRaceCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const { meetingsByState } = result.current;
    expect(meetingsByState.VIC).toHaveLength(2);
    expect(meetingsByState.NSW).toHaveLength(1);
    expect(meetingsByState.VIC.map((m) => m.trackName)).toContain("Flemington");
    expect(meetingsByState.VIC.map((m) => m.trackName)).toContain("Moonee Valley");
  });

  it("returns sorted state keys in preferred order", async () => {
    const meetingsWithMultipleStates: Meeting[] = [
      { meetingId: "m1", trackName: "Track", state: "WA", meetingDate: "2026-02-08", raceType: "R", races: [] },
      { meetingId: "m2", trackName: "Track", state: "VIC", meetingDate: "2026-02-08", raceType: "R", races: [] },
      { meetingId: "m3", trackName: "Track", state: "NSW", meetingDate: "2026-02-08", raceType: "R", races: [] },
      { meetingId: "m4", trackName: "Track", state: "QLD", meetingDate: "2026-02-08", raceType: "R", races: [] },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: meetingsWithMultipleStates, meta: {} }),
    } as Response);

    const { result } = renderHook(() => useRaceCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const { sortedStateKeys } = result.current;
    // VIC, NSW, QLD should come before WA in the preferred order
    expect(sortedStateKeys.indexOf("VIC")).toBeLessThan(sortedStateKeys.indexOf("WA"));
    expect(sortedStateKeys.indexOf("NSW")).toBeLessThan(sortedStateKeys.indexOf("WA"));
    expect(sortedStateKeys.indexOf("QLD")).toBeLessThan(sortedStateKeys.indexOf("WA"));
  });

  it("sets error state on fetch failure", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({}),
    } as Response);

    const { result } = renderHook(() => useRaceCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toContain("Failed to fetch race cards: 500");
    expect(result.current.meetings).toEqual([]);
  });

  it("handles non-JSON error responses gracefully", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: () => Promise.reject(new SyntaxError("Unexpected token <")),
    } as Response);

    const { result } = renderHook(() => useRaceCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toContain("Failed to fetch race cards: 502");
  });

  it("provides refetch function that reloads data", async () => {
    let callCount = 0;
    vi.mocked(fetch).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockMeetings, meta: {} }),
      } as Response);
    });

    const { result } = renderHook(() => useRaceCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(callCount).toBe(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(callCount).toBe(2);
  });

  it("handles API error response with error object", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { code: "UPSTREAM_ERROR", message: "API down" } }),
    } as Response);

    const { result } = renderHook(() => useRaceCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toBe("API down");
  });
});
