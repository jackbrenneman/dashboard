"use client";

import ChecklistPanel from "@/components/panels/ChecklistPanel";
import SchoolDueDates from "@/components/panels/SchoolDueDates";
import SchoolLinks from "@/components/panels/SchoolLinks";
import { useChecklist } from "@/hooks/useChecklist";

export default function SchoolPanel() {
  const {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    updateItemText,
    reorderItems,
    refresh,
  } = useChecklist("school_todos");

  return (
    <div className="school-grid">
      <ChecklistPanel
        id="panel-school-todo"
        title="School To Do"
        placeholder="Add a school task…"
        emptyText="Nothing here yet — add your first task above."
        items={items}
        loading={loading}
        addItem={addItem}
        toggleItem={toggleItem}
        deleteItem={deleteItem}
        updateItemText={updateItemText}
        reorderItems={reorderItems}
        onRefresh={refresh}
      />
      <SchoolDueDates />
      <SchoolLinks />
    </div>
  );
}
