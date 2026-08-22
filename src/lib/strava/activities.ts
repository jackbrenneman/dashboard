// Strava activities API client (raw fetch, server-side only).

const API_BASE = "https://www.strava.com/api/v3";
export const ACTIVITIES_PER_PAGE = 20;

export type StravaActivity = {
  id: number;
  name: string;
  sportType: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  startDateLocal: string;
};

type SummaryActivity = {
  id: number;
  name: string;
  sport_type?: string;
  type?: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
};

export type ActivitiesPage = {
  activities: StravaActivity[];
  hasMore: boolean;
};

// Strava's start_date_local is local wall-clock time, but formatted with a
// trailing "Z" as if it were UTC. Stripping it means `new Date(...)`
// downstream reads the literal wall-clock numbers as local time directly,
// instead of misreading it as UTC and double-converting.
function stripUtcSuffix(iso: string): string {
  return iso.endsWith("Z") ? iso.slice(0, -1) : iso;
}

// One page of activities, newest first (Strava's default order without an
// `after` param — deliberately not using `after` here, since it flips
// Strava's sort to oldest-first, which plain `page`-based pagination avoids
// entirely).
export async function listActivities(
  accessToken: string,
  page = 1,
  perPage = ACTIVITIES_PER_PAGE
): Promise<ActivitiesPage> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const res = await fetch(`${API_BASE}/athlete/activities?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Strava activities request failed (${res.status})`);
  }
  const data: SummaryActivity[] = await res.json();
  const activities = data.map((a) => ({
    id: a.id,
    name: a.name,
    sportType: a.sport_type || a.type || "Workout",
    distanceMeters: a.distance,
    movingTimeSeconds: a.moving_time,
    startDateLocal: stripUtcSuffix(a.start_date_local),
  }));
  // A full page means there might be more; a short page means we've hit the
  // end. No separate count endpoint needed.
  return { activities, hasMore: activities.length === perPage };
}
