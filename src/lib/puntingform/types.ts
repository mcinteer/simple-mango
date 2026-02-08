/**
 * Raw Puntingform API response types — matched to actual API shape.
 */

export interface PuntingformApiResponse<T> {
  statusCode: number;
  status: number;
  error: string | null;
  errors: unknown;
  payLoad: T;
  processTime: number;
  timeStamp: string;
}

export interface PuntingformTrack {
  name: string;
  trackId: string;
  location: string;
  state: string;
  country: string;
  abbrev: string;
  surface: string | null;
}

export interface PuntingformMeetingListItem {
  meetingId: string;
  track: PuntingformTrack;
  meetingDate: string;
  tabMeeting: boolean;
  railPosition: string;
  stage: string;
  isBarrierTrial: boolean;
  isJumps: boolean;
  formUpdated: string | null;
  resultsUpdated: string | null;
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
  track: PuntingformTrack;
  meetingDate: string;
  races: PuntingformRace[];
}
