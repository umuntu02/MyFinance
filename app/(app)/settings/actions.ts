"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { loadDemoDataForUser } from "@/lib/user-seed";
import { getUserData } from "@/lib/data";
import type { FinanceSnapshot } from "@/store/useFinanceStore";

// Inject the lib/seed.ts demo dataset into the CURRENT user's account.
// Auth is re-checked here (never trust the client) before touching the DB.
// Returns the fresh snapshot so the client can re-hydrate the Zustand cache
// without a full page reload.
export async function loadDemoDataAction(): Promise<
  { ok: true; data: FinanceSnapshot } | { ok: false }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false };

  await loadDemoDataForUser(session.user.id);
  const data = await getUserData();
  return { ok: true, data };
}
