"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Meeting } from "@/types/race";

interface UseRaceCardsResult {
  meetings: Meeting[];
  meetingsByState: Record<string, Meeting[]>;
  sortedStateKeys: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Preferred state ordering for Australian racing.
 * VIC and NSW are the primary racing states.
 */
const STATE_ORDER = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "ACT", "NT", "Other"];

/**
 * Group meetings by state.
 */
function groupByState(meetings: Meeting[]): Record<string, Meeting[]> {
  return meetings.reduce<Record<string, Meeting[]>>((acc, meeting) => {
    const state = meeting.state || "Other";
    if (!acc[state]) acc[state] = [];
    acc[state].push(meeting);
    return acc;
  }, {});
}

/**
 * Sort state keys by preferred order.
 */
function sortStateKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const indexA = STATE_ORDER.indexOf(a);
    const indexB = STATE_ORDER.indexOf(b);
    // Unknown states go to end
    const orderA = indexA === -1 ? STATE_ORDER.length : indexA;
    const orderB = indexB === -1 ? STATE_ORDER.length : indexB;
    return orderA - orderB;
  });
}

/**
 * Hook to fetch and manage race card data.
 * Fetches from /api/race-cards and provides grouped/sorted meetings.
 */
export function useRaceCards(): UseRaceCardsResult {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(async () => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/race-cards", { signal: controller.signal });

      if (!res.ok) {
        // Try to parse error body, but don't crash on non-JSON responses
        let message = `Failed to fetch race cards: ${res.status} ${res.statusText}`;
        try {
          const body = await res.json();
          if (body.error?.message) message = body.error.message;
        } catch {
          // Non-JSON error response — use default message
        }
        throw new Error(message);
      }

      const body = await res.json();
      if (!controller.signal.aborted) {
        setMeetings(body.data || []);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setMeetings([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refetch();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [refetch]);

  const meetingsByState = useMemo(() => groupByState(meetings), [meetings]);
  const sortedStateKeys = useMemo(
    () => sortStateKeys(Object.keys(meetingsByState)),
    [meetingsByState]
  );

  return {
    meetings,
    meetingsByState,
    sortedStateKeys,
    isLoading,
    error,
    refetch,
  };
}
