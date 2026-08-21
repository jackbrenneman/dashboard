import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/strava/crypto";
import { STRAVA_SCOPE, athleteName, exchangeCode } from "@/lib/strava/oauth";

const STATE_COOKIE = "strava_oauth_state";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const fail = (reason: string) => {
    const res = NextResponse.redirect(`${origin}/workouts?strava=${reason}`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  if (error || !code || !state) {
    return fail("error");
  }

  // CSRF: the state we set on /connect must match what Strava echoed back.
  const cookieState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.split("=")[1];
  if (!cookieState || cookieState !== state) {
    return fail("error");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  try {
    const tokens = await exchangeCode(origin, code);
    if (!tokens.refresh_token) {
      return fail("error");
    }

    const { error: upsertError } = await supabase.from("strava_tokens").upsert({
      user_id: user.id,
      refresh_token: encrypt(tokens.refresh_token),
      access_token: encrypt(tokens.access_token),
      access_token_expires_at: new Date(tokens.expires_at * 1000).toISOString(),
      athlete_id: tokens.athlete?.id ?? null,
      athlete_name: athleteName(tokens.athlete),
      scope: STRAVA_SCOPE,
      needs_reconnect: false,
      connected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (upsertError) {
      console.error("strava token upsert failed:", upsertError.message);
      return fail("error");
    }
  } catch (err) {
    console.error("strava callback failed:", err);
    return fail("error");
  }

  const res = NextResponse.redirect(`${origin}/workouts?strava=connected`);
  res.cookies.delete(STATE_COOKIE);
  return res;
}
