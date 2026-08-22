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

// Covers Strava's ride sport types (Ride, VirtualRide, GravelRide,
// MountainBikeRide, EBikeRide, ...) without needing an exhaustive list.
function badgeClass(sportType: string): string {
  return sportType.includes("Ride") ? "wo-type-badge wo-type-badge-ride" : "wo-type-badge";
}

// Monday 00:00 of the week containing `date`, matching the convention used
// elsewhere in the app (see getWeekRangeLabel in lib/dates.ts).
function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `Week of ${monday.toLocaleDateString(undefined, opts)} – ${sunday.toLocaleDateString(undefined, opts)}`;
}

type WeekGroup = { monday: Date; activities: StravaActivity[] };

// Activities are already newest-first, so grouping in a single pass
// preserves both week order (most recent week's key inserted first) and
// each week's own newest-first order.
function groupByWeek(activities: StravaActivity[]): WeekGroup[] {
  const groups = new Map<string, WeekGroup>();
  for (const a of activities) {
    const monday = mondayOf(new Date(a.startDateLocal));
    const key = monday.toISOString();
    let group = groups.get(key);
    if (!group) {
      group = { monday, activities: [] };
      groups.set(key, group);
    }
    group.activities.push(a);
  }
  return Array.from(groups.values());
}

type ActivityListProps = {
  activities: StravaActivity[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
};

export default function ActivityList({
  activities,
  hasMore,
  loadingMore,
  onLoadMore,
}: ActivityListProps) {
  const weekStart = mondayOf(new Date());
  const thisWeek = activities.filter(
    (a) => new Date(a.startDateLocal) >= weekStart
  );
  const weeklyDistance = thisWeek.reduce((sum, a) => sum + a.distanceMeters, 0);
  const weeklyTime = thisWeek.reduce((sum, a) => sum + a.movingTimeSeconds, 0);

  const weeks = groupByWeek(activities);

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

      {weeks.length === 0 ? (
        <p className="empty-state">No activities in the last 30 days.</p>
      ) : (
        weeks.map((week) => (
          <div key={week.monday.toISOString()} className="wo-week">
            <p className="wo-week-label">{formatWeekRange(week.monday)}</p>
            <ul className="wo-activities">
              {week.activities.map((a) => (
                <li key={a.id} className="wo-activity">
                  <span className={badgeClass(a.sportType)}>{a.sportType}</span>
                  <span className="wo-activity-stats">
                    {formatDistance(a.distanceMeters)} · {formatDuration(a.movingTimeSeconds)}
                  </span>
                  <span className="wo-activity-date">{formatDate(a.startDateLocal)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      {hasMore && (
        <button
          type="button"
          className="btn-secondary wo-load-more"
          disabled={loadingMore}
          onClick={onLoadMore}
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
