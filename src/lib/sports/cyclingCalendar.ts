// Static UCI WorldTour calendar data — hand-transcribed from Wikipedia's
// "2026 UCI World Tour" and "2026 UCI Women's World Tour" pages (race name +
// dates only, deliberately never results) since there is no free public
// cycling API and ProCyclingStats sits behind Cloudflare bot-protection.
// Update this file once a year when the UCI publishes the next season's
// calendar.

function flagEmoji(iso2: string): string {
  return Array.from(iso2.toUpperCase())
    .map((c) => String.fromCodePoint(0x1f1e6 + (c.charCodeAt(0) - 65)))
    .join("");
}

type CountryInfo = { name: string; flag: string };

const COUNTRIES: Record<string, CountryInfo> = {
  AUS: { name: "Australia", flag: flagEmoji("AU") },
  UAE: { name: "United Arab Emirates", flag: flagEmoji("AE") },
  BEL: { name: "Belgium", flag: flagEmoji("BE") },
  ITA: { name: "Italy", flag: flagEmoji("IT") },
  FRA: { name: "France", flag: flagEmoji("FR") },
  ESP: { name: "Spain", flag: flagEmoji("ES") },
  NED: { name: "Netherlands", flag: flagEmoji("NL") },
  SUI: { name: "Switzerland", flag: flagEmoji("CH") },
  GER: { name: "Germany", flag: flagEmoji("DE") },
  DEN: { name: "Denmark", flag: flagEmoji("DK") },
  POL: { name: "Poland", flag: flagEmoji("PL") },
  CAN: { name: "Canada", flag: flagEmoji("CA") },
  CHN: { name: "China", flag: flagEmoji("CN") },
  GBR: { name: "United Kingdom", flag: flagEmoji("GB") },
  // A few races are jointly hosted by two countries.
  BEL_NED: { name: "Belgium / Netherlands", flag: flagEmoji("BE") + flagEmoji("NL") },
};

const GRAND_TOURS = new Set([
  "Giro d'Italia",
  "Tour de France",
  "Vuelta a España",
  "Giro d'Italia Women",
  "Tour de France Femmes",
  "La Vuelta Femenina",
]);

const MONUMENTS = new Set([
  "Milan–San Remo",
  "Milan–San Remo Women",
  "Tour of Flanders",
  "Paris–Roubaix",
  "Paris–Roubaix Femmes",
  "Liège–Bastogne–Liège",
  "Liège–Bastogne–Liège Femmes",
  "Il Lombardia",
]);

export type CyclingRace = {
  name: string;
  tour: "men" | "women";
  country: string;
  flag: string;
  dateLabel: string;
  startDate: string;
  endDate: string;
  isGrandTour: boolean;
  isMonument: boolean;
};

type RawRace = {
  name: string;
  tour: "men" | "women";
  countryCode: string;
  dateLabel: string;
  startDate: string;
  endDate: string;
};

