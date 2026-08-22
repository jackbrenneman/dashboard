"use client";

import { formatEventTime } from "@/lib/dates";
import { useEpl } from "@/hooks/useEpl";

function formatMatchDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const UPCOMING_STATUSES = new Set(["SCHEDULED", "TIMED"]);

export default function EplSection() {
  const { matches, standings, loading, error, refresh } = useEpl();

  if (loading) {
    return (
      <div className="epl-skeleton">
        <div className="skeleton" style={{ height: 80 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="empty-state">Couldn&apos;t load Premier League data.</p>
        <button type="button" className="btn-secondary" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  }

  const upcoming = matches
    .filter((m) => UPCOMING_STATUSES.has(m.status))
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())
    .slice(0, 5);

  const recentResults = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());

  return (
    <div className="epl-section">
      <div className="epl-block">
        <h4 className="epl-block-title">Upcoming</h4>
        {upcoming.length === 0 ? (
          <p className="empty-state">No upcoming matches scheduled.</p>
        ) : (
          <ul className="epl-matches">
            {upcoming.map((m) => (
              <li key={m.id} className="epl-match">
                <span className="epl-match-teams">
                  {m.homeTeam} vs {m.awayTeam}
                </span>
                <span className="epl-match-meta">
                  {formatMatchDate(m.utcDate)} · {formatEventTime(m.utcDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="epl-block">
        <h4 className="epl-block-title">Recent Results</h4>
        {recentResults.length === 0 ? (
          <p className="empty-state">No results in the last week.</p>
        ) : (
          <ul className="epl-matches">
            {recentResults.map((m) => (
              <li key={m.id} className="epl-match">
                <span className="epl-match-teams">
                  {m.homeTeam} vs {m.awayTeam}
                </span>
                <span className="epl-match-score">
                  {m.homeScore} – {m.awayScore}
                </span>
                <span className="epl-match-meta">{formatMatchDate(m.utcDate)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="epl-block">
        <h4 className="epl-block-title">Standings</h4>
        {standings.length === 0 ? (
          <p className="empty-state">Standings unavailable.</p>
        ) : (
          <table className="epl-standings">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                // Team name, not position — early-season standings often
                // have tied teams sharing the same position number.
                <tr key={row.team}>
                  <td>{row.position}</td>
                  <td className="epl-standings-team">{row.team}</td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.goalDifference}</td>
                  <td className="epl-standings-pts">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
