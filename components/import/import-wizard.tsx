"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { CheckCircle2, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  readSpreadsheet,
  detectHeaderRow,
  extractTable,
  suggestMapping,
  reconcileMapping,
  buildPreview,
} from "@/lib/import";
import type { Cell, PreviewRow } from "@/lib/import";
import {
  saveImportProfile as saveImportProfileAction,
  deleteImportProfile as deleteImportProfileAction,
} from "@/app/actions/import-profiles";
import { importTransactions } from "@/app/actions/import";
import type { ImportMapping, ImportProfile } from "@/types";
import { FileDrop } from "./file-drop";
import { MappingStep } from "./mapping-step";
import { PreviewStep } from "./preview-step";

type Step = "upload" | "mapping" | "preview" | "done";
type FlowStep = Exclude<Step, "done">;

const STEP_ORDER: FlowStep[] = ["upload", "mapping", "preview"];

function Stepper({ current }: { current: Step }) {
  const t = useTranslations("import");
  const labels: Record<FlowStep, string> = {
    upload: t("stepUpload"),
    mapping: t("stepMapping"),
    preview: t("stepReview"),
  };
  const activeIndex =
    current === "done" ? STEP_ORDER.length : STEP_ORDER.indexOf(current);

  return (
    <ol className="flex items-center gap-2 mb-6 text-sm">
      {STEP_ORDER.map((s, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                active && "bg-primary text-primary-foreground",
                done && "bg-income/15 text-income",
                !active && !done && "bg-muted text-muted-foreground",
              )}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={cn(active ? "text-foreground font-medium" : "text-muted-foreground")}>
              {labels[s]}
            </span>
            {i < STEP_ORDER.length - 1 && <span className="mx-1 text-border">—</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function ImportWizard() {
  const t = useTranslations("import");

  const incomes = useFinanceStore((s) => s.incomes);
  const expenses = useFinanceStore((s) => s.expenses);
  const incomeCategories = useFinanceStore((s) => s.incomeCategories);
  const expenseCategories = useFinanceStore((s) => s.expenseCategories);
  const importProfiles = useFinanceStore((s) => s.importProfiles);
  const currency = useFinanceStore((s) => s.prefs.currency);
  const hydrate = useFinanceStore((s) => s.hydrate);
  const upsertProfileCache = useFinanceStore((s) => s.upsertImportProfile);
  const deleteProfileCache = useFinanceStore((s) => s.deleteImportProfile);

  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [allRows, setAllRows] = useState<Cell[][]>([]);
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [mapping, setMapping] = useState<ImportMapping | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);

  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  const table = useMemo(
    () => (allRows.length ? extractTable(allRows, headerRowIndex) : null),
    [allRows, headerRowIndex],
  );

  const existing = useMemo(
    () => [
      ...incomes.map((i) => ({ date: i.date, amount: i.amount, label: i.source })),
      ...expenses.map((e) => ({ date: e.date, amount: e.amount, label: e.description })),
    ],
    [incomes, expenses],
  );

  // ── Step 1: read the file in the browser ──
  async function handleFile(file: File) {
    setParsing(true);
    setParseError(null);
    try {
      const rows = await readSpreadsheet(file);
      const meaningful = rows.filter((r) => r.some((c) => c !== null && String(c).trim() !== ""));
      if (meaningful.length === 0) {
        setParseError(t("errorEmpty"));
        return;
      }
      const detected = detectHeaderRow(rows);
      const tbl = extractTable(rows, detected);
      if (tbl.dataRows.length === 0) {
        setParseError(t("errorNoRows"));
        return;
      }
      setFileName(file.name);
      setAllRows(rows);
      setHeaderRowIndex(detected);
      setMapping(suggestMapping(tbl));
      setStep("mapping");
    } catch {
      setParseError(t("errorParse"));
    } finally {
      setParsing(false);
    }
  }

  // Re-detecting columns when the user moves the header row keeps the suggestion
  // consistent with the new header (its labels may differ entirely).
  function handleHeaderRowChange(nextIndex: number) {
    if (!allRows.length) return;
    const clamped = Math.max(0, Math.min(nextIndex, allRows.length - 1));
    setHeaderRowIndex(clamped);
    setMapping(suggestMapping(extractTable(allRows, clamped)));
  }

  function handleLoadProfile(profile: ImportProfile) {
    if (!table) return;
    setMapping(reconcileMapping(profile.config, table.headers));
  }

  async function handleSaveProfile(name: string) {
    if (!mapping) return;
    const saved = await saveImportProfileAction({ name, config: mapping });
    upsertProfileCache(saved);
  }

  async function handleDeleteProfile(id: string) {
    await deleteImportProfileAction(id);
    deleteProfileCache(id);
  }

  function goToPreview() {
    if (!table || !mapping) return;
    const { rows } = buildPreview(table, mapping, existing);
    setPreviewRows(rows);
    setImportError(null);
    setStep("preview");
  }

  function toggleRow(id: string) {
    setPreviewRows((rows) =>
      rows.map((r) => (r.id === id && r.valid ? { ...r, included: !r.included } : r)),
    );
  }

  function changeCategory(id: string, category: string) {
    setPreviewRows((rows) => rows.map((r) => (r.id === id ? { ...r, category } : r)));
  }

  async function handleImport() {
    const toImport = previewRows
      .filter((r) => r.included && r.valid && r.date && r.amount !== null && r.type)
      .map((r) => ({
        date: r.date as string,
        amount: r.amount as number,
        type: r.type as "income" | "expense",
        description: r.description,
        category: r.category || "Other",
      }));
    if (toImport.length === 0) return;

    setImporting(true);
    setImportError(null);
    try {
      const fresh = await importTransactions(toImport);
      hydrate(fresh);
      setImportedCount(toImport.length);
      setStep("done");
    } catch {
      setImportError(t("errorImport"));
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setStep("upload");
    setFileName("");
    setAllRows([]);
    setHeaderRowIndex(0);
    setMapping(null);
    setPreviewRows([]);
    setParseError(null);
    setImportError(null);
    setImportedCount(0);
  }

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Stepper current={step} />

      {step !== "upload" && step !== "done" && fileName && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          {fileName}
        </div>
      )}

      {step === "upload" && (
        <FileDrop onFile={handleFile} busy={parsing} error={parseError} />
      )}

      {step === "mapping" && table && mapping && (
        <MappingStep
          table={table}
          mapping={mapping}
          setMapping={setMapping}
          headerRowIndex={headerRowIndex}
          rowCount={table.dataRows.length}
          onHeaderRowChange={handleHeaderRowChange}
          profiles={importProfiles}
          onLoadProfile={handleLoadProfile}
          onSaveProfile={handleSaveProfile}
          onDeleteProfile={handleDeleteProfile}
          onBack={reset}
          onContinue={goToPreview}
        />
      )}

      {step === "preview" && (
        <PreviewStep
          rows={previewRows}
          incomeCategories={incomeCategories.map((c) => c.name)}
          expenseCategories={expenseCategories.map((c) => c.name)}
          currency={currency}
          onToggleRow={toggleRow}
          onChangeCategory={changeCategory}
          onBack={() => setStep("mapping")}
          onImport={handleImport}
          importing={importing}
          error={importError}
        />
      )}

      {step === "done" && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-income/10 text-income">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">{t("doneTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {t("doneCount", { count: importedCount })}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button variant="outline" className="cursor-pointer" onClick={reset}>
              {t("importAnother")}
            </Button>
            <Button asChild className="cursor-pointer">
              <Link href="/dashboard">{t("goToDashboard")}</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
