// Google Calendar API — read-only event listing (server-side).
// Pulls events across every calendar in the account (not just "primary"),
// so calendars you've subscribed to — e.g. an Apple/iCloud calendar added
// via "Add by URL" in Google Calendar — show up here too.

const CALENDAR_LIST_ENDPOINT =
  "https://www.googleapis.com/calendar/v3/users/me/calendarList";
const CALENDAR_EVENTS_BASE = "https://www.googleapis.com/calendar/v3/calendars";

export type CalendarEvent = {
  id: string;
  title: string;
  // For timed events these are RFC3339 datetimes; for all-day events `start`
  // is a "YYYY-MM-DD" date and `end` is the exclusive end date Google returns.
  start: string;
  end: string;
  allDay: boolean;
  calendarId: string;
  calendarName: string;
  color?: string;
};

type CalendarListEntry = {
  id: string;
  name: string;
  color?: string;
};

type GoogleCalendarListItem = {
  id: string;
  summary?: string;
  backgroundColor?: string;
  selected?: boolean;
};

type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

// Every calendar visible in the account's calendar list, excluding ones the
// user has explicitly unchecked in Google Calendar's own sidebar (mirrors
// what they'd actually see there).
async function listCalendars(accessToken: string): Promise<CalendarListEntry[]> {
  const res = await fetch(CALENDAR_LIST_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Calendar list API ${res.status}: ${detail}`);
  }
  const data = (await res.json()) as { items?: GoogleCalendarListItem[] };
  return (data.items ?? [])
    .filter((c) => c.selected !== false)
    .map((c) => ({
      id: c.id,
      name: c.summary ?? c.id,
      color: c.backgroundColor,
    }));
}

async function fetchEventsForCalendar(
  accessToken: string,
  calendar: CalendarListEntry,
  timeMinISO: string,
  timeMaxISO: string
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMinISO,
    timeMax: timeMaxISO,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const res = await fetch(
    `${CALENDAR_EVENTS_BASE}/${encodeURIComponent(calendar.id)}/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );

  if (!res.ok) {
    // Don't let one inaccessible/stale calendar fail the whole month —
    // skip it and keep results from the rest.
    console.error(`Calendar API ${res.status} for calendar ${calendar.id}`);
    return [];
  }

  const data = (await res.json()) as { items?: GoogleEvent[] };
  return (data.items ?? [])
    .filter((e) => e.status !== "cancelled" && (e.start?.dateTime || e.start?.date))
    .map((e) => {
      const allDay = !e.start?.dateTime;
      return {
        // Google event IDs are only unique per-calendar; prefix so merged
        // results across calendars can't collide as React keys.
        id: `${calendar.id}:${e.id}`,
        title: e.summary?.trim() || "(no title)",
        start: (e.start?.dateTime ?? e.start?.date) as string,
        end: (e.end?.dateTime ?? e.end?.date ?? e.start?.dateTime ?? e.start?.date) as string,
        allDay,
        calendarId: calendar.id,
        calendarName: calendar.name,
        color: calendar.color,
      };
    });
}

export async function listAllEvents(
  accessToken: string,
  timeMinISO: string,
  timeMaxISO: string
): Promise<CalendarEvent[]> {
  let calendars: CalendarListEntry[];
  try {
    calendars = await listCalendars(accessToken);
  } catch {
    calendars = [];
  }
  if (calendars.length === 0) {
    calendars = [{ id: "primary", name: "Calendar" }];
  }

  const perCalendar = await Promise.all(
    calendars.map((c) => fetchEventsForCalendar(accessToken, c, timeMinISO, timeMaxISO))
  );

  return perCalendar
    .flat()
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
