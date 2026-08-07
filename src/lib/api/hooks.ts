"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";

/**
 * Minimal data-fetching hook. Triggers whenever `key` changes.
 *
 *   const { data, error, loading, reload } = useApi("/api/products?category=men");
 *
 * Pass null as key to skip fetching.
 */
export function useApi<T = any>(key: string | null | (() => string)) {
  const k = typeof key === "function" ? key() : key;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);

  const reload = useCallback(async () => {
    if (!k) { setData(null); setLoading(false); return; }
    const id = ++reqId.current;
    setLoading(true); setError(null);
    try {
      const res = await api<T>(k);
      if (id === reqId.current) { setData(res); setLoading(false); }
    } catch (e: any) {
      if (id === reqId.current) { setError(e.message ?? "Failed to load"); setLoading(false); }
    }
  }, [k]);

  useEffect(() => { void reload(); }, [reload]);
  return { data, error, loading, reload };
}

/** Mutate / write helper that runs a fetch and returns the parsed response. */
export async function mutate<T = any>(path: string, init?: RequestInit) {
  return api<T>(path, init);
}
