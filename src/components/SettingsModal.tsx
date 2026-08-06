"use client";

import { useState } from "react";
import type { Setup } from "@/hooks/useSetup";

type SettingsModalProps = {
  isFirstRun: boolean;
  setup: Setup;
  onSave: (next: Setup) => void;
  onClose: () => void;
};

// Mounted by the parent only while open, and remounted (via `key`) each time
// it opens, so local draft state can be seeded from `setup` with a plain
// useState initializer instead of syncing via an effect.
export default function SettingsModal({
  isFirstRun,
  setup,
  onSave,
  onClose,
}: SettingsModalProps) {
  const [leaveStart, setLeaveStart] = useState(setup.leaveStart);
  const [babyBirth, setBabyBirth] = useState(setup.babyBirth);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave({ leaveStart, babyBirth });
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isFirstRun) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h2>{isFirstRun ? "Set up your dashboard" : "Settings"}</h2>
          <button className="close-x" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="sub">
          {isFirstRun
            ? "One-time setup — everything here can be changed later from the gear icon."
            : "Update anytime — changes apply right away."}
        </p>
        <form onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="leaveStartInput">Leave start date</label>
            <input
              id="leaveStartInput"
              type="date"
              value={leaveStart}
              onChange={(e) => setLeaveStart(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="babyBirthInput">Baby&apos;s birth date</label>
            <input
              id="babyBirthInput"
              type="date"
              value={babyBirth}
              onChange={(e) => setBabyBirth(e.target.value)}
            />
            <div className="hint">
              Used to track age on the dashboard. Leave blank to skip.
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
