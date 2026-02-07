import { describe, it, expect } from "vitest";
import { createErrorResponse, createSuccessResponse } from "./errors";

describe("createErrorResponse", () => {
  it("returns JSON with error shape and correct status", async () => {
    const res = createErrorResponse("NOT_FOUND", "Thing missing", 404);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({
      error: { code: "NOT_FOUND", message: "Thing missing" },
    });
  });
});

describe("createSuccessResponse", () => {
  it("returns JSON with data and no meta when omitted", async () => {
    const res = createSuccessResponse({ id: 1 });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { id: 1 } });
  });

  it("includes meta when provided", async () => {
    const res = createSuccessResponse([1, 2], { cached: true });
    const body = await res.json();
    expect(body).toEqual({ data: [1, 2], meta: { cached: true } });
  });
});
