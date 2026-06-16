"use client";

import { useTransition } from "react";
import { useTheme } from "next-themes";

import { useFinanceStore } from "@/store/useFinanceStore";
import { updatePrefs as updatePrefsAction } from "@/app/actions/prefs";
import type { Currency, Language, UserPrefs } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// usePrefs — single entry point for editing user preferences (step 5).
//
// Every change is optimistic: the Zustand cache is updated immediately (the UI
// re-renders in the new currency/language/theme/budget at once) and the change
// is persisted to Postgres via the `updatePrefs` Server Action in the
// background. Prefs are the source of truth in the DB — no localStorage. The one
// exception is `theme`, which is also pushed to next-themes so the <html> class
// flips instantly; ThemeSync keeps next-themes aligned with the DB value on load.
// ─────────────────────────────────────────────────────────────────────────────

export function usePrefs() {
  const updateCache = useFinanceStore((s) => s.updatePrefs);
  const { setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  function persist(patch: Partial<UserPrefs>) {
    updateCache(patch);
    startTransition(async () => {
      try {
        await updatePrefsAction(patch);
      } catch {
        // Non-blocking: the cache already reflects the choice. A full reload
        // re-reads the DB, so a transient failure self-heals on next load.
      }
    });
  }

  return {
    isPending,
    changeLanguage: (language: Language) => persist({ language }),
    changeCurrency: (currency: Currency) => persist({ currency }),
    changeDisplayName: (displayName: string) => persist({ displayName }),
    changeMonthlyBudget: (monthlyBudget: number) => persist({ monthlyBudget }),
    changeTheme: (theme: UserPrefs["theme"]) => {
      setTheme(theme); // flip the <html> class right away
      persist({ theme });
    },
  };
}
