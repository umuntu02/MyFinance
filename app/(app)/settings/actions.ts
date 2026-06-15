"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { loadDemoDataForUser } from "@/lib/user-seed";

// Inject the lib/seed.ts demo dataset into the CURRENT user's account.
// Auth is re-checked here (never trust the client) before touching the DB.
export async function loadDemoDataAction(): Promise<{ ok: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false };

  await loadDemoDataForUser(session.user.id);
  return { ok: true };
}
