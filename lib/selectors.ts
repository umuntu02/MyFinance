import type {
  Income,
  Expense,
  IncomeCategory,
  ExpenseCategory,
  MonthlyBreakdown,
  ChartDataPoint,
  IncomeCategoryName,
  ExpenseCategoryName,
} from "@/types";

// ── Month key helpers ────────────────────────────────────────────────────────

function toYearMonth(date: string): string {
  return date.slice(0, 7); // "YYYY-MM"
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

function yearMonthLabel(ym: string): string {
  const [year, month] = ym.split("-");
  return `${MONTH_LABELS[month]} ${year}`;
}

function currentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// ── Aggregate helpers ─────────────────────────────────────────────────────────

export function totalIncome(incomes: Income[]): number {
  return incomes.reduce((s, i) => s + i.amount, 0);
}

export function totalExpenses(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

export function netSavings(incomes: Income[], expenses: Expense[]): number {
  return totalIncome(incomes) - totalExpenses(expenses);
}

export function savingsRate(incomes: Income[], expenses: Expense[]): number {
  const inc = totalIncome(incomes);
  if (inc === 0) return 0;
  return (netSavings(incomes, expenses) / inc) * 100;
}

// ── This-month helpers ────────────────────────────────────────────────────────

export function thisMonthIncome(incomes: Income[]): number {
  const ym = currentYearMonth();
  return incomes.filter((i) => toYearMonth(i.date) === ym).reduce((s, i) => s + i.amount, 0);
}

export function thisMonthExpenses(expenses: Expense[]): number {
  const ym = currentYearMonth();
  return expenses.filter((e) => toYearMonth(e.date) === ym).reduce((s, e) => s + e.amount, 0);
}

// ── Monthly averages (over all months with data) ───────────────────────────────

export function monthlyAvg(
  incomes: Income[],
  expenses: Expense[]
): { income: number; expenses: number } {
  const incomeMonths = new Set(incomes.map((i) => toYearMonth(i.date)));
  const expenseMonths = new Set(expenses.map((e) => toYearMonth(e.date)));
  return {
    income: incomeMonths.size ? totalIncome(incomes) / incomeMonths.size : 0,
    expenses: expenseMonths.size ? totalExpenses(expenses) / expenseMonths.size : 0,
  };
}

// ── Category breakdowns (computed, not stored) ─────────────────────────────────

const INCOME_CATEGORY_ICONS: Record<IncomeCategoryName, string> = {
  Salary:     "briefcase",
  Freelance:  "code-2",
  Investment: "trending-up",
  Bonus:      "gift",
  Other:      "circle-dot",
};

const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategoryName, string> = {
  Housing:        "home",
  "Food & Dining": "utensils",
  Transport:      "car",
  Utilities:      "zap",
  Entertainment:  "tv-2",
  Healthcare:     "heart-pulse",
  Shopping:       "shopping-bag",
  Other:          "circle-dot",
};

export function incomeByCategory(incomes: Income[]): IncomeCategory[] {
  const map = new Map<IncomeCategoryName, { total: number; count: number }>();
  for (const i of incomes) {
    const cur = map.get(i.category) ?? { total: 0, count: 0 };
    map.set(i.category, { total: cur.total + i.amount, count: cur.count + 1 });
  }
  return Array.from(map.entries()).map(([name, { total, count }]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    icon: INCOME_CATEGORY_ICONS[name] ?? "circle-dot",
    total,
    recordCount: count,
  }));
}

export function expenseByCategory(expenses: Expense[]): ExpenseCategory[] {
  const map = new Map<ExpenseCategoryName, { total: number; count: number }>();
  for (const e of expenses) {
    const cur = map.get(e.category) ?? { total: 0, count: 0 };
    map.set(e.category, { total: cur.total + e.amount, count: cur.count + 1 });
  }
  return Array.from(map.entries()).map(([name, { total, count }]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    icon: EXPENSE_CATEGORY_ICONS[name] ?? "circle-dot",
    total,
    recordCount: count,
  }));
}

// ── Monthly breakdown (last N months with data) ────────────────────────────────

