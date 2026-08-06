"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayISO } from "@/lib/dates";

export type Setup = {
  leaveStart: string;
  babyBirth: string;
};

export function useSetup() {
  const [setup, setSetup] = useState<Setup>({
    leaveStart: todayISO(),
    babyBirth: "",
  });
  const [loading, setLoading] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("setup")
        .select("leave_start, baby_birth")
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setSetup({
          leaveStart: data.leave_start ?? todayISO(),
          babyBirth: data.baby_birth ?? "",
        });
      } else {
        setIsFirstRun(true);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSetup = useCallback(
    async (next: Setup) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("setup").upsert({
        user_id: user.id,
        leave_start: next.leaveStart || todayISO(),
        baby_birth: next.babyBirth || null,
      });

      if (!error) {
        setSetup(next);
        setIsFirstRun(false);
      }
    },
    [supabase]
  );

  return { setup, loading, isFirstRun, saveSetup };
}
