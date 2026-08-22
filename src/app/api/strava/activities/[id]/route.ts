import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, NotConnectedError } from "@/lib/strava/tokens";
import { getActivityDetail } from "@/lib/strava/activities";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const activityId = Number(id);
  if (!Number.isFinite(activityId)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(supabase, user.id);
    const detail = await getActivityDetail(accessToken, activityId);
    return NextResponse.json({ detail });
  } catch (err) {
    if (err instanceof NotConnectedError) {
      return NextResponse.json(
        { error: "not_connected", needsReconnect: err.needsReconnect },
        { status: 409 }
      );
    }
    console.error("strava activity detail fetch failed:", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
