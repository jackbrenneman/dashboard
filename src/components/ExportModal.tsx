"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ExportModalProps = {
  onClose: () => void;
};

export default function ExportModal({ onClose }: ExportModalProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const [setup, todos, foods, meals, panelCollapse] = await Promise.all([
        supabase.from("setup").select("*").maybeSingle(),
        supabase.from("todos").select("*").order("position"),
        supabase.from("foods_tried").select("*"),
        supabase.from("meals").select("*"),
        supabase.from("panel_collapse").select("*").maybeSingle(),
      ]);
      if (cancelled) return;
      const payload = {
        exportedAt: new Date().toISOString(),
        setup: setup.data,
        todos: todos.data,
        foods: foods.data,
        meals: meals.data,
        panelCollapse: panelCollapse.data,
      };
      setText(JSON.stringify(payload, null, 2));
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Couldn't auto-copy — select the text and copy manually.");
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h2>Export your data</h2>
          <button className="close-x" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="sub">
          A JSON snapshot of everything on this dashboard — a manual backup,
          in case you ever want a point-in-time copy. Nothing leaves this
          page automatically.
        </p>
        <textarea
          readOnly
          value={loading ? "Loading…" : text}
          onFocus={(e) => e.currentTarget.select()}
          style={{
            width: "100%",
            height: "260px",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: "11.5px",
            padding: "10px",
            border: "1px solid var(--border-strong)",
            borderRadius: "6px",
            background: "#fafafa",
            color: "var(--text)",
            resize: "vertical",
          }}
        />
        <div className="modal-actions">
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginRight: "auto",
              alignSelf: "center",
            }}
          >
            {copyStatus}
          </span>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={copy}
            disabled={loading}
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
