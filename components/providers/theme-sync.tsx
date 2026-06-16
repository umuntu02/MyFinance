"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import { useFinanceStore } from "@/store/useFinanceStore";

// ─────────────────────────────────────────────────────────────────────────────
// ThemeSync (step 5)
//
// The DB is the source of truth for the theme (UserPrefs.theme). next-themes
// still owns the <html> class + its own localStorage (needed for no-flash SSR),
// but on hydration — and whenever prefs.theme changes (e.g. after a restore) —
// we push the DB value into next-themes so the two stay aligned. We depend on
// `prefs.theme` (not next-themes' `theme`) on purpose: that way a manual toggle
// via next-themes alone never loops, and a DB change always wins.
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeSync() {
  const { theme, setTheme } = useTheme();
  const prefTheme = useFinanceStore((s) => s.prefs.theme);
  const hydrated = useFinanceStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && prefTheme && prefTheme !== theme) {
      setTheme(prefTheme);
    }
    // Intentionally exclude `theme`/`setTheme`: only react to DB-side changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, prefTheme]);

  return null;
}
