import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, NotConnectedError } from "@/lib/strava/tokens";
import { listRecentActivities } from "@/lib/strava/activities";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(supabase, user.id);
    const activities = await listRecentActivities(accessToken);
    return NextResponse.json({ activities });
  } catch (err) {
    if (err instanceof NotConnectedError) {
      return NextResponse.json(
        { error: "not_connected", needsReconnect: err.needsReconnect },
        { status: 409 }
      );
    }
    console.error("strava activities fetch failed:", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
