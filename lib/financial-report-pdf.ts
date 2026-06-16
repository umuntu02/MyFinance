import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import type { Income, Expense, Currency } from "@/types";
import { totalIncome, totalExpenses, netSavings } from "@/lib/selectors";
import { formatCurrencyFull } from "@/lib/format";

// ─────────────────────────────────────────────────────────────────────────────
// Financial report PDF (topbar "Export → PDF")
//
// A clean, sober, black-and-white, printable A4 report. It is INSPIRED by the
// general layout of a financial statement but copies no third-party brand: the
// only logo is MyFinance's (or the user's own `logoUrl`). It is a BUDGET report,
// not a bank statement — no IBAN, no bank address, no credit/debit accounting.
//
// Why jsPDF + jspdf-autotable: both are already project dependencies (used by
// lib/pdf-report.ts) and are proven to run client-side without touching `window`
// at import time, so there is no SSR risk and no new heavy dependency (vs.
// @react-pdf/renderer). The builder is dynamically imported on click, keeping
// jsPDF out of the global bundle. Totals reuse lib/selectors (pure functions).
//
// Money uses formatCurrencyFull (2 decimals) with the user's currency so an
// itemised financial document never rounds away cents. Note: jsPDF's default
// Helvetica font can't draw a few exotic currency glyphs (e.g. ₹ INR, ₵ GHS);
// those degrade to the symbol's fallback box — see PROJECT_LOG residual notes.
// ─────────────────────────────────────────────────────────────────────────────

export type ReportLabels = {
  title: string;
  account: string;
  generatedOn: string;
  from: string;
  to: string;
  date: string;
  type: string;
  description: string;
  income: string;
  expense: string;
  totalIncome: string;
  totalExpenses: string;
  netSavings: string;
  page: string;
  empty: string;
};

export type ReportData = {
  incomes: Income[];
  expenses: Expense[];
  currency: Currency;
  displayName: string;
  logoUrl?: string;
};

const INK: [number, number, number] = [33, 37, 41];
const MUTED: [number, number, number] = [120, 120, 120];
const HEADER_FILL: [number, number, number] = [245, 245, 245];
const LINE: [number, number, number] = [224, 224, 224];

const MARGIN = 16; // mm — comfortable A4 print margins
const DEFAULT_LOGO = "/img/logo.png";

// "YYYY-MM-DD" → "DD/MM/YYYY" (locale-neutral, statement-style date).
function ddmmyyyy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Load an image as an <img> element for jsPDF.addImage. Resolves null on any
// failure (missing file, CORS) so the header gracefully falls back to a text
// wordmark instead of throwing.
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function buildFinancialReport(
  data: ReportData,
  L: ReportLabels
): Promise<jsPDF> {
  const { incomes, expenses, currency, displayName } = data;
  const money = (n: number) => formatCurrencyFull(n, currency);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const rightX = pageW - MARGIN;

  // ── Header: logo (or wordmark) top-left ──
  const logo = await loadImage(data.logoUrl || DEFAULT_LOGO);
  let headerBottom = 18;
  if (logo && logo.naturalWidth > 0) {
    const h = 12;
    const w = (logo.naturalWidth / logo.naturalHeight) * h;
    doc.addImage(logo, "PNG", MARGIN, 12, w, h);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text("MyFinance", MARGIN + w + 4, 20);
    headerBottom = 24;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...INK);
    doc.text("MyFinance", MARGIN, 20);
    headerBottom = 24;
  }

  // ── Title ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text(L.title.toUpperCase(), MARGIN, headerBottom + 12);

  // ── Identity + generation date ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(L.account.toUpperCase(), MARGIN, headerBottom + 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(displayName || "—", MARGIN, headerBottom + 26);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `${L.generatedOn} ${ddmmyyyy(new Date().toISOString().slice(0, 10))}`,
    rightX,
    headerBottom + 20,
    { align: "right" }
  );

  // ── Period (min → max transaction date) ──
  const allDates = [...incomes, ...expenses].map((r) => r.date).sort();
  if (allDates.length) {
    const period = `${L.from} ${ddmmyyyy(allDates[0])} ${L.to} ${ddmmyyyy(
      allDates[allDates.length - 1]
    )}`;
    doc.text(period, rightX, headerBottom + 26, { align: "right" });
  }

  // ── Transactions table (income + expense, chronological) ──
  type Row = { date: string; type: string; label: string; inc: string; exp: string };
  const rows: Row[] = [
    ...incomes.map((i) => ({
      date: i.date, type: L.income, label: i.source, inc: money(i.amount), exp: "",
    })),
    ...expenses.map((e) => ({
      date: e.date, type: L.expense, label: e.description, inc: "", exp: money(e.amount),
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const tableTop = headerBottom + 34;

  if (rows.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(L.empty, MARGIN, tableTop);
  } else {
    autoTable(doc, {
      startY: tableTop,
      margin: { left: MARGIN, right: MARGIN },
      head: [[L.date, L.type, L.description, L.income, L.expense]],
      body: rows.map((r) => [ddmmyyyy(r.date), r.type, r.label, r.inc, r.exp]),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 2.4,
        textColor: INK,
        lineColor: LINE,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: HEADER_FILL,
        textColor: INK,
        fontStyle: "bold",
        lineColor: LINE,
        lineWidth: 0.1,
      },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });
  }

  // ── Totals block, bottom-right (net savings highlighted) ──
  const lastY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? tableTop;
  const pageH = doc.internal.pageSize.getHeight();
  let ty = lastY + 12;
  if (ty + 26 > pageH - MARGIN) {
    doc.addPage();
    ty = MARGIN + 6;
  }

  const labelX = pageW - MARGIN - 70;
  const drawTotal = (label: string, value: string, bold: boolean) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 10);
    doc.setTextColor(...INK);
    doc.text(label, labelX, ty);
    doc.text(value, rightX, ty, { align: "right" });
  };

  drawTotal(L.totalIncome, money(totalIncome(incomes)), false);
  ty += 7;
  drawTotal(L.totalExpenses, money(totalExpenses(expenses)), false);
  ty += 9;

  // Highlight the net-savings line with a light grey band.
  doc.setFillColor(...HEADER_FILL);
  doc.rect(labelX - 4, ty - 5, rightX - labelX + 8, 9, "F");
  drawTotal(L.netSavings, money(netSavings(incomes, expenses)), true);

  // ── Per-page pagination, top-right ──
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${L.page.toUpperCase()} ${p}/${pages}`, rightX, 12, { align: "right" });
  }

  return doc;
}
