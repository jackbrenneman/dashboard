"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" className="gear-btn" style={{ width: "auto", padding: "0 12px", fontSize: "12.5px", fontWeight: 600 }} onClick={handleSignOut}>
      Sign out
    </button>
  );
}
