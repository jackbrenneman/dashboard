"use client";

import { useCallback, useEffect, useState } from "react";
import { getCached, setCached, clearCachedPrefix } from "@/lib/queryCache";
import type { UpcomingRace, DriverStandingRow, ConstructorStandingRow } from "@/lib/sports/f1Data";

const CACHE_KEY = "f1:data";

type F1Data = {
  races: UpcomingRace[];
  driverStandings: DriverStandingRow[];
  constructorStandings: ConstructorStandingRow[];
};

const EMPTY: F1Data = { races: [], driverStandings: [], constructorStandings: [] };

export function useF1() {
  const cached = getCached<F1Data>(CACHE_KEY);
  const [data, setData] = useState<F1Data>(cached ?? EMPTY);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (getCached<F1Data>(CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/sports/f1");
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        if (cancelled) return;
        const next: F1Data = {
          races: json.races ?? [],
          driverStandings: json.driverStandings ?? [],
          constructorStandings: json.constructorStandings ?? [],
        };
        setData(next);
        setCached(CACHE_KEY, next);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    clearCachedPrefix(CACHE_KEY);
    setLoading(true);
    try {
      const res = await fetch("/api/sports/f1");
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      const next: F1Data = {
        races: json.races ?? [],
        driverStandings: json.driverStandings ?? [],
        constructorStandings: json.constructorStandings ?? [],
      };
      setData(next);
      setCached(CACHE_KEY, next);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    races: data.races,
    driverStandings: data.driverStandings,
    constructorStandings: data.constructorStandings,
    loading,
    error,
    refresh,
  };
}
