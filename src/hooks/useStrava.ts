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

type ActivitiesState = {
  activities: StravaActivity[];
  page: number;
  hasMore: boolean;
};

const EMPTY_ACTIVITIES: ActivitiesState = { activities: [], page: 0, hasMore: true };

type ActivitiesResult =
  | { ok: true; activities: StravaActivity[]; hasMore: boolean }
  | { ok: false; needsReconnect: boolean };

async function fetchActivitiesPage(page: number): Promise<ActivitiesResult> {
  const res = await fetch(`/api/strava/activities?page=${page}`);
  if (res.status === 409) {
    const data = await res.json();
    return { ok: false, needsReconnect: !!data.needsReconnect };
  }
  const data = await res.json();
  return { ok: true, activities: data.activities ?? [], hasMore: !!data.hasMore };
}

export function useStrava() {
  const cachedStatus = getCached<CachedStatus>(STATUS_CACHE_KEY);
  const [status, setStatus] = useState<StravaStatus>(cachedStatus?.status ?? "loading");
  const [athleteName, setAthleteName] = useState<string | null>(
    cachedStatus?.athleteName ?? null
  );

  const cachedActivities = getCached<ActivitiesState>(ACTIVITIES_CACHE_KEY);
  const [activitiesState, setActivitiesState] = useState<ActivitiesState>(
    cachedActivities ?? EMPTY_ACTIVITIES
  );
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Fetch the first page once connected, skipping if already cached from a
  // previous mount of this tab.
  useEffect(() => {
    if (status !== "connected") return;
    if (getCached<ActivitiesState>(ACTIVITIES_CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function loadFirstPage() {
      setActivitiesLoading(true);
      try {
        const result = await fetchActivitiesPage(1);
        if (cancelled) return;
        if (!result.ok) {
          const nextStatus: StravaStatus = result.needsReconnect
            ? "needs-reconnect"
            : "disconnected";
          setStatus(nextStatus);
          setCached(STATUS_CACHE_KEY, { status: nextStatus, athleteName });
          return;
        }
        const next: ActivitiesState = {
          activities: result.activities,
          page: 1,
          hasMore: result.hasMore,
        };
        setActivitiesState(next);
        setCached(ACTIVITIES_CACHE_KEY, next);
      } catch {
        if (!cancelled) setActivitiesState(EMPTY_ACTIVITIES);
      } finally {
        if (!cancelled) setActivitiesLoading(false);
      }
    }
    loadFirstPage();
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
    setActivitiesState(EMPTY_ACTIVITIES);
    setCached(STATUS_CACHE_KEY, { status: "disconnected", athleteName: null });
    clearCachedPrefix(ACTIVITIES_CACHE_KEY);
  }, []);

  const refresh = useCallback(async () => {
    clearCachedPrefix(ACTIVITIES_CACHE_KEY);
    setActivitiesLoading(true);
    try {
      const result = await fetchActivitiesPage(1);
      if (!result.ok) {
        const nextStatus: StravaStatus = result.needsReconnect
          ? "needs-reconnect"
          : "disconnected";
        setStatus(nextStatus);
        setCached(STATUS_CACHE_KEY, { status: nextStatus, athleteName });
        return;
      }
      const next: ActivitiesState = {
        activities: result.activities,
        page: 1,
        hasMore: result.hasMore,
      };
      setActivitiesState(next);
      setCached(ACTIVITIES_CACHE_KEY, next);
    } catch {
      setActivitiesState(EMPTY_ACTIVITIES);
    } finally {
      setActivitiesLoading(false);
    }
  }, [athleteName]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !activitiesState.hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = activitiesState.page + 1;
      const result = await fetchActivitiesPage(nextPage);
      if (!result.ok) {
        const nextStatus: StravaStatus = result.needsReconnect
          ? "needs-reconnect"
          : "disconnected";
        setStatus(nextStatus);
        setCached(STATUS_CACHE_KEY, { status: nextStatus, athleteName });
        return;
      }
      const next: ActivitiesState = {
        activities: [...activitiesState.activities, ...result.activities],
        page: nextPage,
        hasMore: result.hasMore,
      };
      setActivitiesState(next);
      setCached(ACTIVITIES_CACHE_KEY, next);
    } finally {
      setLoadingMore(false);
    }
  }, [activitiesState, athleteName, loadingMore]);

  return {
    status,
    activities: activitiesState.activities,
    hasMore: activitiesState.hasMore,
    activitiesLoading,
    loadingMore,
    connect,
    disconnect,
    refresh,
    loadMore,
  };
}
