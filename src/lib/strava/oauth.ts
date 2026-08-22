// Strava OAuth 2.0 helpers (raw fetch, no SDK). All calls are server-side.

const AUTH_ENDPOINT = "https://www.strava.com/oauth/authorize";
const TOKEN_ENDPOINT = "https://www.strava.com/oauth/token";
const REVOKE_ENDPOINT = "https://www.strava.com/oauth/revoke";

// `activity:read_all` is required (beyond plain `read`) to see activities
// set to "Only You" visibility, not just public/followers-visible ones.
export const STRAVA_SCOPE = "read,activity:read_all";

export function redirectUri(origin: string): string {
  return `${origin}/api/strava/callback`;
}

function clientId(): string {
  const id = process.env.STRAVA_CLIENT_ID;
  if (!id) throw new Error("STRAVA_CLIENT_ID is not set");
  return id;
}

function clientSecret(): string {
  const secret = process.env.STRAVA_CLIENT_SECRET;
  if (!secret) throw new Error("STRAVA_CLIENT_SECRET is not set");
  return secret;
}

export function buildAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: STRAVA_SCOPE,
    approval_prompt: "auto",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export type StravaAthlete = {
  id: number;
  firstname?: string;
  lastname?: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // absolute Unix epoch seconds
  expires_in: number;
  athlete?: StravaAthlete;
};

export class StravaAuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "StravaAuthError";
  }
}

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new StravaAuthError(
      data.message || "Token request failed",
      res.status
    );
  }
  return data as TokenResponse;
}

export function exchangeCode(
  origin: string,
  code: string
): Promise<TokenResponse> {
  return postToken(
    new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
      code,
    })
  );
}

export function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  return postToken(
    new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  );
}

export function athleteName(athlete?: StravaAthlete): string | null {
  if (!athlete) return null;
  const name = [athlete.firstname, athlete.lastname].filter(Boolean).join(" ");
  return name || null;
}

export async function revokeToken(accessToken: string): Promise<void> {
  try {
    const basic = Buffer.from(`${clientId()}:${clientSecret()}`).toString(
      "base64"
    );
    await fetch(REVOKE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ token: accessToken }),
    });
  } catch {
    // Best-effort — disconnect proceeds even if revoke fails.
  }
}
