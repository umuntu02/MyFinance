"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Loader2, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/shared/section-card";
import { cn } from "@/lib/utils";
import { buildPreview } from "@/lib/import";
import type { SheetTable } from "@/lib/import";
import type { DateFormatId, ImportMapping, ImportProfile } from "@/types";

const SELECT_CLASS =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const NONE = "__none__";

type MappingStepProps = {
  table: SheetTable;
  mapping: ImportMapping;
  setMapping: (m: ImportMapping) => void;
  headerRowIndex: number;
  rowCount: number;
  onHeaderRowChange: (index: number) => void;
  profiles: ImportProfile[];
  onLoadProfile: (profile: ImportProfile) => void;
  onSaveProfile: (name: string) => Promise<void>;
  onDeleteProfile: (id: string) => Promise<void>;
  onBack: () => void;
  onContinue: () => void;
};

function ColumnSelect({
  label,
  value,
  onChange,
  headers,
  allowNone,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  headers: string[];
  allowNone?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        className={SELECT_CLASS}
        value={value ?? NONE}
        onChange={(e) => onChange(e.target.value === NONE ? null : e.target.value)}
      >
        {allowNone && <option value={NONE}>—</option>}
        {!allowNone && value === null && <option value={NONE}>—</option>}
        {headers.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MappingStep({
  table,
  mapping,
  setMapping,
  headerRowIndex,
  rowCount,
  onHeaderRowChange,
  profiles,
  onLoadProfile,
  onSaveProfile,
  onDeleteProfile,
  onBack,
  onContinue,
}: MappingStepProps) {
  const t = useTranslations("import");
  const headers = table.headers;

  const [profileName, setProfileName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const update = (patch: Partial<ImportMapping>) => setMapping({ ...mapping, ...patch });

  function toggleDescription(header: string) {
    const has = mapping.descriptionColumns.includes(header);
    update({
      descriptionColumns: has
        ? mapping.descriptionColumns.filter((h) => h !== header)
        : [...mapping.descriptionColumns, header],
    });
  }

  // Live preview of the first rows so the effect of each choice is visible.
  const preview = useMemo(
    () => buildPreview({ ...table, dataRows: table.dataRows.slice(0, 5) }, mapping),
    [table, mapping],
  );

  const canContinue =
    Boolean(mapping.dateColumn) &&
    (mapping.amountMode === "single"
      ? Boolean(mapping.amountColumn)
      : Boolean(mapping.debitColumn) || Boolean(mapping.creditColumn));

  async function handleSaveProfile() {
    const name = profileName.trim();
    if (!name) return;
    setSavingProfile(true);
    try {
      await onSaveProfile(name);
      setProfileName("");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDeleteProfile(id: string) {
    setDeletingId(id);
    try {
      await onDeleteProfile(id);
    } finally {
      setDeletingId(null);
    }
  }

  const dateFormats: { id: DateFormatId; label: string }[] = [
    { id: "auto", label: t("fmtAuto") },
    { id: "DMY", label: t("fmtDMY") },
    { id: "MDY", label: t("fmtMDY") },
    { id: "YMD", label: t("fmtYMD") },
  ];

  return (
    <div className="space-y-4">
      {/* Saved profiles */}
      <SectionCard title={t("profiles")}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("profilesHint")}</p>

          {profiles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 pl-2.5 pr-1 py-1 text-xs"
                >
                  <button
                    type="button"
                    className="font-medium text-foreground hover:text-primary cursor-pointer"
                    onClick={() => onLoadProfile(p)}
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    aria-label={t("deleteProfile")}
                    className="ml-0.5 rounded p-0.5 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={() => handleDeleteProfile(p.id)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">{t("noProfiles")}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Input
              value={profileName}
              placeholder={t("profileNamePlaceholder")}
              className="max-w-xs"
              onChange={(e) => setProfileName(e.target.value)}
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 cursor-pointer"
              disabled={!profileName.trim() || savingProfile}
              onClick={handleSaveProfile}
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t("saveProfile")}
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Mapping form */}
      <SectionCard title={t("mappingTitle")}>
        <div className="space-y-5">
          {/* Header row override */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("headerRow")}
              </label>
              <Input
                type="number"
                min={1}
                className="w-28"
                value={headerRowIndex + 1}
                onChange={(e) => {
                  const next = parseInt(e.target.value, 10);
                  if (Number.isFinite(next)) onHeaderRowChange(next - 1);
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground pb-2.5">{t("headerRowHint")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColumnSelect
              label={t("colDate")}
              value={mapping.dateColumn}
              onChange={(v) => update({ dateColumn: v })}
              headers={headers}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("dateFormat")}
              </label>
              <select
                className={SELECT_CLASS}
                value={mapping.dateFormat}
                onChange={(e) => update({ dateFormat: e.target.value as DateFormatId })}
              >
                {dateFormats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount mode */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t("amountMode")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update({ amountMode: "single" })}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors",
                  mapping.amountMode === "single"
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border text-muted-foreground hover:bg-muted/40",
                )}
              >
                {t("amountModeSingle")}
              </button>
              <button
                type="button"
                onClick={() => update({ amountMode: "split" })}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors",
                  mapping.amountMode === "split"
                    ? "border-primary bg-primary/10 text-foreground font-medium"
                    : "border-border text-muted-foreground hover:bg-muted/40",
                )}
              >
                {t("amountModeSplit")}
              </button>
            </div>
          </div>

          {mapping.amountMode === "single" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColumnSelect
                label={t("colAmount")}
                value={mapping.amountColumn}
                onChange={(v) => update({ amountColumn: v })}
                headers={headers}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("expenseSign")}
                </label>
                <select
                  className={SELECT_CLASS}
                  value={mapping.expenseSign}
                  onChange={(e) =>
                    update({ expenseSign: e.target.value as ImportMapping["expenseSign"] })
                  }
                >
                  <option value="negative">{t("expenseNegative")}</option>
                  <option value="positive">{t("expensePositive")}</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColumnSelect
                label={t("colDebit")}
                value={mapping.debitColumn}
                onChange={(v) => update({ debitColumn: v })}
                headers={headers}
                allowNone
              />
              <ColumnSelect
                label={t("colCredit")}
                value={mapping.creditColumn}
                onChange={(v) => update({ creditColumn: v })}
                headers={headers}
                allowNone
              />
            </div>
          )}

          {/* Number format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("decimalSeparator")}
              </label>
              <select
                className={SELECT_CLASS}
                value={mapping.decimalSeparator}
                onChange={(e) =>
                  update({
                    decimalSeparator: e.target.value as ImportMapping["decimalSeparator"],
                  })
                }
              >
                <option value=".">{t("sepDot")}</option>
                <option value=",">{t("sepComma")}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t("thousandsSeparator")}
              </label>
              <select
                className={SELECT_CLASS}
                value={mapping.thousandsSeparator}
                onChange={(e) =>
                  update({
                    thousandsSeparator: e.target.value as ImportMapping["thousandsSeparator"],
                  })
                }
              >
                <option value="none">{t("sepNone")}</option>
                <option value=",">{t("sepComma")}</option>
                <option value=".">{t("sepDot")}</option>
                <option value=" ">{t("sepSpace")}</option>
                <option value="'">{t("sepApostrophe")}</option>
              </select>
            </div>
          </div>

          {/* Description columns (concatenated) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              {t("colDescription")}
            </label>
            <p className="text-xs text-muted-foreground">{t("descriptionHint")}</p>
            <div className="flex flex-wrap gap-2">
              {headers.map((h) => {
                const active = mapping.descriptionColumns.includes(h);
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleDescription(h)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs cursor-pointer transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-foreground font-medium"
                        : "border-border text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label cleanup (optional) */}
          <div className="space-y-1.5 sm:max-w-md">
            <label className="text-xs font-medium text-muted-foreground">
              {`${t("labelCleanup")} (${t("optional")})`}
            </label>
            <Input
              value={mapping.labelCleanup ?? ""}
              placeholder={t("labelCleanupPlaceholder")}
              onChange={(e) => update({ labelCleanup: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">{t("labelCleanupHint")}</p>
          </div>

          {/* Category (optional) */}
          <div className="sm:max-w-xs">
            <ColumnSelect
              label={`${t("colCategory")} (${t("optional")})`}
              value={mapping.categoryColumn}
              onChange={(v) => update({ categoryColumn: v })}
              headers={headers}
              allowNone
            />
          </div>
        </div>
      </SectionCard>

      {/* Live preview */}
      <SectionCard title={t("livePreview")}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">{t("hDate")}</th>
                <th className="py-2 pr-3 font-medium">{t("hType")}</th>
                <th className="py-2 pr-3 font-medium text-right">{t("hAmount")}</th>
                <th className="py-2 pr-3 font-medium">{t("hDescription")}</th>
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {r.date ?? <span className="text-destructive">{t("unparsed")}</span>}
                  </td>
                  <td className="py-2 pr-3">
                    {r.type ? (
                      <Badge
                        className={cn(
                          "border-0 text-xs",
                          r.type === "income"
                            ? "bg-income/10 text-income"
                            : "bg-expense/10 text-expense",
                        )}
                      >
                        {r.type === "income" ? t("typeIncome") : t("typeExpense")}
                      </Badge>
                    ) : (
                      <span className="text-destructive text-xs">{t("unparsed")}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap tabular-nums">
                    {r.amount !== null ? r.amount.toFixed(2) : "—"}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="max-w-37.5 truncate sm:max-w-xs" title={r.description}>
                      {r.description}
                    </div>
                  </td>
                </tr>
              ))}
              {preview.rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
                    {t("noRows")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="gap-1.5 cursor-pointer" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{t("rowsDetected", { count: rowCount })}</span>
          <Button
            className="gap-1.5 cursor-pointer"
            disabled={!canContinue}
            onClick={onContinue}
          >
            {t("continue")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
