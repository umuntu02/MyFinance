"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useFinanceStore } from "@/store/useFinanceStore";
import { updatePrefs as updatePrefsAction } from "@/app/actions/prefs";
import { downloadCsv, todayStamp } from "@/lib/csv";
import type { Language } from "@/types";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Monitor,
  Moon,
  Printer,
  Sun,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/dashboard": "dashboard",
  "/income": "income",
  "/expenses": "expenses",
  "/savings-goals": "savingsGoals",
  "/monthly-report": "monthlyReport",
  "/categories": "categories",
  "/settings": "settings",
};

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "sw", label: "Kiswahili", flag: "🇹🇿" },
  { code: "ki", label: "Kirundi", flag: "🇧🇮" },
];

const THEME_ICONS: Record<string, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const prefs = useFinanceStore((s) => s.prefs);
  const language = prefs.language;
  const incomes = useFinanceStore((s) => s.incomes);
  const expenses = useFinanceStore((s) => s.expenses);
  const updatePrefs = useFinanceStore((s) => s.updatePrefs);
  const [, startTransition] = useTransition();

  const t = useTranslations("topbar");
  const tc = useTranslations("common");
  const tr = useTranslations("report");

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Update the cache instantly (UI re-renders in the new locale), then persist
  // the choice to the database in the background.
  function changeLanguage(next: Language) {
    updatePrefs({ language: next });
    startTransition(async () => {
      try {
        await updatePrefsAction({ language: next });
      } catch {
        // non-blocking: the cache already reflects the choice
      }
    });
  }

  // Export the current user's full transaction ledger (incomes + expenses) as
  // CSV. The store is hydrated from Postgres, so this is always the logged-in
  // user's DB data — never another account's.
  function exportTransactionsCsv() {
    const header = ["Type", "Date", "Category", "Label", "Amount", "Status / Notes"];
    const rows = [
      ...incomes.map((i) => [
        "Income",
        i.date,
        i.category,
        i.source,
        i.amount,
        i.notes ?? "",
      ]),
      ...expenses.map((e) => [
        "Expense",
        e.date,
        e.category,
        e.description,
        e.amount,
        e.status,
      ]),
    ].sort((a, b) => String(b[1]).localeCompare(String(a[1])));
    downloadCsv(`myfinance-transactions-${todayStamp()}.csv`, [header, ...rows]);
  }

  // Export the same current-user ledger as a clean, printable PDF report. The
  // jsPDF builder is loaded on demand (dynamic import) so it never weighs on the
  // global app bundle. Labels are passed translated so the PDF respects the UI
  // language; data is the hydrated store (this user's DB rows only).
  async function exportTransactionsPdf() {
    try {
      const { buildFinancialReport } = await import("@/lib/financial-report-pdf");
      const doc = await buildFinancialReport(
        {
          incomes,
          expenses,
          currency: prefs.currency,
          displayName: prefs.displayName,
          logoUrl: prefs.logoUrl,
        },
        {
          title: tr("title"),
          account: tr("account"),
          generatedOn: tr("generatedOn"),
          from: tr("from"),
          to: tr("to"),
          date: tr("date"),
          type: tr("type"),
          description: tr("description"),
          income: tr("income"),
          expense: tr("expense"),
          totalIncome: tr("totalIncome"),
          totalExpenses: tr("totalExpenses"),
          netSavings: tr("netSavings"),
          page: tr("page"),
          empty: tr("empty"),
        }
      );
      doc.save(`myfinance-report-${todayStamp()}.pdf`);
    } catch {
      // Non-blocking: a failed export simply downloads nothing.
    }
  }

  const titleKey = PAGE_TITLE_KEYS[pathname];
  const title = titleKey
    ? t(titleKey as Parameters<typeof t>[0])
    : t("myFinance");
  const ThemeIcon = mounted
    ? (THEME_ICONS[theme ?? "system"] ?? Monitor)
    : Monitor;
  const currentLang =
    LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 backdrop-blur-sm px-4">
      {/* Sidebar toggle (mobile + collapsed) */}
      <SidebarTrigger className="text-muted-foreground hover:text-foreground cursor-pointer" />
      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Page title */}
      <h1 className="flex-1 text-base font-semibold text-foreground truncate">
        {title}
      </h1>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer px-2"
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.label}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuRadioGroup
              value={language}
              onValueChange={(v) => changeLanguage(v as Language)}
            >
              {LANGUAGES.map((lang) => (
                <DropdownMenuRadioItem
                  key={lang.code}
                  value={lang.code}
                  className="cursor-pointer"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle theme"
            >
              <ThemeIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light" className="cursor-pointer">
                <Sun className="h-4 w-4 mr-2" />
                {tc("light")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                <Moon className="h-4 w-4 mr-2" />
                {tc("dark")}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="cursor-pointer">
                <Monitor className="h-4 w-4 mr-2" />
                {tc("system")}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Print */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label={tc("print")}
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
        </Button>

        {/* Export menu — choose CSV or PDF (current user's transactions) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              aria-label={tc("export")}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-sm">{tc("export")}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={exportTransactionsCsv} className="cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportTransactionsPdf} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
