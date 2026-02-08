import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

// Mock dependencies
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth/config", () => ({
  authOptions: {},
}));

vi.mock("@/lib/puntingform/cache", () => ({
  getMeetingsWithCache: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { getMeetingsWithCache } from "@/lib/puntingform/cache";

const MEETINGS = [
  { meetingId: "m1", meetingName: "Test", location: "X", meetingDate: "2026-02-08", raceType: "R", races: [] },
];

describe("GET /api/race-cards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const res = await GET();

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
  });

  it("returns meetings data with meta when authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
    vi.mocked(getMeetingsWithCache).mockResolvedValue({
      data: MEETINGS,
      cached: true,
      fetchedAt: "2026-02-08T12:00:00.000Z",
    });

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      data: MEETINGS,
      meta: { cached: true, fetchedAt: "2026-02-08T12:00:00.000Z" },
    });
  });

  it("includes stale flag in meta when returning stale data", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
    vi.mocked(getMeetingsWithCache).mockResolvedValue({
      data: MEETINGS,
      cached: true,
      fetchedAt: "2026-02-08T10:00:00.000Z",
      stale: true,
    });

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.meta).toEqual({
      cached: true,
      fetchedAt: "2026-02-08T10:00:00.000Z",
      stale: true,
    });
  });

  it("returns 502 with UPSTREAM_ERROR when cache throws", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { email: "test@example.com" } });
    vi.mocked(getMeetingsWithCache).mockRejectedValue(new Error("Puntingform API down"));

    const res = await GET();

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body).toEqual({
      error: { code: "UPSTREAM_ERROR", message: "Puntingform API down" },
    });
  });
});
