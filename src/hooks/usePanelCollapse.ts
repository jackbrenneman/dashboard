"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type PanelKey = "todo" | "solids" | "foodprep";

type CollapseState = Record<PanelKey, boolean>;

const DEFAULT_STATE: CollapseState = {
  todo: false,
  solids: false,
  foodprep: false,
};

export function usePanelCollapse() {
  const [collapse, setCollapse] = useState<CollapseState>(DEFAULT_STATE);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("panel_collapse")
        .select("todo, solids, foodprep")
        .maybeSingle();
      if (!cancelled && data) {
        setCollapse({
          todo: data.todo,
          solids: data.solids,
          foodprep: data.foodprep,
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    async (next: CollapseState) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("panel_collapse").upsert({
        user_id: user.id,
        ...next,
      });
    },
    [supabase]
  );

  const togglePanel = useCallback(
    (key: PanelKey) => {
      setCollapse((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const expandPanel = useCallback(
    (key: PanelKey) => {
      setCollapse((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev, [key]: false };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { collapse, togglePanel, expandPanel };
}
