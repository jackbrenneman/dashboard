"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSetup() {
  const [loading, setLoading] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("setup")
        .select("user_id")
        .maybeSingle();
      if (cancelled) return;
      if (!data) setIsFirstRun(true);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeSetup = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("setup").upsert({ user_id: user.id });
    if (!error) setIsFirstRun(false);
  }, [supabase]);

  return { loading, isFirstRun, completeSetup };
}
