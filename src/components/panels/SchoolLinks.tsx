"use client";

import { useRef, useState } from "react";
import Panel from "@/components/Panel";
import { useSchoolLinks } from "@/hooks/useSchoolLinks";

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return null;
  }
}

export default function SchoolLinks() {
  const { items, loading, addItem, deleteItem, reorderItems, refresh } =
    useSchoolLinks();
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim()) return;
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setUrlError(true);
      return;
    }
    addItem(text, normalized);
    setText("");
    setUrl("");
    setUrlError(false);
  }

  // Mirrors ChecklistPanel's pointer-based drag-reorder, retargeted at
  // .link-item rows. See ChecklistPanel.tsx for why listeners live on
  // `document` rather than the drag handle itself.
  function startDrag(pointerId: number, li: HTMLElement, handle: HTMLElement) {
    try {
      handle.setPointerCapture(pointerId);
    } catch {
      // pointer capture isn't critical to the drag working
    }
    li.classList.add("dragging");

    function onMove(ev: PointerEvent) {
      const list = listRef.current;
      if (!list) return;
      const rows = Array.from(list.querySelectorAll<HTMLElement>(".link-item"));
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
          list.querySelectorAll<HTMLElement>(".link-item")
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
    const li = handle.closest(".link-item") as HTMLElement | null;
    if (!li) return;
    e.preventDefault();
    startDrag(e.pointerId, li, handle);
  }

  return (
    <Panel
      id="panel-school-links"
      title="Important Links"
      actions={
        <button type="button" className="cal-disconnect" onClick={refresh}>
          Refresh
        </button>
      }
    >
      <form className="add-row school-add-row" onSubmit={submit}>
        <input
          type="text"
          placeholder="Label (e.g. Canvas)"
          aria-label="Link label"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="url"
          placeholder="https://…"
          aria-label="Link URL"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setUrlError(false);
          }}
        />
        <button type="submit" className="primary">
          Add
        </button>
      </form>
      {urlError && (
        <p className="field-error">That doesn&apos;t look like a valid URL.</p>
      )}

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
        <p className="empty-state">No links yet — add one above.</p>
      ) : (
        <ul className="todo-list" ref={listRef} onPointerDown={handlePointerDown}>
          {items.map((item) => (
            <li key={item.id} className="link-item" data-id={item.id}>
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
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-item-text"
              >
                {item.text}
              </a>
              <button
                type="button"
                className="del-btn"
                aria-label="Delete item"
                onClick={() => deleteItem(item.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
