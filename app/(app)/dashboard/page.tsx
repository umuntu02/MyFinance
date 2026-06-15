"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Plus,
  CalendarRange,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useFinanceStore } from "@/store/useFinanceStore";
import { createIncome as createIncomeAction } from "@/app/actions/incomes";
import { createExpense as createExpenseAction } from "@/app/actions/expenses";
import {
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  incomeVsExpensesSeries,
  expenseByCategory,
} from "@/lib/selectors";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/page-loading";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { IncomeVsExpensesChart } from "@/components/shared/charts/income-vs-expenses-chart";
import { SpendingDonut, type DonutSlice } from "@/components/shared/charts/spending-donut";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddEditDialog } from "@/components/shared/add-edit-dialog";
import { Input } from "@/components/ui/input";
import type { IncomeCategoryName, ExpenseCategoryName } from "@/types";

const EXPENSE_COLORS: Record<string, string> = {
  Housing:         "#2d6a4f",
  "Food & Dining": "#e9c46a",
  Transport:       "#f4a261",
  Utilities:       "#457b9d",
  Entertainment:   "#e76f51",
  Healthcare:      "#80b918",
  Shopping:        "#a8dadc",
  Other:           "#adb5bd",
};

function defaultIncomeForm() {
  return { date: "", source: "", category: "", amount: "", notes: "" };
}
function defaultExpenseForm() {
  return {
    date: "", description: "", category: "",
    amount: "", status: "Paid" as "Paid" | "Pending",
  };
}

