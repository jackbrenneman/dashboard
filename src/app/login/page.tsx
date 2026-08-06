"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [resetSent, setResetSent] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("signInWithPassword failed:", error.message);
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function sendPasswordReset() {
    if (!email) {
      setErrorMessage("Enter your email above first.");
      setStatus("error");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setResetSent(true);
      setStatus("idle");
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Dashboard</h1>
        {resetSent ? (
          <p className="muted">
            Check your email for a password reset link.
          </p>
        ) : (
          <form onSubmit={signIn}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Signing in…" : "Sign in"}
            </button>
            {status === "error" && (
              <p className="error">{errorMessage || "Something went wrong — try again."}</p>
            )}
            <p className="muted" style={{ marginTop: "12px" }}>
              <button
                type="button"
                className="link"
                onClick={sendPasswordReset}
              >
                Forgot password?
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
