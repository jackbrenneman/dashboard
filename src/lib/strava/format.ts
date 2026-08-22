// Formatting helpers for Strava activity data — shared by the activity list
// and the per-card detail view.

const METERS_PER_MILE = 1609.344;
const METERS_PER_FOOT = 0.3048;

export function formatDistance(meters: number): string {
  return `${(meters / METERS_PER_MILE).toFixed(1)} mi`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Covers Strava's ride sport types (Ride, VirtualRide, GravelRide,
// MountainBikeRide, EBikeRide, ...) without needing an exhaustive list.
export function badgeClass(sportType: string): string {
  return sportType.includes("Ride") ? "wo-type-badge wo-type-badge-ride" : "wo-type-badge";
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters / METERS_PER_FOOT)} ft`;
}

// Pace (min/mi) for runs, mph for everything else — the two units people
// actually think in for these sports.
export function formatPaceOrSpeed(sportType: string, metersPerSecond: number): string {
  if (metersPerSecond <= 0) return "—";
  if (sportType.includes("Run")) {
    const secPerMile = METERS_PER_MILE / metersPerSecond;
    const minutes = Math.floor(secPerMile / 60);
    const seconds = Math.round(secPerMile % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")} /mi`;
  }
  const mph = metersPerSecond * 2.23694;
  return `${mph.toFixed(1)} mph`;
}

export function formatHeartrate(bpm: number): string {
  return `${Math.round(bpm)} bpm`;
}

export function formatWatts(watts: number): string {
  return `${Math.round(watts)} W`;
}
