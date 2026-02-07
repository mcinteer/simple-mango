import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCachedMeetings, saveMeetingsCache } from "./racing-context";

// Mock the db client
const mockFindOne = vi.fn();
const mockUpdateOne = vi.fn();
const mockCollection = vi.fn(() => ({
  findOne: mockFindOne,
  updateOne: mockUpdateOne,
}));

vi.mock("./client", () => ({
  getDb: vi.fn(() => Promise.resolve({ collection: mockCollection })),
}));

const DATE = "2026-02-07";
const MEETINGS = [{ meetingId: "m1", meetingName: "Test", location: "X", meetingDate: DATE, raceType: "R", races: [] }];

describe("getCachedMeetings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no cached document exists", async () => {
    mockFindOne.mockResolvedValue(null);

    const result = await getCachedMeetings(DATE);

    expect(result).toBeNull();
    expect(mockCollection).toHaveBeenCalledWith("racingContext");
    expect(mockFindOne).toHaveBeenCalledWith({ date: DATE });
  });

  it("returns stale: false when cache is fresh (< 1 hour)", async () => {
    mockFindOne.mockResolvedValue({
      date: DATE,
      fetchedAt: new Date().toISOString(),
      data: MEETINGS,
    });

    const result = await getCachedMeetings(DATE);

    expect(result).not.toBeNull();
    expect(result!.stale).toBe(false);
    expect(result!.meetings.data).toEqual(MEETINGS);
  });

  it("returns stale: true when cache is expired (>= 1 hour)", async () => {
    const twoHoursAgo = new Date(Date.now() - 7_200_000).toISOString();
    mockFindOne.mockResolvedValue({
      date: DATE,
      fetchedAt: twoHoursAgo,
      data: MEETINGS,
    });

    const result = await getCachedMeetings(DATE);

    expect(result).not.toBeNull();
    expect(result!.stale).toBe(true);
  });
});

describe("saveMeetingsCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts into racingContext collection", async () => {
    mockUpdateOne.mockResolvedValue({});

    await saveMeetingsCache(DATE, MEETINGS);

    expect(mockCollection).toHaveBeenCalledWith("racingContext");
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { date: DATE },
      { $set: expect.objectContaining({ date: DATE, data: MEETINGS }) },
      { upsert: true }
    );
  });
});
