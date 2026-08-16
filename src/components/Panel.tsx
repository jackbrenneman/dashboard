"use client";

type PanelProps = {
  id?: string;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
};

export default function Panel({ id, title, wide, children }: PanelProps) {
  return (
    <section id={id} className={wide ? "panel wide-panel" : "panel"}>
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}
