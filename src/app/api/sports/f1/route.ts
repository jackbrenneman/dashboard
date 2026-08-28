import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingRaces, getDriverStandings, getConstructorStandings } from "@/lib/sports/f1Data";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [races, driverStandings, constructorStandings] = await Promise.all([
      getUpcomingRaces(),
      getDriverStandings(),
      getConstructorStandings(),
    ]);
    return NextResponse.json({ races, driverStandings, constructorStandings });
  } catch (err) {
    console.error("f1 fetch failed:", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
