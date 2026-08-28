// Jolpica-F1 API client (raw fetch, server-side only). Public data — no
// per-user auth, unlike the Google/Strava integrations. Ergast-compatible,
// free, keyless; the API asks for a custom User-Agent on requests.

const API_BASE = "https://api.jolpi.ca/ergast/f1";

function headers(): Record<string, string> {
  return { "User-Agent": "jack-dashboard/1.0" };
}

export type UpcomingRace = {
  season: string;
  round: string;
  raceName: string;
  circuitName: string;
  locality: string;
  country: string;
  date: string;
  time: string | null;
  isSprint: boolean;
  sprintDate: string | null;
  sprintTime: string | null;
};

type RawRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitName: string;
    Location: { locality: string; country: string };
  };
  Sprint?: { date: string; time?: string };
};

export async function getUpcomingRaces(count = 5): Promise<UpcomingRace[]> {
  const res = await fetch(`${API_BASE}/current.json?limit=100`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`jolpica races request failed (${res.status})`);
  }
  const data: { MRData: { RaceTable: { Races: RawRace[] } } } = await res.json();
  const today = new Date().toISOString().slice(0, 10);
  return data.MRData.RaceTable.Races.filter((r) => r.date >= today)
    .slice(0, count)
    .map((r) => ({
      season: r.season,
      round: r.round,
      raceName: r.raceName,
      circuitName: r.Circuit.circuitName,
      locality: r.Circuit.Location.locality,
      country: r.Circuit.Location.country,
      date: r.date,
      time: r.time ?? null,
      isSprint: Boolean(r.Sprint),
      sprintDate: r.Sprint?.date ?? null,
      sprintTime: r.Sprint?.time ?? null,
    }));
}

export type DriverStandingRow = {
  position: number;
  driverName: string;
  code: string;
  constructor: string;
  points: number;
  wins: number;
};

type RawDriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: { givenName: string; familyName: string; code: string };
  Constructors: { name: string }[];
};

export async function getDriverStandings(): Promise<DriverStandingRow[]> {
  const res = await fetch(`${API_BASE}/current/driverstandings.json`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`jolpica driver standings request failed (${res.status})`);
  }
  const data: {
    MRData: { StandingsTable: { StandingsLists: { DriverStandings: RawDriverStanding[] }[] } };
  } = await res.json();
  const rows = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
  return rows.map((row) => ({
    position: Number(row.position),
    driverName: `${row.Driver.givenName} ${row.Driver.familyName}`,
    code: row.Driver.code,
    constructor: row.Constructors[0]?.name ?? "",
    points: Number(row.points),
    wins: Number(row.wins),
  }));
}

export type ConstructorStandingRow = {
  position: number;
  name: string;
  points: number;
  wins: number;
};

type RawConstructorStanding = {
  position: string;
  points: string;
  wins: string;
  Constructor: { name: string };
};

export async function getConstructorStandings(): Promise<ConstructorStandingRow[]> {
  const res = await fetch(`${API_BASE}/current/constructorstandings.json`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`jolpica constructor standings request failed (${res.status})`);
  }
  const data: {
    MRData: {
      StandingsTable: { StandingsLists: { ConstructorStandings: RawConstructorStanding[] }[] };
    };
  } = await res.json();
  const rows = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
  return rows.map((row) => ({
    position: Number(row.position),
    name: row.Constructor.name,
    points: Number(row.points),
    wins: Number(row.wins),
  }));
}
