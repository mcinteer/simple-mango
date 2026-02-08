import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMeetingsWithCache } from "./cache";

// Mock dependencies
vi.mock("@/lib/db/racing-context", () => ({
  getCachedMeetings: vi.fn(),
  saveMeetingsCache: vi.fn(),
}));

vi.mock("./client", () => ({
  fetchMeetingsList: vi.fn(),
}));

import { getCachedMeetings, saveMeetingsCache } from "@/lib/db/racing-context";
import { fetchMeetingsList } from "./client";

const DATE = "2026-02-07";
const MEETINGS = [{ meetingId: "m1", meetingName: "Test", location: "X", meetingDate: DATE, raceType: "R", races: [] }];

describe("getMeetingsWithCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fresh cached data without calling API", async () => {
    vi.mocked(getCachedMeetings).mockResolvedValue({
      meetings: { fetchedAt: new Date().toISOString(), data: MEETINGS },
      stale: false,
    });

    const result = await getMeetingsWithCache(DATE);

    expect(result.cached).toBe(true);
    expect(result.data).toEqual(MEETINGS);
    expect(result.stale).toBeUndefined();
    expect(fetchMeetingsList).not.toHaveBeenCalled();
  });

  it("fetches from API and saves when cache is stale", async () => {
    vi.mocked(getCachedMeetings).mockResolvedValue({
      meetings: { fetchedAt: "2026-02-07T00:00:00.000Z", data: MEETINGS },
      stale: true,
    });
    vi.mocked(fetchMeetingsList).mockResolvedValue(MEETINGS);
    vi.mocked(saveMeetingsCache).mockResolvedValue();

    const result = await getMeetingsWithCache(DATE);

    expect(fetchMeetingsList).toHaveBeenCalledWith(DATE);
    expect(saveMeetingsCache).toHaveBeenCalledWith(DATE, MEETINGS);
    expect(result.cached).toBe(false);
  });

  it("fetches from API when no cache exists", async () => {
    vi.mocked(getCachedMeetings).mockResolvedValue(null);
    vi.mocked(fetchMeetingsList).mockResolvedValue(MEETINGS);
    vi.mocked(saveMeetingsCache).mockResolvedValue();

    const result = await getMeetingsWithCache(DATE);

    expect(fetchMeetingsList).toHaveBeenCalledWith(DATE);
    expect(result.cached).toBe(false);
    expect(result.data).toEqual(MEETINGS);
  });

  it("returns stale data when API fails and stale cache exists", async () => {
    vi.mocked(getCachedMeetings).mockResolvedValue({
      meetings: { fetchedAt: "2026-02-07T00:00:00.000Z", data: MEETINGS },
      stale: true,
    });
    vi.mocked(fetchMeetingsList).mockRejectedValue(new Error("API down"));

    const result = await getMeetingsWithCache(DATE);

    expect(result.cached).toBe(true);
    expect(result.stale).toBe(true);
    expect(result.data).toEqual(MEETINGS);
  });

  it("throws when API fails and no cache exists", async () => {
    vi.mocked(getCachedMeetings).mockResolvedValue(null);
    vi.mocked(fetchMeetingsList).mockRejectedValue(new Error("API down"));

    await expect(getMeetingsWithCache(DATE)).rejects.toThrow("API down");
  });
});
