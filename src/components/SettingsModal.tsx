"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SettingsModalProps = {
  isFirstRun: boolean;
  onSave: () => void;
  onClose: () => void;
};

export default function SettingsModal({
  isFirstRun,
  onSave,
  onClose,
}: SettingsModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  async function handleSetPassword() {
    if (newPassword.length < 6) {
      setPasswordStatus("error");
      return;
    }
    setPasswordStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordStatus("error");
    } else {
      setNewPassword("");
      setPasswordStatus("saved");
    }
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

        <div className="field">
          <label htmlFor="newPasswordInput">
            {isFirstRun ? "Set a password" : "Change password"}
          </label>
          <input
            id="newPasswordInput"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordStatus("idle");
            }}
          />
          <div className="hint">
            Lets you sign in with email + password instead of a magic
            link next time.
          </div>
        </div>
        <div className="modal-actions" style={{ marginTop: "10px" }}>
          {passwordStatus === "saved" && (
            <span
              style={{
                fontSize: "12.5px",
                color: "var(--success)",
                marginRight: "auto",
                alignSelf: "center",
              }}
            >
              Password updated.
            </span>
          )}
          {passwordStatus === "error" && (
            <span
              style={{
                fontSize: "12.5px",
                color: "var(--danger)",
                marginRight: "auto",
                alignSelf: "center",
              }}
            >
              Password must be at least 6 characters.
            </span>
          )}
          <button
            type="button"
            className="btn-primary"
            disabled={passwordStatus === "saving" || !newPassword}
            onClick={handleSetPassword}
          >
            {passwordStatus === "saving" ? "Saving…" : "Update password"}
          </button>
        </div>

        <div
          style={{
            marginTop: "22px",
            paddingTop: "18px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="modal-actions">
            {isFirstRun ? (
              <button type="button" className="btn-primary" onClick={onSave}>
                Done
              </button>
            ) : (
              <button type="button" className="btn-primary" onClick={onClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
