"use client";

import { useCallback, useEffect, useState } from "react";
import { monthGridDays } from "@/lib/dates";
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

export function useGoogleCalendar() {
  const [status, setStatus] = useState<CalendarStatus>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<VisibleMonth>(currentMonth);

  // Initial connection status.
  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      try {
        const res = await fetch("/api/google/status");
        const data = await res.json();
        if (cancelled) return;
        if (!data.connected) {
          setStatus("disconnected");
        } else if (data.needsReconnect) {
          setStatus("needs-reconnect");
          setEmail(data.email ?? null);
        } else {
          setStatus("connected");
          setEmail(data.email ?? null);
        }
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    }
    loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch events for the visible month whenever it changes while connected.
  useEffect(() => {
    if (status !== "connected") return;
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
            setStatus(data.needsReconnect ? "needs-reconnect" : "disconnected");
            setEvents([]);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) setEvents(data.events ?? []);
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    }
    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [status, visibleMonth]);

  const connect = useCallback(() => {
    window.location.href = "/api/google/connect";
  }, []);

  const disconnect = useCallback(async () => {
    await fetch("/api/google/disconnect", { method: "POST" });
    setStatus("disconnected");
    setEmail(null);
    setEvents([]);
  }, []);

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
    goToMonth,
    goToday,
  };
}