export function monthlyBreakdown(
  incomes: Income[],
  expenses: Expense[],
  limit = 6
): MonthlyBreakdown[] {
  const allMonths = new Set([
    ...incomes.map((i) => toYearMonth(i.date)),
    ...expenses.map((e) => toYearMonth(e.date)),
  ]);

  const sorted = Array.from(allMonths).sort().reverse().slice(0, limit).reverse();

  return sorted.map((ym) => {
    const inc = incomes
      .filter((i) => toYearMonth(i.date) === ym)
      .reduce((s, i) => s + i.amount, 0);
    const exp = expenses
      .filter((e) => toYearMonth(e.date) === ym)
      .reduce((s, e) => s + e.amount, 0);
    const net = inc - exp;
    const rate = inc > 0 ? (net / inc) * 100 : 0;
    return {
      month: yearMonthLabel(ym),
      yearMonth: ym,
      income: inc,
      expenses: exp,
      netSavings: net,
      savingsRate: rate,
      status: net >= 0 ? "Positive" : "Negative",
    };
  });
}

// ── Income vs Expenses series (for line/bar charts) ────────────────────────────

export type Granularity = "month" | "year";

// Group the income/expenses series either by month (default — last `limit`
// months) or by year (every year present in the data). Drives the dashboard
// chart's month/year toggle so the user can watch the evolution at either scale.
export function incomeVsExpensesSeries(
  incomes: Income[],
  expenses: Expense[],
  granularity: Granularity = "month",
  limit?: number
): ChartDataPoint[] {
  if (granularity === "year") {
    const years = Array.from(
      new Set([
        ...incomes.map((i) => i.date.slice(0, 4)),
        ...expenses.map((e) => e.date.slice(0, 4)),
      ])
    ).sort();
    const chosen = limit ? years.slice(-limit) : years;
    return chosen.map((y) => ({
      month: y, // the XAxis label — a 4-digit year here
      income: incomes.filter((i) => i.date.startsWith(y)).reduce((s, i) => s + i.amount, 0),
      expenses: expenses.filter((e) => e.date.startsWith(y)).reduce((s, e) => s + e.amount, 0),
    }));
  }

  return monthlyBreakdown(incomes, expenses, limit ?? 12).map(
    ({ month, income, expenses: exp }) => ({ month, income, expenses: exp })
  );
}

// ── KPI deltas (dashboard stat-card badges) ────────────────────────────────────

// Percentage change of a dated, amount-bearing series (incomes OR expenses)
// between its most recent month with data and the month immediately before it.
// Returns null when there aren't two comparable months, or when the earlier
// month's total is 0 — so the dashboard can show a neutral "—" instead of an
// invented (or infinite) percentage for a brand-new account with a single
// period of data. The sign is the raw change (positive = the total went up);
// callers decide whether "up" is good (income) or bad (expenses).
export function monthOverMonthChange(
  rows: { date: string; amount: number }[]
): number | null {
  const months = Array.from(new Set(rows.map((r) => toYearMonth(r.date)))).sort();
  if (months.length < 2) return null;
  const totalFor = (ym: string) =>
    rows.filter((r) => toYearMonth(r.date) === ym).reduce((s, r) => s + r.amount, 0);
  const previous = totalFor(months[months.length - 2]);
  if (previous === 0) return null;
  const current = totalFor(months[months.length - 1]);
  return ((current - previous) / previous) * 100;
}

// Average monthly savings rate over the last `months` months that have data
// (reuses monthlyBreakdown's per-month rate). Months without income are skipped
// (their rate is undefined). Returns null when no month qualifies, so the badge
// can fall back to a neutral state instead of showing a meaningless 0%.
export function avgSavingsRate(
  incomes: Income[],
  expenses: Expense[],
  months = 6
): number | null {
  const rates = monthlyBreakdown(incomes, expenses, months)
    .filter((b) => b.income > 0)
    .map((b) => b.savingsRate);
  if (rates.length === 0) return null;
  return rates.reduce((s, r) => s + r, 0) / rates.length;
}
