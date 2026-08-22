"use client";

import Panel from "@/components/Panel";
import EplSection from "@/components/panels/EplSection";

export default function SportsPanel() {
  return (
    <Panel id="panel-sports" title="Sports" wide>
      <div className="sports-league">
        <h3>Cycling</h3>
        <p className="empty-state">Standings coming soon.</p>
      </div>
      <div className="sports-league">
        <h3>Formula 1</h3>
        <p className="empty-state">Standings coming soon.</p>
      </div>
      <div className="sports-league">
        <h3>English Premier League</h3>
        <EplSection />
      </div>
    </Panel>
  );
}
