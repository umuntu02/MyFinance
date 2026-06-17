"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

type FileDropProps = {
  onFile: (file: File) => void;
  busy?: boolean;
  error?: string | null;
};

// Step 1 — pick a statement file (XLSX / XLS / CSV). Drag-and-drop or click.
export function FileDrop({ onFile, busy, error }: FileDropProps) {
  const t = useTranslations("import");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-14 text-center transition-colors cursor-pointer hover:border-primary/60 hover:bg-muted/40",
          dragging && "border-primary bg-primary/5",
          busy && "pointer-events-none opacity-70",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{t("dropTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("dropHint")}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          {t("dropFormats")}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">{t("privacyNote")}</p>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
