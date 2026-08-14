// Google Calendar API — read-only event listing (server-side).

const EVENTS_ENDPOINT =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export type CalendarEvent = {
  id: string;
  title: string;
  // For timed events these are RFC3339 datetimes; for all-day events `start`
  // is a "YYYY-MM-DD" date and `end` is the exclusive end date Google returns.
  start: string;
  end: string;
  allDay: boolean;
};

type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

export async function listEvents(
  accessToken: string,
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

  const res = await fetch(`${EVENTS_ENDPOINT}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Calendar API ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as { items?: GoogleEvent[] };
  return (data.items ?? [])
    .filter((e) => e.status !== "cancelled" && (e.start?.dateTime || e.start?.date))
    .map((e) => {
      const allDay = !e.start?.dateTime;
      return {
        id: e.id,
        title: e.summary?.trim() || "(no title)",
        start: (e.start?.dateTime ?? e.start?.date) as string,
        end: (e.end?.dateTime ?? e.end?.date ?? e.start?.dateTime ?? e.start?.date) as string,
        allDay,
      };
    });
}
