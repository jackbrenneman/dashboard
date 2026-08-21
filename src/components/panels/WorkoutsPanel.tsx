"use client";

import Panel from "@/components/Panel";

export default function WorkoutsPanel() {
  return (
    <Panel id="panel-workouts" title="Workouts" wide>
      <p className="empty-state">
        Under construction — this will pull in runs, rides, and other
        workouts from your training log and other connected accounts.
      </p>
    </Panel>
  );
}
