"use client";

import Panel from "@/components/Panel";
import FoodLog from "@/components/panels/FoodLog";

export default function SolidsPanel() {
  return (
    <Panel id="panel-solids" title="Solids">
      <FoodLog />
    </Panel>
  );
}
