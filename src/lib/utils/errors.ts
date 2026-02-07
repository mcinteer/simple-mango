import { NextResponse } from "next/server";
import type { ApiError, ApiSuccess } from "@/types/api";

/**
 * Create a standardised JSON error response.
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: { code, message } },
    { status }
  );
}

/**
 * Create a standardised JSON success response.
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, unknown>
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}
