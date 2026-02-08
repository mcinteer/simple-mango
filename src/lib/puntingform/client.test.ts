import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMeetingsList, PuntingformApiError } from "./client";

const MOCK_ENV = {
  PUNTINGFORM_API_KEY: "test-key-123",
  PUNTINGFORM_BASE_URL: "https://api.test.com",
};

function mockApiResponse<T>(payLoad: T) {
  return {
    statusCode: 200,
    status: 0,
    error: null,
    errors: null,
    payLoad,
    processTime: 25,
    timeStamp: "2026-02-08T12:00:00Z",
  };
}

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

  it("sends apiKey as query param, not auth header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse([])),
    });
    vi.stubGlobal("fetch", mockFetch);

    await fetchMeetingsList("2026-02-08");

    const calledUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(calledUrl.searchParams.get("apiKey")).toBe("test-key-123");
    expect(calledUrl.searchParams.get("meetingDate")).toBe("2026-02-08");
    // No Authorization header
    const headers = mockFetch.mock.calls[0][1]?.headers;
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("throws PuntingformApiError on non-2xx HTTP response", async () => {
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

  it("throws PuntingformApiError when API returns non-200 statusCode in body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            statusCode: 401,
            status: 3,
            error: "The API Key or Access Token is missing or invalid.",
            payLoad: null,
          }),
      })
    );

    await expect(fetchMeetingsList()).rejects.toThrow(PuntingformApiError);
  });

  it("maps raw API response to Meeting type", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve(
            mockApiResponse([
              {
                meetingId: "237174",
                track: {
                  name: "Port Macquarie",
                  trackId: "98",
                  location: "C",
                  state: "NSW",
                  country: "AUS",
                  abbrev: "P MQ",
                  surface: "Turf",
                },
                meetingDate: "2026-02-08T00:00:00",
                tabMeeting: true,
                railPosition: "+3m Entire",
                stage: "A",
                isBarrierTrial: false,
                isJumps: false,
                formUpdated: "2026-02-08T11:07:47",
              },
            ])
          ),
      })
    );

    const result = await fetchMeetingsList("2026-02-08");

    expect(result).toEqual([
      {
        meetingId: "237174",
        meetingName: "Port Macquarie",
        location: "NSW, AUS",
        meetingDate: "2026-02-08T00:00:00",
        raceType: "C",
        races: [],
      },
    ]);
  });
});
