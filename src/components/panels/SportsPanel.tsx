"use client";

import Panel from "@/components/Panel";
import EplSection from "@/components/panels/EplSection";
import F1Section from "@/components/panels/F1Section";
import CyclingSection from "@/components/panels/CyclingSection";

export default function SportsPanel() {
  return (
    <Panel id="panel-sports" title="Sports" wide>
      <div className="sports-league">
        <h3>Cycling</h3>
        <CyclingSection />
      </div>
      <div className="sports-league">
        <h3>Formula 1</h3>
        <F1Section />
      </div>
      <div className="sports-league">
        <h3>English Premier League</h3>
        <EplSection />
      </div>
    </Panel>
  );
}
