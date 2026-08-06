"use client";

import { useState } from "react";
import ChecklistPanel from "@/components/panels/ChecklistPanel";
import { useChecklist } from "@/hooks/useChecklist";
import { getWeekRangeLabel } from "@/lib/dates";

type FoodPrepPanelProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export default function FoodPrepPanel({ collapsed, onToggleCollapse }: FoodPrepPanelProps) {
  const {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    updateItemText,
    reorderItems,
    clearAll,
  } = useChecklist("meals");
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <ChecklistPanel
      id="panel-foodprep"
      title="Food Prep"
      wide
      placeholder="Add a dinner or dish idea…"
      emptyText="No meals planned yet — add a few ideas for the week above."
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      items={items}
      loading={loading}
      addItem={addItem}
      toggleItem={toggleItem}
      deleteItem={deleteItem}
      updateItemText={updateItemText}
      reorderItems={reorderItems}
      aboveList={
        <p className="week-label">
          {getWeekRangeLabel()} — dinners &amp; dishes to make, in any order
        </p>
      }
      belowList={
        confirmingClear ? (
          <div className="panel-footer-row">
            <span className="confirm-row">Clear this list and start fresh?</span>
            <button
              type="button"
              className="btn-text"
              onClick={() => setConfirmingClear(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-text-danger"
              onClick={() => {
                clearAll();
                setConfirmingClear(false);
              }}
            >
              Yes, clear it
            </button>
          </div>
        ) : (
          <div className="panel-footer-row">
            <button
              type="button"
              className="btn-text"
              onClick={() => setConfirmingClear(true)}
            >
              Start new week
            </button>
          </div>
        )
      }
    />
  );
}
