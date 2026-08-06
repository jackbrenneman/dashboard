"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem } from "@/lib/types";

// Shared behavior for any reorderable checklist table (todos, meals) —
// same columns (id, text, done, position), same CRUD + drag-reorder rules.
export function useChecklist(table: "todos" | "meals") {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from(table)
        .select("id, text, done, position")
        .order("position", { ascending: true });
      if (!cancelled) {
        setItems(data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

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
        setItems((prev) => [...prev, data]);
      }
    },
    [items, supabase, table]
  );

  const toggleItem = useCallback(
    async (id: string) => {
      const current = items.find((i) => i.id === id);
      if (!current) return;
      const nextDone = !current.done;

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, done: nextDone } : i))
      );
      const { error } = await supabase
        .from(table)
        .update({ done: nextDone })
        .eq("id", id);
      if (error) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, done: !nextDone } : i))
        );
      }
    },
    [items, supabase, table]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const previous = items;
      setItems((prev) => prev.filter((i) => i.id !== id));
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) setItems(previous);
    },
    [items, supabase, table]
  );

  const updateItemText = useCallback(
    async (id: string, newText: string) => {
      const trimmed = newText.trim();
      if (!trimmed) return;
      const previous = items;
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, text: trimmed } : i))
      );
      const { error } = await supabase
        .from(table)
        .update({ text: trimmed })
        .eq("id", id);
      if (error) setItems(previous);
    },
    [items, supabase, table]
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

      setItems(reordered);

      const results = await Promise.all(
        reordered.map((i) =>
          supabase.from(table).update({ position: i.position }).eq("id", i.id)
        )
      );
      if (results.some((r) => r.error)) setItems(previous);
    },
    [items, supabase, table]
  );

  const clearAll = useCallback(async () => {
    const previous = items;
    setItems([]);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) setItems(previous);
  }, [items, supabase, table]);

  return {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    updateItemText,
    reorderItems,
    clearAll,
  };
}
