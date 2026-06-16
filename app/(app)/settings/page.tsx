"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useFinanceStore } from "@/store/useFinanceStore";
import { usePrefs } from "@/hooks/use-prefs";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/page-loading";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DemoDataButton } from "@/components/settings/demo-data-button";
import { BackupRestore } from "@/components/settings/backup-restore";
import type { Currency, Language } from "@/types";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "hi", label: "हिंदी" },
  { code: "sw", label: "Kiswahili" },
  { code: "ki", label: "Kirundi" },
];

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: "USD", label: "USD ($) — US Dollar" },
  { code: "EUR", label: "EUR (€) — Euro" },
  { code: "GBP", label: "GBP (£) — British Pound" },
  { code: "JPY", label: "JPY (¥) — Japanese Yen" },
  { code: "CNY", label: "CNY (¥) — Chinese Yuan" },
  { code: "INR", label: "INR (₹) — Indian Rupee" },
  { code: "KES", label: "KES (KSh) — Kenyan Shilling" },
  { code: "UGX", label: "UGX (USh) — Ugandan Shilling" },
  { code: "TZS", label: "TZS (TSh) — Tanzanian Shilling" },
  { code: "RWF", label: "RWF (FRw) — Rwandan Franc" },
  { code: "BIF", label: "BIF (FBu) — Burundian Franc" },
  { code: "SSP", label: "SSP (£) — South Sudanese Pound" },
  { code: "GHS", label: "GHS (₵) — Ghanaian Cedi" },
  { code: "XAF", label: "XAF (FCFA) — Central African CFA" },
  { code: "XOF", label: "XOF (CFA) — West African CFA" },
  { code: "XPF", label: "XPF (₣) — CFP Franc" },
];

const SELECT_CLASS =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer";

export default function SettingsPage() {
  const prefs = useFinanceStore((s) => s.prefs);
  const hydrated = useFinanceStore((s) => s.hydrated);
  const t = useTranslations("settings");
  const tc = useTranslations("common");

  const {
    changeLanguage,
    changeCurrency,
    changeTheme,
    changeDisplayName,
    changeMonthlyBudget,
  } = usePrefs();

  const [name, setName] = useState(prefs.displayName ?? "");
  const [budget, setBudget] = useState<string>(String(prefs.monthlyBudget ?? 0));

  if (!hydrated) return <PageLoading cards={2} />;

  const nameDirty = name.trim() !== (prefs.displayName ?? "");
  const budgetValue = parseFloat(budget);
  const budgetDirty =
    Number.isFinite(budgetValue) && budgetValue >= 0 && budgetValue !== prefs.monthlyBudget;

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile */}
        <SectionCard title={t("profile")}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("displayName")}
            </label>
            <div className="flex gap-2">
              <Input
                value={name}
                placeholder={t("displayNamePlaceholder")}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                size="sm"
                className="cursor-pointer"
                disabled={!nameDirty}
                onClick={() => changeDisplayName(name.trim())}
              >
                {tc("save")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("displayNameDesc")}</p>
          </div>
        </SectionCard>

        {/* Currency */}
        <SectionCard title={t("currency")}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("displayCurrency")}
            </label>
            <select
              className={SELECT_CLASS}
              value={prefs.currency}
              onChange={(e) => changeCurrency(e.target.value as Currency)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">{t("displayCurrencyDesc")}</p>
          </div>
        </SectionCard>

        {/* Theme */}
        <SectionCard title={t("theme")}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("colorTheme")}
            </label>
            <select
              className={SELECT_CLASS}
              value={prefs.theme}
              onChange={(e) => changeTheme(e.target.value as typeof prefs.theme)}
            >
              <option value="light">{tc("light")}</option>
              <option value="dark">{tc("dark")}</option>
              <option value="system">{tc("system")}</option>
            </select>
            <p className="text-xs text-muted-foreground">{t("colorThemeDesc")}</p>
          </div>
        </SectionCard>

        {/* Language */}
        <SectionCard title={t("language")}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("appLanguage")}
            </label>
            <select
              className={SELECT_CLASS}
              value={prefs.language}
              onChange={(e) => changeLanguage(e.target.value as Language)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">{t("appLanguageDesc")}</p>
          </div>
        </SectionCard>

        {/* Monthly budget */}
        <SectionCard title={t("budget")}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("monthlyBudget")}
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step="50"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
              <Button
                size="sm"
                className="cursor-pointer"
                disabled={!budgetDirty}
                onClick={() => changeMonthlyBudget(budgetValue)}
              >
                {tc("save")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("monthlyBudgetDesc")}</p>
          </div>
        </SectionCard>

        {/* Demo data */}
        <SectionCard title={t("demoData")}>
          <div className="flex flex-col gap-4 py-1">
            <p className="text-sm text-muted-foreground">{t("loadDemoDesc")}</p>
            <DemoDataButton />
          </div>
        </SectionCard>

        {/* Backup & Restore — full width */}
        <div className="lg:col-span-2">
          <SectionCard title={t("backupRestore")}>
            <BackupRestore />
          </SectionCard>
        </div>
      </div>
    </>
  );
}
