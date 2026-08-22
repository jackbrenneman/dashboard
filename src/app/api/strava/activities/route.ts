import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, NotConnectedError } from "@/lib/strava/tokens";
import { listActivities } from "@/lib/strava/activities";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(supabase, user.id);
    const { activities, hasMore } = await listActivities(accessToken, page);
    return NextResponse.json({ activities, hasMore });
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
