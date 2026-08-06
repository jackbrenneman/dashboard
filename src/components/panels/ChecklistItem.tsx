"use client";

import { useState } from "react";
import type { ChecklistItem as ChecklistItemType } from "@/lib/types";

type ChecklistItemProps = {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateText: (id: string, text: string) => void;
};

export default function ChecklistItem({
  item,
  onToggle,
  onDelete,
  onUpdateText,
}: ChecklistItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== item.text) {
      onUpdateText(item.id, trimmed);
    } else {
      setDraft(item.text);
    }
  }

  function cancel() {
    setEditing(false);
    setDraft(item.text);
  }

  return (
    <li className={`todo-item${item.done ? " done" : ""}`} data-id={item.id}>
      <span className="drag-handle" aria-hidden="true">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
          <circle cx="2" cy="2" r="1.4" />
          <circle cx="8" cy="2" r="1.4" />
          <circle cx="2" cy="8" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="2" cy="14" r="1.4" />
          <circle cx="8" cy="14" r="1.4" />
        </svg>
      </span>

      <button
        type="button"
        className={`todo-check${item.done ? " done" : ""}`}
        aria-label={item.done ? "Mark as not done" : "Mark as done"}
        onClick={() => onToggle(item.id)}
      >
        {item.done ? "✓" : ""}
      </button>

      {editing ? (
        <input
          type="text"
          className="todo-edit-input"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
        />
      ) : (
        <span
          className="todo-text editable-text"
          title="Click to edit"
          onClick={() => setEditing(true)}
        >
          {item.text}
        </span>
      )}

      <button
        type="button"
        className="del-btn"
        aria-label="Delete item"
        onClick={() => onDelete(item.id)}
      >
        ✕
      </button>
    </li>
  );
}
