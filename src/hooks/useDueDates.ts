"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCached, setCached } from "@/lib/queryCache";
import type { DueDate } from "@/lib/types";

const TABLE = "school_due_dates";
const CACHE_KEY = "due-dates:school_due_dates";

function byDateAscending(items: DueDate[]): DueDate[] {
  return [...items].sort((a, b) => a.date.localeCompare(b.date));
}

// Upcoming due dates for School — always displayed sorted soonest-first by
// date, never by manual drag order (see SchoolDueDates for why).
export function useDueDates() {
  const [items, setItems] = useState<DueDate[]>(
    () => getCached<DueDate[]>(CACHE_KEY) ?? []
  );
  const [loading, setLoading] = useState(
    () => getCached<DueDate[]>(CACHE_KEY) === undefined
  );
  const supabase = createClient();

  useEffect(() => {
    if (getCached<DueDate[]>(CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from(TABLE)
        .select("id, text, date, position")
        .order("date", { ascending: true });
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

  const applyItems = useCallback((updater: (prev: DueDate[]) => DueDate[]) => {
    setItems((prev) => {
      const next = updater(prev);
      setCached(CACHE_KEY, next);
      return next;
    });
  }, []);

  const addItem = useCallback(
    async (text: string, date: string) => {
      const trimmed = text.trim();
      if (!trimmed || !date) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const nextPosition =
        items.length === 0 ? 0 : Math.max(...items.map((i) => i.position)) + 1;

      const { data, error } = await supabase
        .from(TABLE)
        .insert({ text: trimmed, date, position: nextPosition, user_id: user.id })
        .select("id, text, date, position")
        .single();

      if (!error && data) {
        applyItems((prev) => byDateAscending([...prev, data]));
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

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from(TABLE)
      .select("id, text, date, position")
      .order("date", { ascending: true });
    setItems(data ?? []);
    setCached(CACHE_KEY, data ?? []);
    setLoading(false);
  }, [supabase]);

  return { items, loading, addItem, deleteItem, refresh };
}
