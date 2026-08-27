"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCached, setCached } from "@/lib/queryCache";
import type { ChecklistItem } from "@/lib/types";

// Shared behavior for any reorderable checklist table (todos, meals, school_todos) —
// same columns (id, text, done, position), same CRUD + drag-reorder rules.
export function useChecklist(table: "todos" | "meals" | "school_todos") {
  const cacheKey = `checklist:${table}`;
  const [items, setItems] = useState<ChecklistItem[]>(
    () => getCached<ChecklistItem[]>(cacheKey) ?? []
  );
  const [loading, setLoading] = useState(
    () => getCached<ChecklistItem[]>(cacheKey) === undefined
  );
  const supabase = createClient();

  useEffect(() => {
    // Already warm from a previous mount of this tab — skip the refetch.
    if (getCached<ChecklistItem[]>(cacheKey) !== undefined) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from(table)
        .select("id, text, done, position")
        .order("position", { ascending: true });
      if (!cancelled) {
        setItems(data ?? []);
        setCached(cacheKey, data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  // Every mutation below routes through here so the cache stays in sync,
  // keeping the next tab switch's initial render up to date.
  const applyItems = useCallback(
    (updater: (prev: ChecklistItem[]) => ChecklistItem[]) => {
      setItems((prev) => {
        const next = updater(prev);
        setCached(cacheKey, next);
        return next;
      });
    },
    [cacheKey]
  );

  const addItem = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const nextPosition =
        items.length === 0 ? 0 : Math.max(...items.map((i) => i.position)) + 1;

      const { data, error } = await supabase
        .from(table)
        .insert({ text: trimmed, position: nextPosition, user_id: user.id })
        .select("id, text, done, position")
        .single();

      if (!error && data) {
        applyItems((prev) => [...prev, data]);
      }
    },
    [items, supabase, table, applyItems]
  );

  const toggleItem = useCallback(
    async (id: string) => {
      const current = items.find((i) => i.id === id);
      if (!current) return;
      const nextDone = !current.done;

      applyItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, done: nextDone } : i))
      );
      const { error } = await supabase
        .from(table)
        .update({ done: nextDone })
        .eq("id", id);
      if (error) {
        applyItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, done: !nextDone } : i))
        );
      }
    },
    [items, supabase, table, applyItems]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const previous = items;
      applyItems((prev) => prev.filter((i) => i.id !== id));
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) applyItems(() => previous);
    },
    [items, supabase, table, applyItems]
  );

  const updateItemText = useCallback(
    async (id: string, newText: string) => {
      const trimmed = newText.trim();
      if (!trimmed) return;
      const previous = items;
      applyItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, text: trimmed } : i))
      );
      const { error } = await supabase
        .from(table)
        .update({ text: trimmed })
        .eq("id", id);
      if (error) applyItems(() => previous);
    },
    [items, supabase, table, applyItems]
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
        .filter((i): i is ChecklistItem => i !== null);

      applyItems(() => reordered);

      const results = await Promise.all(
        reordered.map((i) =>
          supabase.from(table).update({ position: i.position }).eq("id", i.id)
        )
      );
      if (results.some((r) => r.error)) applyItems(() => previous);
    },
    [items, supabase, table, applyItems]
  );

  const clearAll = useCallback(async () => {
    const previous = items;
    applyItems(() => []);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) applyItems(() => previous);
  }, [items, supabase, table, applyItems]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from(table)
      .select("id, text, done, position")
      .order("position", { ascending: true });
    setItems(data ?? []);
    setCached(cacheKey, data ?? []);
    setLoading(false);
  }, [table, cacheKey, supabase]);

  return {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    updateItemText,
    reorderItems,
    clearAll,
    refresh,
  };
}
