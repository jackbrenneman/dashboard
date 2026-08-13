"use client";

import { useRef, useState } from "react";
import Panel from "@/components/Panel";
import ChecklistItem from "@/components/panels/ChecklistItem";
import type { ChecklistItem as ChecklistItemType } from "@/lib/types";

type ChecklistPanelProps = {
  id: string;
  title: string;
  wide?: boolean;
  placeholder: string;
  emptyText: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  items: ChecklistItemType[];
  loading: boolean;
  addItem: (text: string) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  updateItemText: (id: string, text: string) => void;
  reorderItems: (orderedIds: string[]) => void;
  aboveList?: React.ReactNode;
  belowList?: React.ReactNode;
};

export default function ChecklistPanel({
  id,
  title,
  wide,
  placeholder,
  emptyText,
  collapsed,
  onToggleCollapse,
  items,
  loading,
  addItem,
  toggleItem,
  deleteItem,
  updateItemText,
  reorderItems,
  aboveList,
  belowList,
}: ChecklistPanelProps) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLUListElement>(null);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim()) return;
    addItem(input);
    setInput("");
  }

  function startDrag(pointerId: number, li: HTMLElement, handle: HTMLElement) {
    // Note: pointermove/pointerup listeners go on `document`, not `handle`.
    // Reordering below moves `li` (and its `handle` child) via insertBefore,
    // which — even though the node stays connected — triggers an implicit
    // remove-then-reinsert per the DOM spec and silently releases pointer
    // capture. Listening on `handle` would stop getting events after the
    // first reorder; `document` never moves, so it always keeps hearing them.
    try {
      handle.setPointerCapture(pointerId);
    } catch {
      // pointer capture isn't critical to the drag working
    }
    li.classList.add("dragging");

    function onMove(ev: PointerEvent) {
      const list = listRef.current;
      if (!list) return;
      const rows = Array.from(list.querySelectorAll<HTMLElement>(".todo-item"));
      const y = ev.clientY;
      let placed = false;
      for (const row of rows) {
        if (row === li) continue;
        const rect = row.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (y < mid) {
          list.insertBefore(li, row);
          placed = true;
          break;
        }
      }
      if (!placed) list.appendChild(li);
    }

    function onUp(ev: PointerEvent) {
      try {
        handle.releasePointerCapture(ev.pointerId);
      } catch {
        // already released
      }
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      li.classList.remove("dragging");

      const list = listRef.current;
      if (list) {
        const ids = Array.from(
          list.querySelectorAll<HTMLElement>(".todo-item")
        ).map((el) => el.getAttribute("data-id")!);
        reorderItems(ids);
      }
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLUListElement>) {
    const target = e.target as HTMLElement;
    const handle = target.closest(".drag-handle") as HTMLElement | null;
    if (!handle) return;
    const li = handle.closest(".todo-item") as HTMLElement | null;
    if (!li) return;
    e.preventDefault();
    startDrag(e.pointerId, li, handle);
  }

  return (
    <Panel
      id={id}
      title={title}
      wide={wide}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
    >
      {aboveList}

      <form className="add-row" onSubmit={submit}>
        <input
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="primary">
          Add
        </button>
      </form>

      {loading ? (
        <ul className="todo-list" aria-hidden="true">
          {[70, 58, 64].map((width, i) => (
            <li key={i} className="todo-item todo-skeleton-item">
              <span className="skeleton todo-skeleton-check" />
              <span
                className="skeleton todo-skeleton-bar"
                style={{ flex: `0 0 ${width}%` }}
              />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="empty-state">{emptyText}</p>
      ) : (
        <ul className="todo-list" ref={listRef} onPointerDown={handlePointerDown}>
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={toggleItem}
              onDelete={deleteItem}
              onUpdateText={updateItemText}
            />
          ))}
        </ul>
      )}

      {belowList}
    </Panel>
  );
}
