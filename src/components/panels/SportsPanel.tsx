"use client";

import Panel from "@/components/Panel";

const LEAGUES = [
  { id: "cycling", name: "Cycling" },
  { id: "f1", name: "Formula 1" },
  { id: "epl", name: "English Premier League" },
];

export default function SportsPanel() {
  return (
    <Panel id="panel-sports" title="Sports" wide>
      {LEAGUES.map((league) => (
        <div key={league.id} className="sports-league">
          <h3>{league.name}</h3>
          <p className="empty-state">Standings coming soon.</p>
        </div>
      ))}
    </Panel>
  );
}
