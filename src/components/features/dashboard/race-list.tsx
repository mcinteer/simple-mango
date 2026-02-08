"use client";

import { useRaceCards } from "./use-race-cards";
import { StateGroup } from "./state-group";
import { DashboardSkeleton } from "./meeting-skeleton";
import { Button } from "@/components/ui";

export function RaceList() {
  const { meetingsByState, sortedStateKeys, isLoading, error, refetch } = useRaceCards();

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-lg font-semibold">Error Loading Meetings</p>
          <p className="text-sm text-zinc-400 mt-1">{error.message}</p>
        </div>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  // Empty state
  if (sortedStateKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-zinc-400 text-lg">No meetings scheduled for today</p>
      </div>
    );
  }

  // Success state - render grouped meetings
  return (
    <div className="space-y-6">
      {sortedStateKeys.map((state) => (
        <StateGroup
          key={state}
          stateName={state}
          meetings={meetingsByState[state]}
        />
      ))}
    </div>
  );
}
