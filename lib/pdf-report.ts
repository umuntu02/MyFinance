import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { FinanceSnapshot } from "@/store/useFinanceStore";
import {
  totalIncome,
  totalExpenses,
  netSavings,
  savingsRate,
  monthlyBreakdown,
} from "@/lib/selectors";
import { formatDate } from "@/lib/format";

// ─────────────────────────────────────────────────────────────────────────────
// PDF report builder (step 5) — client-side via jsPDF + autoTable.
//
// Turns a FinanceSnapshot (the current user's data) into a downloadable, multi
// page report: summary KPIs, a month-by-month breakdown, then full income,
// expense and savings-goal tables. autoTable handles pagination automatically.
//
// Money is rendered as "CODE 1,234.56" (currency code + grouped number) rather
// than locale symbols: the default PDF font can't draw glyphs like ₹/₣, so the
// code keeps every currency legible.
// ─────────────────────────────────────────────────────────────────────────────

const BRAND: [number, number, number] = [45, 106, 79]; // forest green (--sidebar)

export function buildPdfReport(snapshot: FinanceSnapshot): jsPDF {
  const { incomes, expenses, savingsGoals, prefs } = snapshot;
  const code = prefs.currency;
  const money = (n: number) =>
    `${code} ${n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MyFinance — Financial Report", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString("en-US")}`, 14, 25);
  if (prefs.displayName) doc.text(`Account: ${prefs.displayName}`, 14, 30);
  doc.setTextColor(0);

  // ── Summary ──
  autoTable(doc, {
    startY: 36,
    head: [["Summary", "Value"]],
    body: [
      ["Total income", money(totalIncome(incomes))],
      ["Total expenses", money(totalExpenses(expenses))],
      ["Net savings", money(netSavings(incomes, expenses))],
      ["Savings rate", `${savingsRate(incomes, expenses).toFixed(1)}%`],
      ["Monthly budget", money(prefs.monthlyBudget)],
      ["Income records", String(incomes.length)],
      ["Expense records", String(expenses.length)],
    ],
    theme: "striped",
    headStyles: { fillColor: BRAND },
    styles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
  });

  // ── Month-by-month breakdown ──
  const breakdown = monthlyBreakdown(incomes, expenses, 24);
  if (breakdown.length) {
    autoTable(doc, {
      head: [["Month", "Income", "Expenses", "Net", "Rate", "Status"]],
      body: breakdown.map((b) => [
        b.month,
        money(b.income),
        money(b.expenses),
        money(b.netSavings),
        `${b.savingsRate.toFixed(1)}%`,
        b.status,
      ]),
      theme: "grid",
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });
  }

  // ── Income ──
  if (incomes.length) {
    sectionTitle(doc, "Income");
    autoTable(doc, {
      head: [["Date", "Source", "Category", "Amount", "Notes"]],
      body: [...incomes]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((i) => [formatDate(i.date), i.source, i.category, money(i.amount), i.notes ?? ""]),
      theme: "striped",
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 8 },
      columnStyles: { 3: { halign: "right" } },
    });
  }

  // ── Expenses ──
  if (expenses.length) {
    sectionTitle(doc, "Expenses");
    autoTable(doc, {
      head: [["Date", "Description", "Category", "Amount", "Status"]],
      body: [...expenses]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((e) => [formatDate(e.date), e.description, e.category, money(e.amount), e.status]),
      theme: "striped",
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 8 },
      columnStyles: { 3: { halign: "right" } },
    });
  }

  // ── Savings goals ──
  if (savingsGoals.length) {
    sectionTitle(doc, "Savings Goals");
    autoTable(doc, {
      head: [["Goal", "Saved", "Target", "Progress", "Target date"]],
      body: savingsGoals.map((g) => [
        g.name,
        money(g.saved),
        money(g.target),
        `${g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0}%`,
        formatDate(g.targetDate),
      ]),
      theme: "striped",
      headStyles: { fillColor: BRAND },
      styles: { fontSize: 8 },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
    });
  }

  // ── Footer page numbers ──
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${p} / ${pages}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" }
    );
  }

  return doc;
}

// Print a small section heading just below wherever the last table ended.
function sectionTitle(doc: jsPDF, label: string) {
  const prev = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const y = (prev?.finalY ?? 30) + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(label, 14, y);
  // autoTable's next call will start a few units below this heading.
  (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable = {
    finalY: y,
  };
}
