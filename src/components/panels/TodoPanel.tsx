"use client";

import ChecklistPanel from "@/components/panels/ChecklistPanel";
import { useChecklist } from "@/hooks/useChecklist";

type TodoPanelProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export default function TodoPanel({ collapsed, onToggleCollapse }: TodoPanelProps) {
  const {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    updateItemText,
    reorderItems,
  } = useChecklist("todos");

  return (
    <ChecklistPanel
      id="panel-todo"
      title="To Dos"
      placeholder="Add a task…"
      emptyText="Nothing here yet — add your first task above."
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      items={items}
      loading={loading}
      addItem={addItem}
      toggleItem={toggleItem}
      deleteItem={deleteItem}
      updateItemText={updateItemText}
      reorderItems={reorderItems}
    />
  );
}
