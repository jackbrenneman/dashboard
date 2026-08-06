"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FoodEntry, Reaction } from "@/lib/types";

export function useFoods() {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("foods_tried")
        .select("id, food, reaction, logged_on")
        .order("logged_on", { ascending: false })
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setFoods(data ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setFoods((prev) => [data, ...prev]);
      }
    },
    [supabase]
  );

  const deleteFood = useCallback(
    async (id: string) => {
      const previous = foods;
      setFoods((prev) => prev.filter((f) => f.id !== id));
      const { error } = await supabase.from("foods_tried").delete().eq("id", id);
      if (error) setFoods(previous);
    },
    [foods, supabase]
  );

  return { foods, loading, addFood, deleteFood };
}
