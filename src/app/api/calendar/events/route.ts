import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken, NotConnectedError } from "@/lib/google/tokens";
import { listEvents } from "@/lib/google/calendar";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json({ error: "Missing start/end" }, { status: 400 });
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
    const events = await listEvents(accessToken, start, end);
    return NextResponse.json({ events });
  } catch (err) {
    if (err instanceof NotConnectedError) {
      return NextResponse.json(
        { error: "not_connected", needsReconnect: err.needsReconnect },
        { status: 409 }
      );
    }
    console.error("calendar events fetch failed:", err);
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
