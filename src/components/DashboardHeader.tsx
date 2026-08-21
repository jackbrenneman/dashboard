"use client";

import { useState } from "react";
import SignOutButton from "@/components/SignOutButton";
import SettingsModal from "@/components/SettingsModal";
import { useSetup } from "@/hooks/useSetup";

function GearIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

export default function DashboardHeader() {
  const { loading, isFirstRun, completeSetup } = useSetup();
  const [manualOpen, setManualOpen] = useState(false);
  const [dismissedFirstRun, setDismissedFirstRun] = useState(false);

  const modalOpen =
    manualOpen || (!loading && isFirstRun && !dismissedFirstRun);

  function closeModal() {
    setManualOpen(false);
    if (isFirstRun) setDismissedFirstRun(true);
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="topbar">
        <span />
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="gear-btn"
            aria-label="Open settings"
            title="Settings"
            onClick={() => setManualOpen(true)}
          >
            <GearIcon />
          </button>
          <SignOutButton />
        </div>
      </div>

      <div className="hero">
        {loading ? (
          <div className="skeleton skeleton-hero-title" />
        ) : (
          <h1>{dateStr}</h1>
        )}
      </div>

      {modalOpen && (
        <SettingsModal
          isFirstRun={isFirstRun}
          onSave={() => {
            completeSetup();
            setManualOpen(false);
          }}
          onClose={closeModal}
        />
      )}
    </>
  );
}
