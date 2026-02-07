/**
 * Raw Puntingform API response types.
 * These map to the external API shape before transformation to internal types.
 */

export interface PuntingformMeetingListItem {
  meetingId: string;
  meetingName: string;
  location: string;
  meetingDate: string;
  raceType: string;
}

export interface PuntingformRunner {
  runnerId: string;
  runnerName: string;
  barrier: number;
  jockey: string;
  trainer: string;
  weight: number;
  fixedOdds?: number;
  flucs?: number[];
  form?: string;
  silkUrl?: string;
}

export interface PuntingformRace {
  raceId: string;
  raceNumber: number;
  raceName: string;
  raceTime: string;
  distance: number;
  raceType: string;
  trackCondition?: string;
  runners: PuntingformRunner[];
}

export interface PuntingformMeetingDetail {
  meetingId: string;
  meetingName: string;
  location: string;
  meetingDate: string;
  raceType: string;
  races: PuntingformRace[];
}
