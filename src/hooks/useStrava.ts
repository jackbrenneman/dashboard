"use client";

import { useCallback, useEffect, useState } from "react";
import { getCached, setCached, clearCachedPrefix } from "@/lib/queryCache";
import type { StravaActivity } from "@/lib/strava/activities";

export type StravaStatus =
  | "loading"
  | "connected"
  | "disconnected"
  | "needs-reconnect";

const STATUS_CACHE_KEY = "strava:status";
const ACTIVITIES_CACHE_KEY = "strava:activities";

type CachedStatus = { status: StravaStatus; athleteName: string | null };

type ActivitiesResult =
  | { ok: true; activities: StravaActivity[] }
  | { ok: false; needsReconnect: boolean };

async function fetchActivities(): Promise<ActivitiesResult> {
  const res = await fetch("/api/strava/activities");
  if (res.status === 409) {
    const data = await res.json();
    return { ok: false, needsReconnect: !!data.needsReconnect };
  }
  const data = await res.json();
  return { ok: true, activities: data.activities ?? [] };
}

export function useStrava() {
  const cachedStatus = getCached<CachedStatus>(STATUS_CACHE_KEY);
  const [status, setStatus] = useState<StravaStatus>(cachedStatus?.status ?? "loading");
  const [athleteName, setAthleteName] = useState<string | null>(
    cachedStatus?.athleteName ?? null
  );
  const [fetchedActivities, setFetchedActivities] = useState<StravaActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const activities =
    getCached<StravaActivity[]>(ACTIVITIES_CACHE_KEY) ?? fetchedActivities;

  // Initial connection status — skipped once cached from a previous mount.
  useEffect(() => {
    if (getCached<CachedStatus>(STATUS_CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function loadStatus() {
      try {
        const res = await fetch("/api/strava/status");
        const data = await res.json();
        if (cancelled) return;
        let next: CachedStatus;
        if (!data.connected) {
          next = { status: "disconnected", athleteName: null };
        } else if (data.needsReconnect) {
          next = { status: "needs-reconnect", athleteName: data.athleteName ?? null };
        } else {
          next = { status: "connected", athleteName: data.athleteName ?? null };
        }
        setStatus(next.status);
        setAthleteName(next.athleteName);
        setCached(STATUS_CACHE_KEY, next);
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    }
    loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch activities once connected, skipping if already cached from a
  // previous mount of this tab.
  useEffect(() => {
    if (status !== "connected") return;
    if (getCached<StravaActivity[]>(ACTIVITIES_CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function loadActivities() {
      setActivitiesLoading(true);
      try {
        const result = await fetchActivities();
        if (cancelled) return;
        if (!result.ok) {
          const nextStatus: StravaStatus = result.needsReconnect
            ? "needs-reconnect"
            : "disconnected";
          setStatus(nextStatus);
          setCached(STATUS_CACHE_KEY, { status: nextStatus, athleteName });
          setFetchedActivities([]);
          return;
        }
        setFetchedActivities(result.activities);
        setCached(ACTIVITIES_CACHE_KEY, result.activities);
      } catch {
        if (!cancelled) setFetchedActivities([]);
      } finally {
        if (!cancelled) setActivitiesLoading(false);
      }
    }
    loadActivities();
    return () => {
      cancelled = true;
    };
  }, [status, athleteName]);

  const connect = useCallback(() => {
    window.location.href = "/api/strava/connect";
  }, []);

  const disconnect = useCallback(async () => {
    await fetch("/api/strava/disconnect", { method: "POST" });
    setStatus("disconnected");
    setAthleteName(null);
    setFetchedActivities([]);
    setCached(STATUS_CACHE_KEY, { status: "disconnected", athleteName: null });
    clearCachedPrefix(ACTIVITIES_CACHE_KEY);
  }, []);

  const refresh = useCallback(async () => {
    clearCachedPrefix(ACTIVITIES_CACHE_KEY);
    setActivitiesLoading(true);
    try {
      const result = await fetchActivities();
      if (!result.ok) {
        const nextStatus: StravaStatus = result.needsReconnect
          ? "needs-reconnect"
          : "disconnected";
        setStatus(nextStatus);
        setCached(STATUS_CACHE_KEY, { status: nextStatus, athleteName });
        setFetchedActivities([]);
        return;
      }
      setFetchedActivities(result.activities);
      setCached(ACTIVITIES_CACHE_KEY, result.activities);
    } catch {
      setFetchedActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, [athleteName]);

  return {
    status,
    athleteName,
    activities,
    activitiesLoading,
    connect,
    disconnect,
    refresh,
  };
}
