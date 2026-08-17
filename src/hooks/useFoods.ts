"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCached, setCached } from "@/lib/queryCache";
import type { FoodEntry, Reaction } from "@/lib/types";

const CACHE_KEY = "foods";

export function useFoods() {
  const [foods, setFoods] = useState<FoodEntry[]>(
    () => getCached<FoodEntry[]>(CACHE_KEY) ?? []
  );
  const [loading, setLoading] = useState(
    () => getCached<FoodEntry[]>(CACHE_KEY) === undefined
  );
  const supabase = createClient();

  useEffect(() => {
    // Already warm from a previous mount of this tab — skip the refetch.
    if (getCached<FoodEntry[]>(CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("foods_tried")
        .select("id, food, reaction, logged_on")
        .order("logged_on", { ascending: false })
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setFoods(data ?? []);
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

  const applyFoods = useCallback((updater: (prev: FoodEntry[]) => FoodEntry[]) => {
    setFoods((prev) => {
      const next = updater(prev);
      setCached(CACHE_KEY, next);
      return next;
    });
  }, []);

  const addFood = useCallback(
    async (food: string, reaction: Reaction) => {
      const trimmed = food.trim();
      if (!trimmed) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("foods_tried")
        .insert({ food: trimmed, reaction, user_id: user.id })
        .select("id, food, reaction, logged_on")
        .single();

      if (!error && data) {
        applyFoods((prev) => [data, ...prev]);
      }
    },
    [supabase, applyFoods]
  );

  const updateFood = useCallback(
    async (
      id: string,
      updates: { food: string; reaction: Reaction; logged_on: string }
    ) => {
      const trimmed = updates.food.trim();
      if (!trimmed || !updates.logged_on) return;
      const next = { ...updates, food: trimmed };

      const previous = foods;
      applyFoods((prev) =>
        prev
          .map((f) => (f.id === id ? { ...f, ...next } : f))
          .sort((a, b) => (a.logged_on < b.logged_on ? 1 : a.logged_on > b.logged_on ? -1 : 0))
      );

      const { error } = await supabase
        .from("foods_tried")
        .update(next)
        .eq("id", id);
      if (error) applyFoods(() => previous);
    },
    [foods, supabase, applyFoods]
  );

  const deleteFood = useCallback(
    async (id: string) => {
      const previous = foods;
      applyFoods((prev) => prev.filter((f) => f.id !== id));
      const { error } = await supabase.from("foods_tried").delete().eq("id", id);
      if (error) applyFoods(() => previous);
    },
    [foods, supabase, applyFoods]
  );

  return { foods, loading, addFood, updateFood, deleteFood };
}
