import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { localDateKey } from "@/lib/dates";
import { getMatches, getStandings } from "@/lib/sports/footballData";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 7);
  const to = new Date(today);
  to.setDate(to.getDate() + 14);

  try {
    const [matches, standings] = await Promise.all([
      getMatches(localDateKey(from), localDateKey(to)),
      getStandings(),
    ]);
    return NextResponse.json({ matches, standings });
  } catch (err) {
    console.error("epl fetch failed:", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
