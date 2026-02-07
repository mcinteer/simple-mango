import type { Meeting } from "@/types/race";
import type {
  PuntingformMeetingListItem,
  PuntingformMeetingDetail,
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

async function apiFetch<T>(path: string): Promise<T> {
  const { apiKey, baseUrl } = getConfig();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new PuntingformApiError(
      `Puntingform API error: ${res.status} ${res.statusText}`,
      res.status
    );
  }

  return res.json() as Promise<T>;
}

/**
 * Fetch today's meetings list from Puntingform.
 */
export async function fetchMeetingsList(): Promise<Meeting[]> {
  const items = await apiFetch<PuntingformMeetingListItem[]>("/meetingslist");

  // For each meeting, fetch full detail with races/runners
  const meetings: Meeting[] = await Promise.all(
    items.map(async (item) => {
      const detail = await apiFetch<PuntingformMeetingDetail>(
        `/v2/form/results?meetingId=${item.meetingId}`
      );
      return {
        meetingId: detail.meetingId,
        meetingName: detail.meetingName,
        location: detail.location,
        meetingDate: detail.meetingDate,
        raceType: detail.raceType,
        races: detail.races.map((r) => ({
          raceId: r.raceId,
          raceNumber: r.raceNumber,
          raceName: r.raceName,
          raceTime: r.raceTime,
          distance: r.distance,
          raceType: r.raceType,
          trackCondition: r.trackCondition,
          runners: r.runners.map((run) => ({
            runnerId: run.runnerId,
            runnerName: run.runnerName,
            barrier: run.barrier,
            jockey: run.jockey,
            trainer: run.trainer,
            weight: run.weight,
            fixedOdds: run.fixedOdds,
            flucs: run.flucs,
            form: run.form,
            silkUrl: run.silkUrl,
          })),
        })),
      };
    })
  );

  return meetings;
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
