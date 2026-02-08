/**
 * Skeleton loading components for dashboard.
 * Uses Tailwind animate-pulse for loading animation.
 */

export function MeetingSkeleton() {
  return (
    <div
      data-testid="meeting-skeleton"
      className="animate-pulse bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          {/* Track name placeholder */}
          <div className="h-5 w-32 bg-zinc-700 rounded" />
          {/* Race type placeholder */}
          <div className="h-4 w-20 bg-zinc-700/50 rounded" />
        </div>
        <div className="text-right space-y-2">
          {/* Time placeholder */}
          <div className="h-5 w-16 bg-zinc-700 rounded ml-auto" />
          {/* Race count placeholder */}
          <div className="h-3 w-12 bg-zinc-700/50 rounded ml-auto" />
        </div>
      </div>
    </div>
  );
}

function StateGroupSkeleton() {
  return (
    <div data-testid="state-group-skeleton" className="mb-6">
      {/* State header placeholder */}
      <div className="h-7 w-16 bg-zinc-700 rounded mb-4" />
      
      {/* Meeting cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MeetingSkeleton />
        <MeetingSkeleton />
        <MeetingSkeleton />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StateGroupSkeleton />
      <StateGroupSkeleton />
      <StateGroupSkeleton />
    </div>
  );
}
