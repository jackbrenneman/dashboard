"use client";

import { useState } from "react";
import { formatEventTime } from "@/lib/dates";
import {
  badgeClass,
  formatDate,
  formatDistance,
  formatDuration,
  formatElevation,
  formatHeartrate,
  formatPaceOrSpeed,
  formatWatts,
} from "@/lib/strava/format";
import type { ActivityDetail, StravaActivity } from "@/lib/strava/activities";

type DetailStatus =
  | { status: "loading" }
  | { status: "loaded"; detail: ActivityDetail }
  | { status: "error" };

type DetailRow = { label: string; value: string };

function detailRows(a: StravaActivity, d: ActivityDetail): DetailRow[] {
  const rows: DetailRow[] = [
    { label: "Pace", value: formatPaceOrSpeed(a.sportType, d.averageSpeedMps) },
  ];
  if (d.totalElevationGainMeters > 0) {
    rows.push({ label: "Elevation gain", value: formatElevation(d.totalElevationGainMeters) });
  }
  if (d.averageHeartrate) {
    rows.push({
      label: "Heart rate",
      value: d.maxHeartrate
        ? `${formatHeartrate(d.averageHeartrate)} avg · ${formatHeartrate(d.maxHeartrate)} max`
        : `${formatHeartrate(d.averageHeartrate)} avg`,
    });
  }
  if (d.averageWatts) {
    rows.push({ label: "Power", value: `${formatWatts(d.averageWatts)} avg` });
  }
  if (d.calories) {
    rows.push({ label: "Calories", value: `${Math.round(d.calories)}` });
  }
  return rows;
}

type ActivityCardProps = {
  activity: StravaActivity;
};

export default function ActivityCard({ activity: a }: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<DetailStatus | null>(null);

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !detail) {
      setDetail({ status: "loading" });
      try {
        const res = await fetch(`/api/strava/activities/${a.id}`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        setDetail({ status: "loaded", detail: data.detail });
      } catch {
        setDetail({ status: "error" });
      }
    }
  }

  return (
    <li
      className={`wo-activity${expanded ? " wo-activity-expanded" : ""}`}
      onClick={toggleExpand}
    >
      <span className={badgeClass(a.sportType)}>{a.sportType}</span>
      <span className="wo-activity-stats">
        {formatDistance(a.distanceMeters)} · {formatDuration(a.movingTimeSeconds)}
      </span>
      <span className="wo-activity-date">
        {formatDate(a.startDateLocal)} · {formatEventTime(a.startDateLocal)}
      </span>

      {expanded && (
        <div className="wo-activity-detail">
          {detail?.status === "loading" && <div className="skeleton" style={{ height: 50 }} />}
          {detail?.status === "error" && (
            <p className="wo-activity-detail-error">Couldn&apos;t load details.</p>
          )}
          {detail?.status === "loaded" && (
            <>
              {detail.detail.description && (
                <p className="wo-activity-description">{detail.detail.description}</p>
              )}
              <dl className="wo-activity-rows">
                {detailRows(a, detail.detail).map((row) => (
                  <div key={row.label} className="wo-activity-row">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      )}
    </li>
  );
}
