import type { Cell, SheetTable } from "./types";
import { cellToString, isBlank, normalize } from "./text";

// ─────────────────────────────────────────────────────────────────────────────
// Header detection — position-agnostic. Scans the first rows, scores each as a
// potential header (short text labels, header-like keywords, data-looking rows
// below it) and picks the best. Everything ABOVE the header (titles, account
// holder, IBAN, opening balance, blank lines) is preamble: ignored, never
// imported. No assumption about a fixed header position, and no per-bank rules.
// ─────────────────────────────────────────────────────────────────────────────

const HEADER_HINTS = [
  "date", "montant", "amount", "libelle", "label", "description", "debit",
  "credit", "credito", "debito", "valeur", "operation", "solde", "balance",
  "categorie", "category", "type", "reference", "devise", "currency", "fecha",
  "importe", "concepto", "saldo", "data", "importo", "causale", "valuta",
];

const MAX_SCAN = 25; // rows to consider as a possible header

function looksLikeData(cell: Cell): boolean {
  if (cell instanceof Date || typeof cell === "number") return true;
  const s = cellToString(cell);
  if (!s) return false;
  if (/\d{1,4}[./-]\d{1,2}[./-]\d{1,4}/.test(s)) return true; // a date
  if (/^[(-]?[\d.,'\s]+[)-]?$/.test(s) && /\d/.test(s)) return true; // a number
  return false;
}

function looksLikeLabel(cell: Cell): boolean {
  if (cell instanceof Date || typeof cell === "number") return false;
  const s = cellToString(cell);
  if (!s || s.length > 40) return false;
  if (looksLikeData(cell)) return false;
  return /[a-zA-ZÀ-ɏ]/.test(s); // contains letters
}

function scoreRow(rows: Cell[][], i: number): number {
  const row = rows[i];
  const nonEmpty = row.filter((c) => !isBlank(c));
  if (nonEmpty.length < 2) return -1;

  const labelCount = row.filter(looksLikeLabel).length;
  const labelRatio = labelCount / nonEmpty.length;
  const keywordHits = row.filter((c) =>
    HEADER_HINTS.some((h) => normalize(cellToString(c)) === h || normalize(cellToString(c)).includes(h)),
  ).length;

  // How data-like are the up-to-5 rows directly below this candidate?
  let belowData = 0;
  let belowCount = 0;
  for (let j = i + 1; j <= i + 5 && j < rows.length; j++) {
    const r = rows[j];
    const ne = r.filter((c) => !isBlank(c));
    if (ne.length === 0) continue;
    belowCount++;
    belowData += r.filter(looksLikeData).length / ne.length;
  }
  const belowRatio = belowCount > 0 ? belowData / belowCount : 0;

  return keywordHits * 5 + labelRatio * 3 + belowRatio * 2 + Math.min(nonEmpty.length, 6) * 0.2;
}

export function detectHeaderRow(rows: Cell[][]): number {
  let best = -1;
  let bestScore = -Infinity;
  const limit = Math.min(rows.length, MAX_SCAN);
  for (let i = 0; i < limit; i++) {
    const score = scoreRow(rows, i);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  // Fallback: first non-empty row.
  if (best < 0) {
    best = rows.findIndex((r) => r.some((c) => !isBlank(c)));
  }
  return best < 0 ? 0 : best;
}

// Turn a header row into de-duplicated, never-empty labels.
export function buildHeaders(headerRow: Cell[], width: number): string[] {
  const seen = new Map<string, number>();
  const out: string[] = [];
  for (let i = 0; i < width; i++) {
    let label = cellToString(headerRow[i]);
    if (!label) label = `Column ${i + 1}`;
    const key = label.toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    out.push(count === 0 ? label : `${label} (${count + 1})`);
  }
  return out;
}

// Build the table around a chosen header row (auto-detected or user-overridden).
export function extractTable(rows: Cell[][], headerRowIndex: number): SheetTable {
  const index = Math.max(0, Math.min(headerRowIndex, rows.length - 1));
  const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
  const headers = buildHeaders(rows[index] ?? [], width);
  const dataRows = rows
    .slice(index + 1)
    .filter((r) => r.some((c) => !isBlank(c)));
  return {
    allRows: rows,
    headerRowIndex: index,
    headers,
    dataRows,
    preamble: rows.slice(0, index),
  };
}
