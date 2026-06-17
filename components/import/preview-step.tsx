"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { summarize, DEFAULT_CATEGORY } from "@/lib/import";
import type { PreviewRow } from "@/lib/import";
import type { Currency } from "@/types";

type PreviewStepProps = {
  rows: PreviewRow[];
  incomeCategories: string[];
  expenseCategories: string[];
  currency: Currency;
  onToggleRow: (id: string) => void;
  onChangeCategory: (id: string, category: string) => void;
  onBack: () => void;
  onImport: () => void;
  importing: boolean;
  error: string | null;
};

const CAT_SELECT_CLASS =
  "w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer";

function Chip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className={cn("text-lg font-bold leading-none", tone)}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function PreviewStep({
  rows,
  incomeCategories,
  expenseCategories,
  currency,
  onToggleRow,
  onChangeCategory,
  onBack,
  onImport,
  importing,
  error,
}: PreviewStepProps) {
  const t = useTranslations("import");
  const summary = useMemo(() => summarize(rows), [rows]);

  function categoryOptions(row: PreviewRow): string[] {
    const base = row.type === "income" ? incomeCategories : expenseCategories;
    const set = new Set<string>([...base, DEFAULT_CATEGORY]);
    if (row.category) set.add(row.category);
    return [...set];
  }

  return (
    <div className="space-y-4">
      {/* Recap */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Chip label={t("recapExpenses")} value={summary.expenses} tone="text-expense" />
        <Chip label={t("recapIncomes")} value={summary.incomes} tone="text-income" />
        <Chip label={t("recapIgnored")} value={summary.ignored} tone="text-muted-foreground" />
        <Chip label={t("recapDuplicates")} value={summary.duplicates} tone="text-brand-gold" />
      </div>

      {summary.duplicates > 0 && (
        <p className="text-xs text-muted-foreground">{t("duplicatesNote")}</p>
      )}

      {/* Editable table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>{t("hDate")}</TableHead>
              <TableHead>{t("hDescription")}</TableHead>
              <TableHead>{t("hType")}</TableHead>
              <TableHead className="text-right">{t("hAmount")}</TableHead>
              <TableHead>{t("hCategory")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const disabled = !row.valid;
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    disabled && "opacity-50",
                    !disabled && !row.included && "opacity-60",
                  )}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
                      checked={row.included}
                      disabled={disabled}
                      onChange={() => onToggleRow(row.id)}
                      aria-label={t("includeRow")}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.date ?? (
                      <span className="text-destructive text-xs">{t("issueNoDate")}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="block max-w-37.5 truncate sm:max-w-62.5"
                        title={row.description}
                      >
                        {row.description}
                      </span>
                      {row.duplicate && (
                        <Badge className="shrink-0 border-0 bg-brand-gold/15 text-brand-gold text-[10px]">
                          {t("badgeDuplicate")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.type ? (
                      <Badge
                        className={cn(
                          "border-0 text-xs",
                          row.type === "income"
                            ? "bg-income/10 text-income"
                            : "bg-expense/10 text-expense",
                        )}
                      >
                        {row.type === "income" ? t("typeIncome") : t("typeExpense")}
                      </Badge>
                    ) : (
                      <span className="text-destructive text-xs">{t("issueNoAmount")}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums font-medium">
                    {row.amount !== null ? (
                      <span className={row.type === "income" ? "text-income" : "text-expense"}>
                        {row.type === "income" ? "+" : "−"}
                        {formatCurrency(row.amount, currency)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {row.type ? (
                      <select
                        className={CAT_SELECT_CLASS}
                        value={row.category}
                        onChange={(e) => onChangeCategory(row.id, e.target.value)}
                      >
                        {categoryOptions(row).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={onBack} disabled={importing}>
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
        <Button
          className="gap-1.5 cursor-pointer"
          disabled={importing || summary.importable === 0}
          onClick={onImport}
        >
          {importing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t("importCount", { count: summary.importable })}
        </Button>
      </div>
    </div>
  );
}
