import type { SupabaseClient } from "@supabase/supabase-js";
import { decrypt, encrypt } from "@/lib/google/crypto";
import { GoogleAuthError, refreshAccessToken } from "@/lib/google/oauth";

// Thrown when there is no stored connection, or the refresh token is no longer
// valid (revoked / expired). The UI turns this into a "Connect"/"Reconnect".
export class NotConnectedError extends Error {
  constructor(readonly needsReconnect = false) {
    super(needsReconnect ? "Reconnect required" : "Not connected");
    this.name = "NotConnectedError";
  }
}

type TokenRow = {
  refresh_token: string;
  access_token: string | null;
  access_token_expires_at: string | null;
  needs_reconnect: boolean;
};

// Refresh a minute early so a token doesn't expire mid-request.
const EXPIRY_BUFFER_MS = 60_000;

export async function getValidAccessToken(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("refresh_token, access_token, access_token_expires_at, needs_reconnect")
    .eq("user_id", userId)
    .maybeSingle<TokenRow>();

  if (!data) throw new NotConnectedError(false);
  if (data.needs_reconnect) throw new NotConnectedError(true);

  const expiresAt = data.access_token_expires_at
    ? new Date(data.access_token_expires_at).getTime()
    : 0;
  if (data.access_token && expiresAt > Date.now() + EXPIRY_BUFFER_MS) {
    return decrypt(data.access_token);
  }

  const refreshToken = decrypt(data.refresh_token);
  try {
    const refreshed = await refreshAccessToken(refreshToken);
    const newExpiresAt = new Date(
      Date.now() + refreshed.expires_in * 1000
    ).toISOString();

    await supabase
      .from("google_calendar_tokens")
      .update({
        access_token: encrypt(refreshed.access_token),
        access_token_expires_at: newExpiresAt,
        // Google may rotate the refresh token; persist it if so.
        ...(refreshed.refresh_token
          ? { refresh_token: encrypt(refreshed.refresh_token) }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return refreshed.access_token;
  } catch (err) {
    if (err instanceof GoogleAuthError && err.code === "invalid_grant") {
      await supabase
        .from("google_calendar_tokens")
        .update({ needs_reconnect: true, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      throw new NotConnectedError(true);
    }
    throw err;
  }
}
