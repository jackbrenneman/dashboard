import { getUpcomingCyclingRaces } from "@/lib/sports/cyclingCalendar";

export default function CyclingSection() {
  const races = getUpcomingCyclingRaces();

  if (races.length === 0) {
    return <p className="empty-state">No WorldTour races in the next few weeks.</p>;
  }

  return (
    <ul className="cycling-races">
      {races.map((r) => (
        <li key={`${r.tour}-${r.name}`} className="cycling-race">
          <div className="cycling-race-main">
            <span className="cycling-race-name">
              {r.flag} {r.name}
            </span>
            <span className="cycling-race-badges">
              {r.isGrandTour && <span className="cycling-badge cycling-badge-grand-tour">Grand Tour</span>}
              {r.isMonument && <span className="cycling-badge cycling-badge-monument">Monument</span>}
              <span className="cycling-badge cycling-badge-tour">{r.tour === "men" ? "Men's" : "Women's"}</span>
            </span>
          </div>
          <span className="cycling-race-meta">
            {r.dateLabel} · {r.country} · {r.startDate === r.endDate ? "One-day" : "Stage race"}
          </span>
        </li>
      ))}
    </ul>
  );
}
