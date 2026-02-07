import { getDb } from "./client";
import type { Meeting, CachedMeetings } from "@/types/race";

const COLLECTION = "racingContext";
const TTL_MS = 3_600_000; // 1 hour

interface RacingContextDoc {
  date: string;
  fetchedAt: string;
  data: Meeting[];
}

/**
 * Get cached meetings for a given date.
 * Returns null if no cache exists or cache is expired.
 * Returns { data, fetchedAt, stale: true } if cache is expired but data exists.
 */
export async function getCachedMeetings(
  date: string
): Promise<{ meetings: CachedMeetings; stale: boolean } | null> {
  const db = await getDb();
  const doc = await db
    .collection<RacingContextDoc>(COLLECTION)
    .findOne({ date });

  if (!doc) return null;

  const age = Date.now() - Date.parse(doc.fetchedAt);
  const stale = age >= TTL_MS;

  return {
    meetings: { fetchedAt: doc.fetchedAt, data: doc.data },
    stale,
  };
}

/**
 * Upsert cached meetings for a given date.
 */
export async function saveMeetingsCache(
  date: string,
  data: Meeting[]
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.collection<RacingContextDoc>(COLLECTION).updateOne(
    { date },
    { $set: { date, fetchedAt: now, data } },
    { upsert: true }
  );
}
