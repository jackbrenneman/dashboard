"use client";

import { useCallback, useEffect, useState } from "react";
import { getCached, setCached, clearCachedPrefix } from "@/lib/queryCache";
import type { Match, StandingsRow } from "@/lib/sports/footballData";

const CACHE_KEY = "epl:data";

type EplData = { matches: Match[]; standings: StandingsRow[] };

const EMPTY: EplData = { matches: [], standings: [] };

export function useEpl() {
  const cached = getCached<EplData>(CACHE_KEY);
  const [data, setData] = useState<EplData>(cached ?? EMPTY);
  const [loading, setLoading] = useState(cached === undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (getCached<EplData>(CACHE_KEY) !== undefined) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/sports/epl");
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        if (cancelled) return;
        const next: EplData = { matches: json.matches ?? [], standings: json.standings ?? [] };
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
      const res = await fetch("/api/sports/epl");
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      const next: EplData = { matches: json.matches ?? [], standings: json.standings ?? [] };
      setData(next);
      setCached(CACHE_KEY, next);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { matches: data.matches, standings: data.standings, loading, error, refresh };
}
