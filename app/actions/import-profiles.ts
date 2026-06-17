"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client";
import { serializeImportProfile } from "@/lib/serialize";
import type { ImportProfile } from "@/types";
import { requireUserId } from "./_session";

// ─────────────────────────────────────────────────────────────────────────────
// Import mapping profiles (generic import feature) — per-user, reusable.
//
// A profile is just a named ImportMapping. Saving with an existing name OVERWRITES
// that profile (upsert on the @@unique([userId, name])), so a profile stays
// editable. Strictly userId-scoped: a user can only ever read/write their own.
// ─────────────────────────────────────────────────────────────────────────────

// Validates the stored mapping shape so the JSON column is always well-formed.
const mappingSchema = z.object({
  amountMode: z.enum(["single", "split"]),
  dateColumn: z.string().max(200).nullable(),
  amountColumn: z.string().max(200).nullable(),
  expenseSign: z.enum(["negative", "positive"]),
  debitColumn: z.string().max(200).nullable(),
  creditColumn: z.string().max(200).nullable(),
  descriptionColumns: z.array(z.string().max(200)).max(20),
  categoryColumn: z.string().max(200).nullable(),
  labelCleanup: z.string().max(200).default(""),
  dateFormat: z.enum(["auto", "DMY", "MDY", "YMD"]),
  decimalSeparator: z.enum([",", "."]),
  thousandsSeparator: z.enum([",", ".", " ", "'", "none"]),
});

const saveInput = z.object({
  name: z.string().trim().min(1).max(60),
  config: mappingSchema,
});

export type SaveImportProfileInput = z.infer<typeof saveInput>;

export async function saveImportProfile(
  input: SaveImportProfileInput,
): Promise<ImportProfile> {
  const userId = await requireUserId();
  const data = saveInput.parse(input);

  const row = await prisma.importProfile.upsert({
    where: { userId_name: { userId, name: data.name } },
    update: { config: data.config as Prisma.InputJsonValue },
    create: { userId, name: data.name, config: data.config as Prisma.InputJsonValue },
  });
  return serializeImportProfile(row);
}

export async function deleteImportProfile(id: string): Promise<{ ok: true }> {
  const userId = await requireUserId();
  await prisma.importProfile.deleteMany({ where: { id, userId } });
  return { ok: true };
}
