"use client";

import { formatEventTime, localDateKey, monthGridDays } from "@/lib/dates";
import type { CalendarEvent } from "@/lib/google/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS = 3;

type CalendarMonthProps = {
  year: number;
  month: number; // 0-indexed
  events: CalendarEvent[];
};

// Bucket events by their local day key. Timed events key off their start
// datetime; all-day events already carry a "YYYY-MM-DD" start (placed on the
// start day for v1 — multi-day spanning is a later enhancement).
function bucketByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const key = ev.allDay ? ev.start : localDateKey(new Date(ev.start));
    const list = map.get(key);
    if (list) list.push(ev);
    else map.set(key, [ev]);
  }
  return map;
}

export default function CalendarMonth({
  year,
  month,
  events,
}: CalendarMonthProps) {
  const days = monthGridDays(year, month);
  const byDay = bucketByDay(events);
  const todayKey = localDateKey(new Date());

  return (
    <div className="cal-grid" role="grid" aria-label="Month view">
      {WEEKDAYS.map((w) => (
        <div key={w} className="cal-weekday" role="columnheader">
          {w}
        </div>
      ))}

      {days.map((day) => {
        const key = localDateKey(day);
        const dayEvents = byDay.get(key) ?? [];
        const outside = day.getMonth() !== month;
        const isToday = key === todayKey;
        const shown = dayEvents.slice(0, MAX_CHIPS);
        const overflow = dayEvents.length - shown.length;

        return (
          <div
            key={key}
            role="gridcell"
            className={`cal-day${outside ? " cal-outside" : ""}${
              isToday ? " cal-today" : ""
            }`}
          >
            <span className="cal-daynum">{day.getDate()}</span>
            <div className="cal-events">
              {shown.map((ev) => (
                <div
                  key={ev.id}
                  className={`cal-event${ev.allDay ? " cal-event-allday" : ""}`}
                  title={
                    ev.allDay
                      ? ev.title
                      : `${formatEventTime(ev.start)} ${ev.title}`
                  }
                >
                  {ev.allDay ? (
                    <span className="cal-dot">•</span>
                  ) : (
                    <span className="cal-time">{formatEventTime(ev.start)}</span>
                  )}
                  <span className="cal-event-title">{ev.title}</span>
                </div>
              ))}
              {overflow > 0 && (
                <div className="cal-more">+{overflow} more</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
