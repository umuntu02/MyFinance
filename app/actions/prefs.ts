"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { serializePrefs } from "@/lib/serialize";
import type { UserPrefs } from "@/types";
import { requireUserId } from "./_session";

// Partial update: the UI only ever changes a subset at a time (e.g. language
// from the topbar). Option values come from our own selects, so strings are
// validated with sane caps and the union narrowing happens in serializePrefs.
const prefsInput = z
  .object({
    currency: z.string().trim().min(1).max(8),
    language: z.string().trim().min(2).max(8),
    theme: z.enum(["light", "dark", "system"]),
    displayName: z.string().trim().max(120),
    monthlyBudget: z.number().finite().nonnegative(),
  })
  .partial();

export type PrefsInput = z.infer<typeof prefsInput>;

export async function updatePrefs(input: PrefsInput): Promise<UserPrefs> {
  const userId = await requireUserId();
  const data = prefsInput.parse(input);

  const row = await prisma.userPrefs.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
  return serializePrefs(row);
}
