"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCached, setCached } from "@/lib/queryCache";
import type { ImportantLink } from "@/lib/types";

const TABLE = "school_links";
const CACHE_KEY = "links:school_links";

// School important links — reorderable via drag, opens in a new tab.
export function useSchoolLinks() {
  const [items, setItems] = useState<ImportantLink[]>(
    () => getCached<ImportantLink[]>(CACHE_KEY) ?? []
  );
  const [loading, setLoading] = useState(
    () => getCached<ImportantLink[]>(CACHE_KEY) === undefined
  );
  const supabase = createClient();

  useEffect(() => {
    if (getCached<ImportantLink[]>(CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from(TABLE)
        .select("id, text, url, position")
        .order("position", { ascending: true });
      if (!cancelled) {
        setItems(data ?? []);
        setCached(CACHE_KEY, data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyItems = useCallback(
    (updater: (prev: ImportantLink[]) => ImportantLink[]) => {
      setItems((prev) => {
        const next = updater(prev);
        setCached(CACHE_KEY, next);
        return next;
      });
    },
    []
  );

  const addItem = useCallback(
    async (text: string, url: string) => {
      const trimmed = text.trim();
      if (!trimmed || !url) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const nextPosition =
        items.length === 0 ? 0 : Math.max(...items.map((i) => i.position)) + 1;

      const { data, error } = await supabase
        .from(TABLE)
        .insert({ text: trimmed, url, position: nextPosition, user_id: user.id })
        .select("id, text, url, position")
        .single();

      if (!error && data) {
        applyItems((prev) => [...prev, data]);
      }
    },
    [items, supabase, applyItems]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const previous = items;
      applyItems((prev) => prev.filter((i) => i.id !== id));
      const { error } = await supabase.from(TABLE).delete().eq("id", id);
      if (error) applyItems(() => previous);
    },
    [items, supabase, applyItems]
  );

  const reorderItems = useCallback(
    async (orderedIds: string[]) => {
      const previous = items;
      const byId = new Map(items.map((i) => [i.id, i]));
      const reordered = orderedIds
        .map((id, index) => {
          const item = byId.get(id);
          return item ? { ...item, position: index } : null;
        })
        .filter((i): i is ImportantLink => i !== null);

      applyItems(() => reordered);

      const results = await Promise.all(
        reordered.map((i) =>
          supabase.from(TABLE).update({ position: i.position }).eq("id", i.id)
        )
      );
      if (results.some((r) => r.error)) applyItems(() => previous);
    },
    [items, supabase, applyItems]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from(TABLE)
      .select("id, text, url, position")
      .order("position", { ascending: true });
    setItems(data ?? []);
    setCached(CACHE_KEY, data ?? []);
    setLoading(false);
  }, [supabase]);

  return { items, loading, addItem, deleteItem, reorderItems, refresh };
}
