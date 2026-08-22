import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/strava/crypto";
import { revokeToken } from "@/lib/strava/oauth";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data } = await supabase
    .from("strava_tokens")
    .select("access_token")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data?.access_token) {
    try {
      await revokeToken(decrypt(data.access_token));
    } catch {
      // Best-effort revoke; still remove the row below.
    }
  }

  await supabase.from("strava_tokens").delete().eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
