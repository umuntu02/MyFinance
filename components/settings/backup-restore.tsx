"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Download,
  FileJson,
  FileText,
  Loader2,
  RotateCcw,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  exportUserData,
  restoreUserData,
  resetUserData,
} from "@/app/actions/backup";
import { buildPdfReport } from "@/lib/pdf-report";
import { triggerDownload, todayStamp } from "@/lib/csv";

type Feedback = { kind: "success" | "error"; text: string } | null;

export function BackupRestore() {
  const t = useTranslations("settings");
  const hydrate = useFinanceStore((s) => s.hydrate);

  const [exporting, startExport] = useTransition();
  const [isPending, startAction] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Export JSON (full backup) ──
  function handleExportJson() {
    setFeedback(null);
    startExport(async () => {
      try {
        const backup = await exportUserData();
        const blob = new Blob([JSON.stringify(backup, null, 2)], {
          type: "application/json",
        });
        triggerDownload(blob, `myfinance-backup-${todayStamp()}.json`);
      } catch {
        setFeedback({ kind: "error", text: t("exportError") });
      }
    });
  }

  // ── Export PDF (human-readable report) ──
  function handleExportPdf() {
    setFeedback(null);
    startExport(async () => {
      try {
        const backup = await exportUserData();
        const doc = buildPdfReport(backup.data);
        doc.save(`myfinance-report-${todayStamp()}.pdf`);
      } catch {
        setFeedback({ kind: "error", text: t("exportError") });
      }
    });
  }

  // ── Restore from an uploaded JSON backup ──
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setFeedback(null);
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        setFeedback({ kind: "error", text: t("invalidFile") });
        return;
      }
      if (!window.confirm(t("importConfirm"))) return;

      startAction(async () => {
        try {
          const fresh = await restoreUserData(parsed);
          hydrate(fresh);
          setFeedback({ kind: "success", text: t("importSuccess") });
        } catch {
          setFeedback({ kind: "error", text: t("importError") });
        }
      });
    };
    reader.onerror = () => setFeedback({ kind: "error", text: t("invalidFile") });
    reader.readAsText(file);
  }

  // ── Reset to default seed state ──
  function handleReset() {
    setFeedback(null);
    if (!window.confirm(t("resetConfirm"))) return;
    startAction(async () => {
      try {
        const fresh = await resetUserData();
        hydrate(fresh);
        setFeedback({ kind: "success", text: t("resetSuccess") });
      } catch {
        setFeedback({ kind: "error", text: t("resetError") });
      }
    });
  }

  const busy = exporting || isPending;

  return (
    <div className="flex flex-col gap-5">
      {/* Export */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{t("exportData")}</p>
        <p className="text-xs text-muted-foreground">{t("exportDataDesc")}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer"
            onClick={handleExportJson}
            disabled={busy}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4" />
            )}
            {t("exportJson")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer"
            onClick={handleExportPdf}
            disabled={busy}
          >
            <FileText className="h-4 w-4" />
            {t("exportPdf")}
          </Button>
        </div>
      </div>

      {/* Import / Restore */}
      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-sm font-medium text-foreground">{t("importData")}</p>
        <p className="text-xs text-muted-foreground">{t("importDataDesc")}</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFile}
        />
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {t("chooseFile")}
          </Button>
        </div>
      </div>

      {/* Reset */}
      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-sm font-medium text-foreground">{t("resetTitle")}</p>
        <p className="text-xs text-muted-foreground">{t("resetDesc")}</p>
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer text-expense hover:text-expense"
            onClick={handleReset}
            disabled={busy}
          >
            <RotateCcw className="h-4 w-4" />
            {t("resetButton")}
          </Button>
        </div>
      </div>

      {feedback && (
        <p
          className={`flex items-center gap-1.5 text-sm ${
            feedback.kind === "success" ? "text-income" : "text-destructive"
          }`}
        >
          {feedback.kind === "success" && <Download className="h-4 w-4" />}
          {feedback.text}
        </p>
      )}
    </div>
  );
}
