"use client";

import { useMemo, useRef, useState } from "react";
import { usePokemonStore } from "@/stores/pokemon.store";
import { fetchPokemon, fetchPokemonListPage, getListUrl, normalizePokemon } from "@/lib/pokeapi";

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function usePokedexAggregation() {
  const setRows = usePokemonStore((s) => s.setRows);
  const [total, setTotal] = useState<number>(0);
  const [fetched, setFetched] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>("");

  const abortRef = useRef<AbortController | null>(null);

  const progressText = useMemo(() => {
    if (!isRunning) return "";
    if (!total) return "Starting…";
    return `Fetched ${fetched} / ${total} Pokémon…`;
  }, [isRunning, total, fetched]);

  async function run() {
    setError("");
    setFetched(0);
    setTotal(0);
    setIsRunning(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // 1) Fetch all list pages (fast)
      const limit = 200;
      let offset = 0;

      // first page to get count
      const first = await fetchPokemonListPage(getListUrl(offset, limit));
      setTotal(first.count);

      const allResults = [...first.results];
      offset += limit;

      while (allResults.length < first.count && !controller.signal.aborted) {
        const page = await fetchPokemonListPage(getListUrl(offset, limit));
        allResults.push(...page.results);
        offset += limit;
      }

      // 2) Fetch details with bounded concurrency
      const concurrency = 15; // safe default
      const batches = chunk(allResults, concurrency);

      const rows: ReturnType<typeof normalizePokemon>[] = [];

      for (const batch of batches) {
        if (controller.signal.aborted) break;

        const detail = await Promise.all(
          batch.map(async (x) => {
            const p = await fetchPokemon(x.url, controller.signal);
            return normalizePokemon(p);
          })
        );

        rows.push(...detail);
        setFetched(rows.length);
      }

      if (!controller.signal.aborted) {
        // stable ordering by id
        rows.sort((a, b) => a.id - b.id);
        setRows(rows, "api");
      }
    } catch (e) {
      if ((e as any)?.name === "AbortError") return;
      setError((e as Error).message || "Failed to fetch dataset");
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  return { run, cancel, isRunning, error, total, fetched, progressText };
}