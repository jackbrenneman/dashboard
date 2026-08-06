"use client";

type PanelProps = {
  id?: string;
  title: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  wide?: boolean;
  children: React.ReactNode;
};

export default function Panel({
  id,
  title,
  collapsed,
  onToggleCollapse,
  wide,
  children,
}: PanelProps) {
  return (
    <section id={id} className={wide ? "panel wide-panel" : "panel"}>
      <div
        className={`panel-header${collapsed ? " collapsed" : ""}`}
        onClick={onToggleCollapse}
      >
        <h2>{title}</h2>
        <button
          type="button"
          className="chevron-btn"
          aria-label={`Toggle ${title} section`}
          aria-expanded={!collapsed}
        >
          <svg
            className="chevron"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      <div className={`panel-body${collapsed ? " collapsed" : ""}`}>
        {children}
      </div>
    </section>
  );
}
