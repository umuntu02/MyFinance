"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, PiggyBank, Percent, Download, Printer } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  monthlyBreakdown,
  expenseByCategory,
} from "@/lib/selectors";
import { formatCurrency, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { SavingsBarChart, type SavingsBarDatum } from "@/components/shared/charts/savings-bar-chart";
import { ExpenseDistributionPie, type PieSlice } from "@/components/shared/charts/expense-distribution-pie";
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

export default function MonthlyReportPage() {
  const { incomes, expenses, prefs } = useFinanceStore();
  const currency = prefs.currency;

  const inc  = useMemo(() => totalIncome(incomes), [incomes]);
  const exp  = useMemo(() => totalExpenses(expenses), [expenses]);
  const net  = useMemo(() => netSavings(incomes, expenses), [incomes, expenses]);
  const rate = useMemo(() => savingsRate(incomes, expenses), [incomes, expenses]);

  const breakdown = useMemo(() => monthlyBreakdown(incomes, expenses, 6), [incomes, expenses]);

  const barData: SavingsBarDatum[] = useMemo(
    () => breakdown.map((b) => ({ month: b.month.split(" ")[0], netSavings: b.netSavings })),
    [breakdown],
  );

  const expCats = useMemo(() => expenseByCategory(expenses), [expenses]);
  const pieData: PieSlice[] = useMemo(
    () => expCats.map((c) => ({ name: c.name, value: c.total, color: EXPENSE_COLORS[c.name] ?? "#adb5bd" })),
    [expCats],
  );

  function handleExportCSV() {
    const headers = ["Month", "Income", "Expenses", "Net Savings", "Savings Rate", "Status"];
    const rows = breakdown.map((b) => [
      b.month,
      b.income.toFixed(2),
      b.expenses.toFixed(2),
      b.netSavings.toFixed(2),
      b.savingsRate.toFixed(1) + "%",
      b.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "monthly-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Monthly Report"
        subtitle="6-month income analysis"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="6-Month Income"
          value={formatCurrency(inc, currency)}
          icon={TrendingUp}
          iconClassName="bg-income/10 text-income"
        />
        <StatCard
          label="6-Month Expenses"
          value={formatCurrency(exp, currency)}
          icon={TrendingDown}
          iconClassName="bg-expense/10 text-expense"
        />
        <StatCard
          label="Net Savings"
          value={formatCurrency(net, currency)}
          icon={PiggyBank}
          iconClassName="bg-brand-gold/10 text-brand-gold"
        />
        <StatCard
          label="Avg Savings Rate"
          value={formatPercent(rate)}
          icon={Percent}
          iconClassName="bg-muted text-muted-foreground"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SectionCard
          title="Monthly Savings"
          headerExtra={
            <span className="text-xs text-muted-foreground">Net savings per month</span>
          }
        >
          <SavingsBarChart data={barData} currency={currency} />
        </SectionCard>
        <SectionCard title="Expense Distribution">
          <ExpenseDistributionPie data={pieData} currency={currency} />
        </SectionCard>
      </div>

      {/* Month-by-month breakdown table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">Month-by-Month Breakdown</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {["Month", "Income", "Expenses", "Net Savings", "Savings Rate", "Status"].map((h) => (
                <TableHead key={h} className="text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  No data available.
                </TableCell>
              </TableRow>
            ) : (
              breakdown.map((b) => (
                <TableRow key={b.yearMonth} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3 text-sm font-medium text-foreground">{b.month}</TableCell>
                  <TableCell className="py-3 text-sm text-income font-medium">
                    {formatCurrency(b.income, currency)}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-expense font-medium">
                    {formatCurrency(b.expenses, currency)}
                  </TableCell>
                  <TableCell className="py-3 text-sm font-semibold text-foreground">
                    {formatCurrency(b.netSavings, currency)}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {formatPercent(b.savingsRate)}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      className={`text-xs font-medium border-0 ${
                        b.status === "Positive"
                          ? "bg-income/10 text-income"
                          : "bg-expense/10 text-expense"
                      }`}
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
