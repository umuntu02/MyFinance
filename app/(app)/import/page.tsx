"use client";

import { useFinanceStore } from "@/store/useFinanceStore";
import { PageLoading } from "@/components/shared/page-loading";
import { ImportWizard } from "@/components/import/import-wizard";

// Generic bank-statement import — a multi-step wizard (upload → map → review →
// done). All parsing happens in the browser; nothing is written until the user
// confirms. See components/import/* and lib/import/* for the generic engine.
export default function ImportPage() {
  const hydrated = useFinanceStore((s) => s.hydrated);
  if (!hydrated) return <PageLoading />;
  return <ImportWizard />;
}
