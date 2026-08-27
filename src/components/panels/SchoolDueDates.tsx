"use client";

import { useState } from "react";
import Panel from "@/components/Panel";
import { useDueDates } from "@/hooks/useDueDates";
import { todayISO } from "@/lib/dates";

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function SchoolDueDates() {
  const { items, loading, addItem, deleteItem, refresh } = useDueDates();
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const today = todayISO();

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() || !date) return;
    addItem(text, date);
    setText("");
    setDate("");
  }

  return (
    <Panel
      id="panel-school-due-dates"
      title="Upcoming Due Dates"
      actions={
        <button type="button" className="cal-disconnect" onClick={refresh}>
          Refresh
        </button>
      }
    >
      <form className="add-row school-add-row" onSubmit={submit}>
        <input
          type="text"
          placeholder="What's due…"
          aria-label="What's due"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="date"
          aria-label="Due date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit" className="primary">
          Add
        </button>
      </form>

      {loading ? (
        <ul className="todo-list" aria-hidden="true">
          {[70, 58, 64].map((width, i) => (
            <li key={i} className="todo-item todo-skeleton-item">
              <span
                className="skeleton todo-skeleton-bar"
                style={{ flex: `0 0 ${width}%` }}
              />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="empty-state">Nothing due yet — add a date above.</p>
      ) : (
        <ul className="todo-list">
          {items.map((item) => {
            const overdue = item.date < today;
            return (
              <li
                key={item.id}
                className={`due-date-item${overdue ? " overdue" : ""}`}
              >
                <span className="due-date-text">{item.text}</span>
                <span className="due-date-date">
                  {overdue ? "Overdue · " : ""}
                  {formatDate(item.date)}
                </span>
                <button
                  type="button"
                  className="del-btn"
                  aria-label="Delete item"
                  onClick={() => deleteItem(item.id)}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
