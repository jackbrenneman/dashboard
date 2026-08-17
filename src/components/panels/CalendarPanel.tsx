"use client";

import Panel from "@/components/Panel";
import CalendarMonth from "@/components/panels/CalendarMonth";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";

export default function CalendarPanel() {
  const {
    status,
    email,
    events,
    eventsLoading,
    visibleMonth,
    connect,
    disconnect,
    goToMonth,
    goToday,
  } = useGoogleCalendar();

  const monthLabel = new Date(
    visibleMonth.year,
    visibleMonth.month,
    1
  ).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Distinct calendars represented in the visible month, for a small color
  // legend — only worth showing once there's more than one source.
  const legend = Array.from(
    new Map(
      events.map((e) => [e.calendarId, { id: e.calendarId, name: e.calendarName, color: e.color }])
    ).values()
  );

  return (
    <Panel id="panel-calendar" title="Calendar" wide>
      {status === "loading" && (
        <div className="cal-skeleton">
          <div className="skeleton" style={{ width: 160, height: 20 }} />
          <div className="skeleton" style={{ height: 220, marginTop: 12 }} />
        </div>
      )}

      {status === "disconnected" && (
        <div className="cal-connect">
          <p className="cal-connect-text">
            Connect your Google account to see your calendar here. It stays
            read-only and private to you.
          </p>
          <button type="button" className="btn-primary" onClick={connect}>
            Connect Google Calendar
          </button>
        </div>
      )}

      {status === "needs-reconnect" && (
        <div className="cal-connect">
          <p className="cal-connect-text">
            Your Google connection expired. Reconnect to keep seeing your
            events.
          </p>
          <button type="button" className="btn-primary" onClick={connect}>
            Reconnect Google Calendar
          </button>
        </div>
      )}

      {status === "connected" && (
        <>
          <div className="cal-toolbar">
            <div className="cal-nav">
              <button
                type="button"
                className="cal-nav-btn"
                aria-label="Previous month"
                onClick={() => goToMonth(-1)}
              >
                ‹
              </button>
              <span className="cal-month-label">{monthLabel}</span>
              <button
                type="button"
                className="cal-nav-btn"
                aria-label="Next month"
                onClick={() => goToMonth(1)}
              >
                ›
              </button>
              <button type="button" className="cal-today-btn" onClick={goToday}>
                Today
              </button>
              {eventsLoading && <span className="cal-loading">Updating…</span>}
            </div>
            <div className="cal-account">
              {email && <span className="cal-email">{email}</span>}
              <button
                type="button"
                className="link cal-disconnect"
                onClick={disconnect}
              >
                Disconnect
              </button>
            </div>
          </div>

          {legend.length > 1 && (
            <div className="cal-legend">
              {legend.map((c) => (
                <span key={c.id} className="cal-legend-item">
                  <span
                    className="cal-dot"
                    style={{ backgroundColor: c.color || "var(--accent)" }}
                  />
                  {c.name}
                </span>
              ))}
            </div>
          )}

          <CalendarMonth
            year={visibleMonth.year}
            month={visibleMonth.month}
            events={events}
          />
        </>
      )}
    </Panel>
  );
}
