"use client";

import { useEffect, useRef } from "react";
import { useFinanceStore, type FinanceSnapshot } from "@/store/useFinanceStore";

// ─────────────────────────────────────────────────────────────────────────────
// StoreHydrator (step 6.3)
//
// Bridges server-loaded data (fetched once in the (app) layout via getUserData)
// into the client-side Zustand cache. Hydration runs in an effect — NOT during
// render — for two reasons:
//   1. The module-level store is shared across requests on the server, so it
//      must never be written there.
//   2. The first client render must match the SSR output (an empty store →
//      skeletons), or React throws a hydration mismatch. After mount the effect
//      fills the cache and `hydrated` flips true, swapping skeletons for data.
// ─────────────────────────────────────────────────────────────────────────────

export function StoreHydrator({
  data,
  children,
}: {
  data: FinanceSnapshot;
  children: React.ReactNode;
}) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    useFinanceStore.getState().hydrate(data);
  }, [data]);

  return <>{children}</>;
}
