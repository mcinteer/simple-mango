/**
 * Racing data types for Puntingform API integration.
 * Matches Puntingform data shape with camelCase field naming.
 */

export interface Runner {
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

export interface Race {
  raceId: string;
  raceNumber: number;
  raceName: string;
  raceTime: string;
  distance: number;
  raceType: string;
  trackCondition?: string;
  runners: Runner[];
}

export interface Meeting {
  meetingId: string;
  meetingName: string;
  location: string;
  meetingDate: string;
  raceType: string;
  races: Race[];
}

export interface CachedMeetings {
  fetchedAt: string;
  data: Meeting[];
}
