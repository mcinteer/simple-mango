"use client";

import type { Meeting } from "@/types/race";
import { MeetingCard } from "./meeting-card";

interface StateGroupProps {
  stateName: string;
  meetings: Meeting[];
  onMeetingClick?: (meeting: Meeting) => void;
}

export function StateGroup({ stateName, meetings, onMeetingClick }: StateGroupProps) {
  return (
    <section
      role="region"
      aria-label={`${stateName} meetings`}
      className="mb-6"
    >
      <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-zinc-700">
        {stateName}
      </h2>

      {meetings.length === 0 ? (
        <p className="text-zinc-500 italic">No meetings scheduled</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.meetingId}
              meeting={meeting}
              onClick={() => onMeetingClick?.(meeting)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
