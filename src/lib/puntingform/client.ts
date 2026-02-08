import type { Meeting } from "@/types/race";
import type {
  PuntingformApiResponse,
  PuntingformMeetingListItem,
} from "./types";

const DEFAULT_BASE_URL = "https://api.puntingform.com.au";

function getConfig() {
  const apiKey = process.env.PUNTINGFORM_API_KEY;
  const baseUrl = process.env.PUNTINGFORM_BASE_URL || DEFAULT_BASE_URL;

  if (!apiKey) {
    throw new Error(
      'Missing environment variable: "PUNTINGFORM_API_KEY"'
    );
  }

  return { apiKey, baseUrl };
}

async function apiFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const { apiKey, baseUrl } = getConfig();
  const url = new URL(path, baseUrl);
  url.searchParams.set("apiKey", apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new PuntingformApiError(
      `Puntingform API error: ${res.status} ${res.statusText}`,
      res.status
    );
  }

  const body = (await res.json()) as PuntingformApiResponse<T>;

  if (body.statusCode !== 200) {
    throw new PuntingformApiError(
      body.error || `Puntingform API error: status ${body.statusCode}`,
      body.statusCode
    );
  }

  return body.payLoad;
}

/**
 * Fetch today's meetings list from Puntingform.
 */
export async function fetchMeetingsList(date?: string): Promise<Meeting[]> {
  const meetingDate = date || new Date().toISOString().split("T")[0];

  const items = await apiFetch<PuntingformMeetingListItem[]>(
    "/v2/form/meetingslist",
    { meetingDate }
  );

  // Map raw API shape to internal Meeting type (without race detail for now)
  return items.map((item) => ({
    meetingId: item.meetingId,
    trackName: item.track.name,
    state: item.track.state,
    meetingDate: item.meetingDate,
    raceType: item.track.location,
    races: [],
  }));
}

export class PuntingformApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "PuntingformApiError";
  }
}
