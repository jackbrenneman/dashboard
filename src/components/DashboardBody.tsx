"use client";

import QuickNav from "@/components/QuickNav";
import TodoPanel from "@/components/panels/TodoPanel";
import SolidsPanel from "@/components/panels/SolidsPanel";
import FoodPrepPanel from "@/components/panels/FoodPrepPanel";
import { usePanelCollapse } from "@/hooks/usePanelCollapse";

export default function DashboardBody() {
  const { collapse, togglePanel, expandPanel } = usePanelCollapse();

  return (
    <>
      <QuickNav onJump={expandPanel} />

      <main>
        <TodoPanel
          collapsed={collapse.todo}
          onToggleCollapse={() => togglePanel("todo")}
        />
      </main>

      <SolidsPanel
        collapsed={collapse.solids}
        onToggleCollapse={() => togglePanel("solids")}
      />
      <FoodPrepPanel
        collapsed={collapse.foodprep}
        onToggleCollapse={() => togglePanel("foodprep")}
      />
    </>
  );
}