const RAW_RACES: RawRace[] = [
  // Men's — 2026 UCI World Tour
  { name: "Tour Down Under", tour: "men", countryCode: "AUS", dateLabel: "20–25 January", startDate: "2026-01-20", endDate: "2026-01-25" },
  { name: "Cadel Evans Great Ocean Road Race", tour: "men", countryCode: "AUS", dateLabel: "1 February", startDate: "2026-02-01", endDate: "2026-02-01" },
  { name: "UAE Tour", tour: "men", countryCode: "UAE", dateLabel: "16–22 February", startDate: "2026-02-16", endDate: "2026-02-22" },
  { name: "Omloop Het Nieuwsblad", tour: "men", countryCode: "BEL", dateLabel: "28 February", startDate: "2026-02-28", endDate: "2026-02-28" },
  { name: "Strade Bianche", tour: "men", countryCode: "ITA", dateLabel: "7 March", startDate: "2026-03-07", endDate: "2026-03-07" },
  { name: "Paris–Nice", tour: "men", countryCode: "FRA", dateLabel: "8–15 March", startDate: "2026-03-08", endDate: "2026-03-15" },
  { name: "Tirreno–Adriatico", tour: "men", countryCode: "ITA", dateLabel: "9–15 March", startDate: "2026-03-09", endDate: "2026-03-15" },
  { name: "Milan–San Remo", tour: "men", countryCode: "ITA", dateLabel: "21 March", startDate: "2026-03-21", endDate: "2026-03-21" },
  { name: "Volta a Catalunya", tour: "men", countryCode: "ESP", dateLabel: "23–29 March", startDate: "2026-03-23", endDate: "2026-03-29" },
  { name: "Tour of Bruges", tour: "men", countryCode: "BEL", dateLabel: "25 March", startDate: "2026-03-25", endDate: "2026-03-25" },
  { name: "E3 Saxo Classic", tour: "men", countryCode: "BEL", dateLabel: "27 March", startDate: "2026-03-27", endDate: "2026-03-27" },
  { name: "Gent–Wevelgem", tour: "men", countryCode: "BEL", dateLabel: "29 March", startDate: "2026-03-29", endDate: "2026-03-29" },
  { name: "Dwars door Vlaanderen", tour: "men", countryCode: "BEL", dateLabel: "1 April", startDate: "2026-04-01", endDate: "2026-04-01" },
  { name: "Tour of Flanders", tour: "men", countryCode: "BEL", dateLabel: "5 April", startDate: "2026-04-05", endDate: "2026-04-05" },
  { name: "Tour of the Basque Country", tour: "men", countryCode: "ESP", dateLabel: "6–11 April", startDate: "2026-04-06", endDate: "2026-04-11" },
  { name: "Paris–Roubaix", tour: "men", countryCode: "FRA", dateLabel: "12 April", startDate: "2026-04-12", endDate: "2026-04-12" },
  { name: "Amstel Gold Race", tour: "men", countryCode: "NED", dateLabel: "19 April", startDate: "2026-04-19", endDate: "2026-04-19" },
  { name: "La Flèche Wallonne", tour: "men", countryCode: "BEL", dateLabel: "22 April", startDate: "2026-04-22", endDate: "2026-04-22" },
  { name: "Liège–Bastogne–Liège", tour: "men", countryCode: "BEL", dateLabel: "26 April", startDate: "2026-04-26", endDate: "2026-04-26" },
  { name: "Tour de Romandie", tour: "men", countryCode: "SUI", dateLabel: "28 April – 3 May", startDate: "2026-04-28", endDate: "2026-05-03" },
  { name: "Eschborn–Frankfurt", tour: "men", countryCode: "GER", dateLabel: "1 May", startDate: "2026-05-01", endDate: "2026-05-01" },
  { name: "Giro d'Italia", tour: "men", countryCode: "ITA", dateLabel: "8–31 May", startDate: "2026-05-08", endDate: "2026-05-31" },
  { name: "Tour Auvergne-Rhône-Alpes", tour: "men", countryCode: "FRA", dateLabel: "7–14 June", startDate: "2026-06-07", endDate: "2026-06-14" },
  { name: "Copenhagen Sprint", tour: "men", countryCode: "DEN", dateLabel: "14 June", startDate: "2026-06-14", endDate: "2026-06-14" },
  { name: "Tour de Suisse", tour: "men", countryCode: "SUI", dateLabel: "17–21 June", startDate: "2026-06-17", endDate: "2026-06-21" },
  { name: "Tour de France", tour: "men", countryCode: "FRA", dateLabel: "4–26 July", startDate: "2026-07-04", endDate: "2026-07-26" },
  { name: "Clásica de San Sebastián", tour: "men", countryCode: "ESP", dateLabel: "1 August", startDate: "2026-08-01", endDate: "2026-08-01" },
  { name: "Tour de Pologne", tour: "men", countryCode: "POL", dateLabel: "3–9 August", startDate: "2026-08-03", endDate: "2026-08-09" },
  { name: "Hamburg Cyclassics", tour: "men", countryCode: "GER", dateLabel: "16 August", startDate: "2026-08-16", endDate: "2026-08-16" },
  { name: "Renewi Tour", tour: "men", countryCode: "BEL_NED", dateLabel: "19–23 August", startDate: "2026-08-19", endDate: "2026-08-23" },
  { name: "Vuelta a España", tour: "men", countryCode: "ESP", dateLabel: "22 August – 13 September", startDate: "2026-08-22", endDate: "2026-09-13" },
  { name: "Bretagne Classic", tour: "men", countryCode: "FRA", dateLabel: "30 August", startDate: "2026-08-30", endDate: "2026-08-30" },
  { name: "Grand Prix Cycliste de Québec", tour: "men", countryCode: "CAN", dateLabel: "11 September", startDate: "2026-09-11", endDate: "2026-09-11" },
  { name: "Grand Prix Cycliste de Montréal", tour: "men", countryCode: "CAN", dateLabel: "13 September", startDate: "2026-09-13", endDate: "2026-09-13" },
  { name: "Il Lombardia", tour: "men", countryCode: "ITA", dateLabel: "10 October", startDate: "2026-10-10", endDate: "2026-10-10" },
  { name: "Tour of Guangxi", tour: "men", countryCode: "CHN", dateLabel: "13–18 October", startDate: "2026-10-13", endDate: "2026-10-18" },

  // Women's — 2026 UCI Women's World Tour
  { name: "Women's Tour Down Under", tour: "women", countryCode: "AUS", dateLabel: "17–19 January", startDate: "2026-01-17", endDate: "2026-01-19" },
  { name: "Cadel Evans Great Ocean Road Race", tour: "women", countryCode: "AUS", dateLabel: "31 January", startDate: "2026-01-31", endDate: "2026-01-31" },
  { name: "UAE Tour Women", tour: "women", countryCode: "UAE", dateLabel: "5–8 February", startDate: "2026-02-05", endDate: "2026-02-08" },
  { name: "Omloop Het Nieuwsblad", tour: "women", countryCode: "BEL", dateLabel: "28 February", startDate: "2026-02-28", endDate: "2026-02-28" },
  { name: "Strade Bianche Donne", tour: "women", countryCode: "ITA", dateLabel: "7 March", startDate: "2026-03-07", endDate: "2026-03-07" },
  { name: "Trofeo Alfredo Binda–Comune di Cittiglio", tour: "women", countryCode: "ITA", dateLabel: "15 March", startDate: "2026-03-15", endDate: "2026-03-15" },
  { name: "Milan–San Remo Women", tour: "women", countryCode: "ITA", dateLabel: "21 March", startDate: "2026-03-21", endDate: "2026-03-21" },
  { name: "Tour of Bruges Women", tour: "women", countryCode: "BEL", dateLabel: "26 March", startDate: "2026-03-26", endDate: "2026-03-26" },
  { name: "Gent–Wevelgem", tour: "women", countryCode: "BEL", dateLabel: "29 March", startDate: "2026-03-29", endDate: "2026-03-29" },
  { name: "Dwars door Vlaanderen", tour: "women", countryCode: "BEL", dateLabel: "1 April", startDate: "2026-04-01", endDate: "2026-04-01" },
  { name: "Tour of Flanders", tour: "women", countryCode: "BEL", dateLabel: "5 April", startDate: "2026-04-05", endDate: "2026-04-05" },
  { name: "Paris–Roubaix Femmes", tour: "women", countryCode: "FRA", dateLabel: "12 April", startDate: "2026-04-12", endDate: "2026-04-12" },
  { name: "Amstel Gold Race", tour: "women", countryCode: "NED", dateLabel: "19 April", startDate: "2026-04-19", endDate: "2026-04-19" },
  { name: "La Flèche Wallonne Femmes", tour: "women", countryCode: "BEL", dateLabel: "22 April", startDate: "2026-04-22", endDate: "2026-04-22" },
  { name: "Liège–Bastogne–Liège Femmes", tour: "women", countryCode: "BEL", dateLabel: "26 April", startDate: "2026-04-26", endDate: "2026-04-26" },
  { name: "La Vuelta Femenina", tour: "women", countryCode: "ESP", dateLabel: "3–9 May", startDate: "2026-05-03", endDate: "2026-05-09" },
  { name: "Itzulia Women", tour: "women", countryCode: "ESP", dateLabel: "15–17 May", startDate: "2026-05-15", endDate: "2026-05-17" },
  { name: "Vuelta a Burgos Féminas", tour: "women", countryCode: "ESP", dateLabel: "21–24 May", startDate: "2026-05-21", endDate: "2026-05-24" },
  { name: "Giro d'Italia Women", tour: "women", countryCode: "ITA", dateLabel: "30 May – 7 June", startDate: "2026-05-30", endDate: "2026-06-07" },
  { name: "Copenhagen Sprint", tour: "women", countryCode: "DEN", dateLabel: "13 June", startDate: "2026-06-13", endDate: "2026-06-13" },
  { name: "Tour de Suisse Women", tour: "women", countryCode: "SUI", dateLabel: "17–21 June", startDate: "2026-06-17", endDate: "2026-06-21" },
  { name: "Tour de France Femmes", tour: "women", countryCode: "FRA", dateLabel: "1–9 August", startDate: "2026-08-01", endDate: "2026-08-09" },
  { name: "Tour of Britain Women", tour: "women", countryCode: "GBR", dateLabel: "19–23 August", startDate: "2026-08-19", endDate: "2026-08-23" },
  { name: "Classic Lorient Agglomération", tour: "women", countryCode: "FRA", dateLabel: "29 August", startDate: "2026-08-29", endDate: "2026-08-29" },
  { name: "Tour de Romandie Féminin", tour: "women", countryCode: "SUI", dateLabel: "4–6 September", startDate: "2026-09-04", endDate: "2026-09-06" },
  { name: "Tour of Chongming Island", tour: "women", countryCode: "CHN", dateLabel: "13–15 October", startDate: "2026-10-13", endDate: "2026-10-15" },
  { name: "Tour of Guangxi", tour: "women", countryCode: "CHN", dateLabel: "18 October", startDate: "2026-10-18", endDate: "2026-10-18" },
];

export const CYCLING_CALENDAR_2026: CyclingRace[] = RAW_RACES.map((r) => {
  const country = COUNTRIES[r.countryCode];
  return {
    name: r.name,
    tour: r.tour,
    country: country.name,
    flag: country.flag,
    dateLabel: r.dateLabel,
    startDate: r.startDate,
    endDate: r.endDate,
    isGrandTour: GRAND_TOURS.has(r.name),
    isMonument: MONUMENTS.has(r.name),
  };
});

// Races that have started but not finished, or start within `windowDays` —
// a time window (not a fixed count) since the calendar's density varies a
// lot across the season (dense spring classics vs. quiet stretches).
export function getUpcomingCyclingRaces(windowDays = 28, from: Date = new Date()): CyclingRace[] {
  const today = from.toISOString().slice(0, 10);
  const horizon = new Date(from);
  horizon.setDate(horizon.getDate() + windowDays);
  const horizonISO = horizon.toISOString().slice(0, 10);

  return CYCLING_CALENDAR_2026.filter((r) => r.endDate >= today && r.startDate <= horizonISO).sort(
    (a, b) => a.startDate.localeCompare(b.startDate)
  );
}
