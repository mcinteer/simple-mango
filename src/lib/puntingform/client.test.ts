import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMeetingsList, PuntingformApiError } from "./client";

const MOCK_ENV = {
  PUNTINGFORM_API_KEY: "test-key-123",
  PUNTINGFORM_BASE_URL: "https://api.test.com",
};

describe("Puntingform client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...MOCK_ENV };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("throws when PUNTINGFORM_API_KEY is missing", async () => {
    delete process.env.PUNTINGFORM_API_KEY;
    await expect(fetchMeetingsList()).rejects.toThrow(
      'Missing environment variable: "PUNTINGFORM_API_KEY"'
    );
  });

  it("sends Bearer auth header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchMeetingsList();

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.test.com/meetingslist",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key-123",
        }),
      })
    );
  });

  it("throws PuntingformApiError on non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
    );

    await expect(fetchMeetingsList()).rejects.toThrow(PuntingformApiError);
  });

  it("fetches meeting details for each meeting in list", async () => {
    const mockFetch = vi
      .fn()
      // First call: meetings list
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { meetingId: "m1", meetingName: "Randwick", location: "Sydney", meetingDate: "2026-02-07", raceType: "R" },
          ]),
      })
      // Second call: meeting detail
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            meetingId: "m1",
            meetingName: "Randwick",
            location: "Sydney",
            meetingDate: "2026-02-07",
            raceType: "R",
            races: [],
          }),
      });

    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchMeetingsList();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      "https://api.test.com/v2/form/results?meetingId=m1",
      expect.anything()
    );
    expect(result).toEqual([
      {
        meetingId: "m1",
        meetingName: "Randwick",
        location: "Sydney",
        meetingDate: "2026-02-07",
        raceType: "R",
        races: [],
      },
    ]);
  });
});
