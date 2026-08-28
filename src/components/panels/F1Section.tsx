"use client";

import { useF1 } from "@/hooks/useF1";

function formatRaceDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function F1Section() {
  const { races, driverStandings, constructorStandings, loading, error, refresh } = useF1();

  if (loading) {
    return (
      <div className="f1-skeleton">
        <div className="skeleton" style={{ height: 80 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="empty-state">Couldn&apos;t load Formula 1 data.</p>
        <button type="button" className="btn-secondary" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="f1-section">
      <button type="button" className="f1-refresh" onClick={refresh}>
        Refresh
      </button>

      <div className="f1-block">
        <h4 className="f1-block-title">Upcoming Races</h4>
        {races.length === 0 ? (
          <p className="empty-state">No upcoming races scheduled.</p>
        ) : (
          <ul className="f1-races">
            {races.map((r) => (
              <li key={`${r.season}-${r.round}`} className="f1-race">
                <span className="f1-race-name">{r.raceName}</span>
                <span className="f1-race-meta">
                  {formatRaceDate(r.date)}
                  {r.isSprint && <span className="f1-sprint-badge">Sprint</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="f1-block">
        <h4 className="f1-block-title">Driver Standings</h4>
        {driverStandings.length === 0 ? (
          <p className="empty-state">Standings unavailable.</p>
        ) : (
          <table className="f1-standings f1-driver-standings">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Wins</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {driverStandings.map((row) => (
                <tr key={row.code}>
                  <td>{row.position}</td>
                  <td>{row.driverName}</td>
                  <td>{row.constructor}</td>
                  <td>{row.wins}</td>
                  <td className="f1-standings-pts">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="f1-block">
        <h4 className="f1-block-title">Constructor Standings</h4>
        {constructorStandings.length === 0 ? (
          <p className="empty-state">Standings unavailable.</p>
        ) : (
          <table className="f1-standings">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>Wins</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {constructorStandings.map((row) => (
                <tr key={row.name}>
                  <td>{row.position}</td>
                  <td>{row.name}</td>
                  <td>{row.wins}</td>
                  <td className="f1-standings-pts">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