export default function DashboardPage() {
  const incomes = useFinanceStore((s) => s.incomes);
  const expenses = useFinanceStore((s) => s.expenses);
  const savingsGoals = useFinanceStore((s) => s.savingsGoals);
  const prefs = useFinanceStore((s) => s.prefs);
  const incomeCategories = useFinanceStore((s) => s.incomeCategories);
  const expenseCategories = useFinanceStore((s) => s.expenseCategories);
  const hydrated = useFinanceStore((s) => s.hydrated);
  const addIncome = useFinanceStore((s) => s.addIncome);
  const addExpense = useFinanceStore((s) => s.addExpense);
  const t  = useTranslations("dashboard");
  const tc = useTranslations("common");

  const inc  = useMemo(() => totalIncome(incomes), [incomes]);
  const exp  = useMemo(() => totalExpenses(expenses), [expenses]);
  const net  = useMemo(() => netSavings(incomes, expenses), [incomes, expenses]);
  const rate = useMemo(() => savingsRate(incomes, expenses), [incomes, expenses]);

  const chartData = useMemo(() => incomeVsExpensesSeries(incomes, expenses), [incomes, expenses]);
  const expCats   = useMemo(() => expenseByCategory(expenses), [expenses]);
  const donutData: DonutSlice[] = useMemo(
    () => expCats.map((c) => ({ name: c.name, value: c.total, color: EXPENSE_COLORS[c.name] ?? "#adb5bd" })),
    [expCats],
  );

  const recentTransactions = useMemo(() => {
    const merged = [
      ...[...incomes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((i) => ({
        id: i.id, date: i.date, label: i.source, category: i.category, amount: i.amount, type: "income" as const,
      })),
      ...[...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((e) => ({
        id: e.id, date: e.date, label: e.description, category: e.category, amount: e.amount, type: "expense" as const,
      })),
    ];
    return merged.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  }, [incomes, expenses]);

  const [incomeOpen, setIncomeOpen] = useState(false);
  const [incomeForm, setIncomeForm] = useState(defaultIncomeForm);
  const [savingIncome, setSavingIncome] = useState(false);
  const [incomeError, setIncomeError] = useState(false);

  function openIncome() {
    setIncomeError(false);
    setIncomeForm({ ...defaultIncomeForm(), category: incomeCategories[0]?.name ?? "" });
    setIncomeOpen(true);
  }

  async function handleSaveIncome() {
    if (!incomeForm.date || !incomeForm.source || !incomeForm.amount) return;
    setSavingIncome(true);
    setIncomeError(false);
    try {
      const created = await createIncomeAction({
        date: incomeForm.date,
        source: incomeForm.source,
        category: incomeForm.category || incomeCategories[0]?.name || "Other",
        amount: parseFloat(incomeForm.amount),
        notes: incomeForm.notes || null,
      });
      addIncome(created);
      setIncomeForm(defaultIncomeForm());
      setIncomeOpen(false);
    } catch {
      setIncomeError(true);
    } finally {
      setSavingIncome(false);
    }
  }

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState(defaultExpenseForm);
  const [savingExpense, setSavingExpense] = useState(false);
  const [expenseError, setExpenseError] = useState(false);

  function openExpense() {
    setExpenseError(false);
    setExpenseForm({ ...defaultExpenseForm(), category: expenseCategories[0]?.name ?? "" });
    setExpenseOpen(true);
  }

  async function handleSaveExpense() {
    if (!expenseForm.date || !expenseForm.description || !expenseForm.amount) return;
    setSavingExpense(true);
    setExpenseError(false);
    try {
      const created = await createExpenseAction({
        date: expenseForm.date,
        description: expenseForm.description,
        category: expenseForm.category || expenseCategories[0]?.name || "Other",
        amount: parseFloat(expenseForm.amount),
        status: expenseForm.status,
      });
      addExpense(created);
      setExpenseForm(defaultExpenseForm());
      setExpenseOpen(false);
    } catch {
      setExpenseError(true);
    } finally {
      setSavingExpense(false);
    }
  }

  const currency = prefs.currency;

  if (!hydrated) return <PageLoading />;

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
              <CalendarRange className="h-4 w-4" />
              {t("dateRange")}
            </Button>
            <Button
              size="sm"
              className="gap-1.5 cursor-pointer bg-income hover:bg-income/90 text-white"
              onClick={openIncome}
            >
              <Plus className="h-4 w-4" />
              {t("addIncome")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5 cursor-pointer"
              onClick={openExpense}
            >
              <Plus className="h-4 w-4" />
              {t("addExpense")}
            </Button>
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t("totalIncome")}
          value={formatCurrency(inc, currency)}
          icon={TrendingUp}
          iconClassName="bg-income/10 text-income"
          badge={{ text: "+12.5%", variant: "positive" }}
        />
        <StatCard
          label={t("totalExpenses")}
          value={formatCurrency(exp, currency)}
          icon={TrendingDown}
          iconClassName="bg-expense/10 text-expense"
          badge={{ text: "-3.2%", variant: "negative" }}
        />
        <StatCard
          label={t("netSavings")}
          value={formatCurrency(net, currency)}
          icon={PiggyBank}
          iconClassName="bg-brand-gold/10 text-brand-gold"
          badge={{ text: net >= 0 ? tc("positive") : tc("negative"), variant: net >= 0 ? "positive" : "negative" }}
        />
        <StatCard
          label={t("earningsRate")}
          value={formatPercent(rate)}
          icon={Percent}
          iconClassName="bg-muted text-muted-foreground"
          badge={{ text: t("sixMonthAvg"), variant: "neutral" }}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <SectionCard title={t("incomeVsExpenses")} className="lg:col-span-3">
          <IncomeVsExpensesChart data={chartData} currency={currency} />
        </SectionCard>
        <SectionCard title={t("spendingByCategory")} className="lg:col-span-2">
          <SpendingDonut data={donutData} currency={currency} />
        </SectionCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title={t("recentTransactions")} viewAllHref="/income">
          <div className="divide-y divide-border -mx-5 px-5">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t("noTransactions")}</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{tx.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(tx.date)} · {tx.category}
                    </p>
                  </div>
                  <span className={tx.type === "income" ? "text-sm font-semibold text-income shrink-0" : "text-sm font-semibold text-expense shrink-0"}>
                    {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title={t("savingsGoals")} viewAllHref="/savings-goals">
          <div className="space-y-5">
            {savingsGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noGoals")}</p>
            ) : (
              savingsGoals.slice(0, 3).map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-foreground">{g.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {t("goal")}: {formatCurrency(g.target, currency)}
                    </Badge>
                  </div>
                  <ProgressBar
                    value={(g.saved / g.target) * 100}
                    saved={g.saved}
                    target={g.target}
                    currency={currency}
                  />
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Add Income Dialog */}
      <AddEditDialog
        open={incomeOpen}
        onOpenChange={setIncomeOpen}
        title={t("addIncomeTitle")}
        description={t("addIncomeDesc")}
        onSave={handleSaveIncome}
        saveLabel={t("addIncome")}
        isSaving={savingIncome}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("date")}</label>
              <Input type="date" value={incomeForm.date}
                onChange={(e) => setIncomeForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("amount")}</label>
              <Input type="number" placeholder="0.00" value={incomeForm.amount}
                onChange={(e) => setIncomeForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("sourceDesc")}</label>
            <Input placeholder={t("sourcePlaceholder")} value={incomeForm.source}
              onChange={(e) => setIncomeForm((f) => ({ ...f, source: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{tc("category")}</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              value={incomeForm.category}
              onChange={(e) => setIncomeForm((f) => ({ ...f, category: e.target.value as IncomeCategoryName }))}
            >
              {incomeCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("notesOptional")}</label>
            <Input placeholder={t("notesPlaceholder")} value={incomeForm.notes}
              onChange={(e) => setIncomeForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          {incomeError && <p className="text-sm text-destructive">{tc("errorGeneric")}</p>}
        </div>
      </AddEditDialog>

      {/* Add Expense Dialog */}
      <AddEditDialog
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        title={t("addExpenseTitle")}
        description={t("addExpenseDesc")}
        onSave={handleSaveExpense}
        saveLabel={t("addExpense")}
        isSaving={savingExpense}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("date")}</label>
              <Input type="date" value={expenseForm.date}
                onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("amount")}</label>
              <Input type="number" placeholder="0.00" value={expenseForm.amount}
                onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("descriptionLabel")}</label>
            <Input placeholder={t("descriptionPlaceholder")} value={expenseForm.description}
              onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("category")}</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value as ExpenseCategoryName }))}
              >
                {expenseCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("status")}</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                value={expenseForm.status}
                onChange={(e) => setExpenseForm((f) => ({ ...f, status: e.target.value as "Paid" | "Pending" }))}
              >
                <option value="Paid">{tc("paid")}</option>
                <option value="Pending">{tc("pending")}</option>
              </select>
            </div>
          </div>
          {expenseError && <p className="text-sm text-destructive">{tc("errorGeneric")}</p>}
        </div>
      </AddEditDialog>
    </>
  );
}
