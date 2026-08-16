"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type Setup = {
  babyBirth: string;
};

export function useSetup() {
  const [setup, setSetup] = useState<Setup>({
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
        .select("baby_birth")
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setSetup({
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
