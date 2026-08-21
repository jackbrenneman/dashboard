import { decrypt as decryptWith, encrypt as encryptWith } from "@/lib/crypto";

// Thin wrapper over the shared AES-256-GCM helper, keyed on this service's
// own encryption key.

export function encrypt(plaintext: string): string {
  return encryptWith(plaintext, "STRAVA_TOKEN_ENC_KEY");
}

export function decrypt(payload: string): string {
  return decryptWith(payload, "STRAVA_TOKEN_ENC_KEY");
}
