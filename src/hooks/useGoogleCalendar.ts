"use client";

import { useCallback, useEffect, useState } from "react";
import { monthGridDays } from "@/lib/dates";
import { getCached, setCached, clearCachedPrefix } from "@/lib/queryCache";
import type { CalendarEvent } from "@/lib/google/calendar";

export type CalendarStatus =
  | "loading"
  | "connected"
  | "disconnected"
  | "needs-reconnect";

type VisibleMonth = { year: number; month: number }; // month is 0-indexed

function currentMonth(): VisibleMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

// UTC bounds covering the full visible grid, so events spilling in from the
// adjacent months (leading/trailing cells) are fetched too.
function gridRange(m: VisibleMonth): { start: string; end: string } {
  const days = monthGridDays(m.year, m.month);
  const start = days[0];
  const end = new Date(days[days.length - 1]);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

const STATUS_CACHE_KEY = "google:status";
type CachedStatus = { status: CalendarStatus; email: string | null };

function eventsCacheKey(m: VisibleMonth): string {
  return `google:events:${m.year}-${m.month}`;
}

export function useGoogleCalendar() {
  const cachedStatus = getCached<CachedStatus>(STATUS_CACHE_KEY);
  const [status, setStatus] = useState<CalendarStatus>(cachedStatus?.status ?? "loading");
  const [email, setEmail] = useState<string | null>(cachedStatus?.email ?? null);
  const [visibleMonth, setVisibleMonth] = useState<VisibleMonth>(currentMonth);
  // Events fetched by the effect below, for months not already cached.
  const [fetchedEvents, setFetchedEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  // A cache hit for the visible month is read straight from the cache during
  // render (no setState needed); a miss falls back to `fetchedEvents`.
  const events =
    getCached<CalendarEvent[]>(eventsCacheKey(visibleMonth)) ?? fetchedEvents;

  // Initial connection status — skipped once cached from a previous mount.
  useEffect(() => {
    if (getCached<CachedStatus>(STATUS_CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function loadStatus() {
      try {
        const res = await fetch("/api/google/status");
        const data = await res.json();
        if (cancelled) return;
        let next: CachedStatus;
        if (!data.connected) {
          next = { status: "disconnected", email: null };
        } else if (data.needsReconnect) {
          next = { status: "needs-reconnect", email: data.email ?? null };
        } else {
          next = { status: "connected", email: data.email ?? null };
        }
        setStatus(next.status);
        setEmail(next.email);
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

  // Fetch events for the visible month whenever it changes while connected,
  // skipping months already cached from a previous mount of this tab.
  useEffect(() => {
    if (status !== "connected") return;
    const key = eventsCacheKey(visibleMonth);
    if (getCached<CalendarEvent[]>(key) !== undefined) return;
    let cancelled = false;
    async function loadEvents() {
      setEventsLoading(true);
      const { start, end } = gridRange(visibleMonth);
      try {
        const res = await fetch(
          `/api/calendar/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
        );
        if (res.status === 409) {
          const data = await res.json();
          if (!cancelled) {
            const nextStatus: CalendarStatus = data.needsReconnect
              ? "needs-reconnect"
              : "disconnected";
            setStatus(nextStatus);
            setCached(STATUS_CACHE_KEY, { status: nextStatus, email });
            setFetchedEvents([]);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setFetchedEvents(data.events ?? []);
          setCached(key, data.events ?? []);
        }
      } catch {
        if (!cancelled) setFetchedEvents([]);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    }
    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [status, visibleMonth, email]);

  const connect = useCallback(() => {
    window.location.href = "/api/google/connect";
  }, []);

  const disconnect = useCallback(async () => {
    await fetch("/api/google/disconnect", { method: "POST" });
    setStatus("disconnected");
    setEmail(null);
    setFetchedEvents([]);
    setCached(STATUS_CACHE_KEY, { status: "disconnected", email: null });
    clearCachedPrefix("google:events:");
  }, []);

  const refresh = useCallback(async () => {
    if (status !== "connected") return;
    const key = eventsCacheKey(visibleMonth);
    setEventsLoading(true);
    const { start, end } = gridRange(visibleMonth);
    try {
      const res = await fetch(
        `/api/calendar/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
      );
      if (res.status === 409) {
        const data = await res.json();
        const nextStatus: CalendarStatus = data.needsReconnect
          ? "needs-reconnect"
          : "disconnected";
        setStatus(nextStatus);
        setCached(STATUS_CACHE_KEY, { status: nextStatus, email });
        setFetchedEvents([]);
        return;
      }
      const data = await res.json();
      setFetchedEvents(data.events ?? []);
      setCached(key, data.events ?? []);
    } catch {
      setFetchedEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [status, visibleMonth, email]);

  const goToMonth = useCallback((delta: number) => {
    setVisibleMonth((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  const goToday = useCallback(() => setVisibleMonth(currentMonth()), []);

  return {
    status,
    email,
    events,
    eventsLoading,
    visibleMonth,
    connect,
    disconnect,
    refresh,
    goToMonth,
    goToday,
  };
}
