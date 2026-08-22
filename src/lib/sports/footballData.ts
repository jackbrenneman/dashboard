// football-data.org API client (raw fetch, server-side only). Public data —
// no per-user auth, unlike the Google/Strava integrations.

const API_BASE = "https://api.football-data.org/v4";
const PREMIER_LEAGUE = "PL";

function authHeader(): Record<string, string> {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error("FOOTBALL_DATA_API_KEY is not set");
  return { "X-Auth-Token": key };
}

export type Match = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
};

type RawMatch = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: { fullTime: { home: number | null; away: number | null } };
};

export async function getMatches(dateFrom: string, dateTo: string): Promise<Match[]> {
  const params = new URLSearchParams({ dateFrom, dateTo });
  const res = await fetch(
    `${API_BASE}/competitions/${PREMIER_LEAGUE}/matches?${params}`,
    { headers: authHeader(), cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`football-data matches request failed (${res.status})`);
  }
  const data: { matches: RawMatch[] } = await res.json();
  return data.matches.map((m) => ({
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeScore: m.score.fullTime.home,
    awayScore: m.score.fullTime.away,
  }));
}

export type StandingsRow = {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
};

type RawStandingsGroup = {
  type: string;
  table: {
    position: number;
    team: { name: string };
    playedGames: number;
    won: number;
    draw: number;
    lost: number;
    goalDifference: number;
    points: number;
  }[];
};

export async function getStandings(): Promise<StandingsRow[]> {
  const res = await fetch(`${API_BASE}/competitions/${PREMIER_LEAGUE}/standings`, {
    headers: authHeader(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`football-data standings request failed (${res.status})`);
  }
  const data: { standings: RawStandingsGroup[] } = await res.json();
  const total = data.standings.find((s) => s.type === "TOTAL");
  if (!total) return [];
  return total.table.map((row) => ({
    position: row.position,
    team: row.team.name,
    played: row.playedGames,
    won: row.won,
    drawn: row.draw,
    lost: row.lost,
    goalDifference: row.goalDifference,
    points: row.points,
  }));
}
