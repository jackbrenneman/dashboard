"use client";

import ChecklistPanel from "@/components/panels/ChecklistPanel";
import { useChecklist } from "@/hooks/useChecklist";

export default function TodoPanel() {
  const {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    updateItemText,
    reorderItems,
    refresh,
  } = useChecklist("todos");

  return (
    <ChecklistPanel
      id="panel-todo"
      title="To Dos"
      placeholder="Add a task…"
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
  );
}
