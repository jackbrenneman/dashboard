"use client";

import type { StravaActivity } from "@/lib/strava/activities";

const METERS_PER_MILE = 1609.344;

function formatDistance(meters: number): string {
  return `${(meters / METERS_PER_MILE).toFixed(1)} mi`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Monday-start week, matching the convention used elsewhere in the app
// (see getWeekRangeLabel in lib/dates.ts).
function startOfWeek(): Date {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

type ActivityListProps = {
  activities: StravaActivity[];
};

export default function ActivityList({ activities }: ActivityListProps) {
  const weekStart = startOfWeek();
  const thisWeek = activities.filter(
    (a) => new Date(a.startDateLocal) >= weekStart
  );
  const weeklyDistance = thisWeek.reduce((sum, a) => sum + a.distanceMeters, 0);
  const weeklyTime = thisWeek.reduce((sum, a) => sum + a.movingTimeSeconds, 0);

  const recent = activities.slice(0, 10);

  return (
    <div>
      <div className="wo-stats">
        <div className="wo-stat">
          <span className="wo-stat-value">{thisWeek.length}</span>
          <span className="wo-stat-label">this week</span>
        </div>
        <div className="wo-stat">
          <span className="wo-stat-value">{formatDistance(weeklyDistance)}</span>
          <span className="wo-stat-label">distance</span>
        </div>
        <div className="wo-stat">
          <span className="wo-stat-value">{formatDuration(weeklyTime)}</span>
          <span className="wo-stat-label">moving time</span>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="empty-state">No activities in the last 30 days.</p>
      ) : (
        <ul className="wo-activities">
          {recent.map((a) => (
            <li key={a.id} className="wo-activity">
              <span className="wo-type-badge">{a.sportType}</span>
              <span className="wo-activity-name">{a.name}</span>
              <span className="wo-activity-meta">
                {formatDistance(a.distanceMeters)} · {formatDuration(a.movingTimeSeconds)} ·{" "}
                {formatDate(a.startDateLocal)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
