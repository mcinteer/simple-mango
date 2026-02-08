"use client";

import type { Meeting } from "@/types/race";

interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
}

/**
 * Format start time as local HH:MM (24-hour).
 */
function formatStartTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Get the start time of the first race, or null if no races loaded.
 */
function getFirstRaceTime(meeting: Meeting): string | null {
  if (!meeting.races || meeting.races.length === 0) {
    return null;
  }
  const sortedRaces = [...meeting.races].sort((a, b) => a.raceNumber - b.raceNumber);
  return formatStartTime(sortedRaces[0].raceTime);
}

export function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const firstRaceTime = getFirstRaceTime(meeting);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 
                 hover:border-amber-500/50 hover:bg-zinc-800 
                 transition-all duration-200 cursor-pointer
                 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{meeting.trackName}</h3>
          <p className="text-sm text-zinc-400">{meeting.raceType}</p>
        </div>
        <div className="text-right">
          {firstRaceTime ? (
            <>
              <p className="text-lg font-mono text-amber-500">{firstRaceTime}</p>
              <p className="text-xs text-zinc-500">{meeting.races.length} races</p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">TBA</p>
          )}
        </div>
      </div>
    </button>
  );
}
