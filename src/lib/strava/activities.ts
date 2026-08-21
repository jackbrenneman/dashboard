// Strava activities API client (raw fetch, server-side only).

const API_BASE = "https://www.strava.com/api/v3";

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

// Recent activities, newest first (Strava's default order), covering the
// last `sinceDays` days. One request, no pagination — plenty for a glance
// view given the app's rate limits and a single-user training volume.
export async function listRecentActivities(
  accessToken: string,
  sinceDays = 30,
  perPage = 50
): Promise<StravaActivity[]> {
  const after = Math.floor(Date.now() / 1000) - sinceDays * 86400;
  const params = new URLSearchParams({
    after: String(after),
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
  return data.map((a) => ({
    id: a.id,
    name: a.name,
    sportType: a.sport_type || a.type || "Workout",
    distanceMeters: a.distance,
    movingTimeSeconds: a.moving_time,
    startDateLocal: a.start_date_local,
  }));
}
