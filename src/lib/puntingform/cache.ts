import { getCachedMeetings, saveMeetingsCache } from "@/lib/db/racing-context";
import { fetchMeetingsList } from "./client";
import type { Meeting } from "@/types/race";

interface CacheResult {
  data: Meeting[];
  cached: boolean;
  fetchedAt: string;
  stale?: boolean;
}

/**
 * Get meetings with cache-first strategy.
 * 1. Check cache — return if valid
 * 2. Fetch from API — save to cache and return
 * 3. On API failure — return stale cache if available, else throw
 */
export async function getMeetingsWithCache(
  date: string
): Promise<CacheResult> {
  const cached = await getCachedMeetings(date);

  // Cache hit — fresh data
  if (cached && !cached.stale) {
    return {
      data: cached.meetings.data,
      cached: true,
      fetchedAt: cached.meetings.fetchedAt,
    };
  }

  // Cache miss or stale — try API
  try {
    const data = await fetchMeetingsList(date);
    await saveMeetingsCache(date, data);

    return {
      data,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    // API failed — return stale data if we have it
    if (cached) {
      return {
        data: cached.meetings.data,
        cached: true,
        fetchedAt: cached.meetings.fetchedAt,
        stale: true,
      };
    }

    // No cache at all — rethrow
    throw err;
  }
}
