// ─────────────────────────────────────────────────────────────────────────────
// Generic import engine — internal types (no React, no DB, no per-bank logic).
//
// The engine works on a raw 2D grid of cells (whatever SheetJS hands back for
// XLSX or CSV), detects the header row, and — driven ENTIRELY by a user-defined
// ImportMapping — turns data rows into preview rows ready for review. Nothing in
// here knows or guesses which bank produced the file.
// ─────────────────────────────────────────────────────────────────────────────

// A raw cell as produced by SheetJS with { cellDates: true, raw: true }.
export type Cell = string | number | boolean | Date | null | undefined;

// Result of locating the header inside a raw grid.
export type SheetTable = {
  allRows: Cell[][];
  headerRowIndex: number; // index into allRows of the detected header
  headers: string[]; // normalised, de-duplicated header labels
  dataRows: Cell[][]; // rows AFTER the header (the actual operations)
  preamble: Cell[][]; // everything above the header — ignored, never imported
};

// Why a row was excluded / flagged. UI maps these to i18n strings.
export type ImportIssue = "noDate" | "noAmount" | "duplicate";

// One reviewable row in the preview, before insertion.
export type PreviewRow = {
  id: string; // stable key (row-<sourceIndex>)
  sourceIndex: number; // index into SheetTable.dataRows
  cells: string[]; // raw cells, stringified for display
  date: string | null; // ISO "YYYY-MM-DD" or null when unparseable
  amount: number | null; // absolute value (sign is carried by `type`)
  type: "income" | "expense" | null;
  description: string;
  category: string;
  duplicate: boolean;
  issues: ImportIssue[];
  valid: boolean; // has a date, an amount and a resolved type
  included: boolean; // user toggle (defaults to `valid`)
};

export type PreviewSummary = {
  incomes: number;
  expenses: number;
  ignored: number; // not included (invalid or unchecked)
  duplicates: number;
  importable: number; // included rows that will be written
};

// Existing transactions used for non-blocking duplicate detection.
export type ExistingEntry = { date: string; amount: number; label: string };
