"use client";

import type { PanelKey } from "@/hooks/usePanelCollapse";

const LINKS: { key: PanelKey; label: string; targetId: string }[] = [
  { key: "todo", label: "To Dos", targetId: "panel-todo" },
  { key: "calendar", label: "Calendar", targetId: "panel-calendar" },
  { key: "solids", label: "Solids", targetId: "panel-solids" },
  { key: "foodprep", label: "Food Prep", targetId: "panel-foodprep" },
];

type QuickNavProps = {
  onJump: (key: PanelKey) => void;
};

export default function QuickNav({ onJump }: QuickNavProps) {
  function jump(key: PanelKey, targetId: string) {
    onJump(key);
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <nav className="quick-nav">
      {LINKS.map((link) => (
        <button
          key={link.key}
          type="button"
          className="nav-link"
          onClick={() => jump(link.key, link.targetId)}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}
