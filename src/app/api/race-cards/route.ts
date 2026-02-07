import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getMeetingsWithCache } from "@/lib/puntingform/cache";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils/errors";

export async function GET() {
  // Auth check
  const session = await getServerSession(authOptions);
  if (!session) {
    return createErrorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  // Today's date as cache key (ISO date portion)
  const date = new Date().toISOString().split("T")[0];

  try {
    const result = await getMeetingsWithCache(date);

    return createSuccessResponse(result.data, {
      cached: result.cached,
      fetchedAt: result.fetchedAt,
      ...(result.stale ? { stale: true } : {}),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown upstream error";
    return createErrorResponse("UPSTREAM_ERROR", message, 502);
  }
}
