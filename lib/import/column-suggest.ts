import type { ImportMapping } from "@/types";
import type { Cell, SheetTable } from "./types";
import { cellToString, normalize } from "./text";
import { detectDateFormat, parseDate } from "./date";
import { detectNumberFormat, parseAmount } from "./number";

// ─────────────────────────────────────────────────────────────────────────────
// Column suggestion — a SUGGESTION, never a decision. Matches header labels (and
// falls back to inspecting sample values) to propose which column is the date,
// the amount(s), the label and the category. Multi-lingual keyword lists, not
// per-bank logic. The user validates or corrects everything on the mapping
// screen; this only pre-fills it.
// ─────────────────────────────────────────────────────────────────────────────

const KW = {
  date: ["date", "date operation", "date comptable", "date de valeur", "value date", "posted", "transaction date", "fecha", "data", "jour", "datum"],
  debit: ["debit", "retrait", "withdrawal", "sortie", "depense", "paiement", "debito", "cargo", "ausgang"],
  credit: ["credit", "versement", "depot", "deposit", "entree", "recette", "credito", "abono", "eingang"],
  amount: ["montant", "amount", "somme", "valeur", "value", "importe", "importo", "betrag", "mouvement", "operation amount"],
  description: ["libelle", "description", "label", "intitule", "motif", "detail", "narrative", "memo", "payee", "beneficiaire", "concept", "communication", "nature", "operation", "concepto", "causale", "verwendungszweck", "wording", "reference"],
  category: ["categorie", "category", "type", "rubrique", "categoria", "poste", "kategorie"],
  balance: ["solde", "balance", "saldo", "kontostand"],
};

function normHeaders(headers: string[]): string[] {
  return headers.map((h) => normalize(h));
}

// Index of the first header that equals (or, failing that, contains) a keyword,
// optionally avoiding columns already taken or matching an "avoid" list.
function findColumn(
  normalized: string[],
  keywords: string[],
  opts: { avoid?: string[]; taken?: Set<number> } = {},
): number {
  const taken = opts.taken ?? new Set<number>();
  const avoid = opts.avoid ?? [];
  const isAvoided = (h: string) => avoid.some((a) => h.includes(a));

  // Pass 1: exact match.
  for (let i = 0; i < normalized.length; i++) {
    if (taken.has(i) || isAvoided(normalized[i])) continue;
    if (keywords.some((k) => normalized[i] === k)) return i;
  }
  // Pass 2: contains.
  for (let i = 0; i < normalized.length; i++) {
    if (taken.has(i) || isAvoided(normalized[i])) continue;
    if (keywords.some((k) => normalized[i].includes(k))) return i;
  }
  return -1;
}

function columnSamples(table: SheetTable, col: number, max = 40): Cell[] {
  const out: Cell[] = [];
  for (const row of table.dataRows) {
    out.push(row[col]);
    if (out.length >= max) break;
  }
  return out;
}

// Does a column's sample values mostly parse as dates / numbers?
function dateScore(samples: Cell[]): number {
  const vals = samples.filter((c) => cellToString(c) !== "");
  if (!vals.length) return 0;
  const ok = vals.filter((c) => parseDate(c, "auto") !== null).length;
  return ok / vals.length;
}

function numberScore(samples: Cell[]): number {
  const vals = samples.filter((c) => cellToString(c) !== "");
  if (!vals.length) return 0;
  const ok = vals.filter((c) => parseAmount(c, ".", "none") !== null || parseAmount(c, ",", ".") !== null).length;
  return ok / vals.length;
}

function avgTextLength(samples: Cell[]): number {
  const vals = samples.map((c) => cellToString(c)).filter(Boolean);
  if (!vals.length) return 0;
  return vals.reduce((s, v) => s + v.length, 0) / vals.length;
}

export function suggestMapping(table: SheetTable): ImportMapping {
  const headers = table.headers;
  const norm = normHeaders(headers);
  const byName = (i: number): string | null => (i >= 0 ? headers[i] : null);
  const taken = new Set<number>();

  // Date — by header, else the column whose samples parse best as dates.
  let dateIdx = findColumn(norm, KW.date, { taken });
  if (dateIdx < 0) {
    let best = -1;
    let bestScore = 0.5;
    for (let i = 0; i < headers.length; i++) {
      const s = dateScore(columnSamples(table, i));
      if (s > bestScore) {
        bestScore = s;
        best = i;
      }
    }
    dateIdx = best;
  }
  if (dateIdx >= 0) taken.add(dateIdx);

  // Amount mode — split debit/credit if both present, else a single column.
  const debitIdx = findColumn(norm, KW.debit, { taken, avoid: KW.balance });
  const creditIdx = findColumn(norm, KW.credit, { taken, avoid: KW.balance });

  let amountMode: ImportMapping["amountMode"] = "single";
  let amountIdx = -1;

  if (debitIdx >= 0 && creditIdx >= 0) {
    amountMode = "split";
    taken.add(debitIdx);
    taken.add(creditIdx);
  } else {
    amountIdx = findColumn(norm, KW.amount, { taken, avoid: KW.balance });
    if (amountIdx < 0) {
      // No amount header: pick the best numeric column that isn't the balance.
      let best = -1;
      let bestScore = 0.6;
      for (let i = 0; i < headers.length; i++) {
        if (taken.has(i) || KW.balance.some((b) => norm[i].includes(b))) continue;
        const s = numberScore(columnSamples(table, i));
        if (s > bestScore) {
          bestScore = s;
          best = i;
        }
      }
      amountIdx = best;
    }
    if (amountIdx >= 0) taken.add(amountIdx);
  }

  // Category (optional).
  const categoryIdx = findColumn(norm, KW.category, { taken, avoid: [...KW.amount, ...KW.debit, ...KW.credit] });
  if (categoryIdx >= 0) taken.add(categoryIdx);

  // Description — every header matching the label keywords; fall back to the
  // remaining column with the longest average text.
  const descIdx: number[] = [];
  norm.forEach((h, i) => {
    if (taken.has(i)) return;
    if (KW.description.some((k) => h === k || h.includes(k))) descIdx.push(i);
  });
  if (descIdx.length === 0) {
    let best = -1;
    let bestLen = 0;
    for (let i = 0; i < headers.length; i++) {
      if (taken.has(i)) continue;
      const len = avgTextLength(columnSamples(table, i));
      if (len > bestLen) {
        bestLen = len;
        best = i;
      }
    }
    if (best >= 0) descIdx.push(best);
  }
  descIdx.forEach((i) => taken.add(i));

  // Number / date formats from the relevant columns' samples.
  const amountSampleCols =
    amountMode === "split"
      ? [debitIdx, creditIdx].filter((i) => i >= 0)
      : amountIdx >= 0
        ? [amountIdx]
        : [];
  const numberSamples = amountSampleCols.flatMap((i) => columnSamples(table, i));
  const { decimal, thousands } = detectNumberFormat(numberSamples);
  const dateFormat = dateIdx >= 0 ? detectDateFormat(columnSamples(table, dateIdx)) : "auto";

  return {
    amountMode,
    dateColumn: byName(dateIdx),
    amountColumn: amountMode === "single" ? byName(amountIdx) : null,
    expenseSign: "negative",
    debitColumn: amountMode === "split" ? byName(debitIdx) : null,
    creditColumn: amountMode === "split" ? byName(creditIdx) : null,
    descriptionColumns: descIdx.map((i) => headers[i]),
    categoryColumn: byName(categoryIdx),
    labelCleanup: "",
    dateFormat,
    decimalSeparator: decimal,
    thousandsSeparator: thousands,
  };
}

// A blank mapping (used when the user clears the form or no suggestion applies).
export function emptyMapping(): ImportMapping {
  return {
    amountMode: "single",
    dateColumn: null,
    amountColumn: null,
    expenseSign: "negative",
    debitColumn: null,
    creditColumn: null,
    descriptionColumns: [],
    categoryColumn: null,
    labelCleanup: "",
    dateFormat: "auto",
    decimalSeparator: ".",
    thousandsSeparator: "none",
  };
}

// Re-fit a saved profile's mapping to a new file: keep only column references
// that still exist among the new headers (others reset to null for re-mapping).
export function reconcileMapping(mapping: ImportMapping, headers: string[]): ImportMapping {
  const has = (name: string | null): string | null =>
    name && headers.includes(name) ? name : null;
  return {
    ...mapping,
    dateColumn: has(mapping.dateColumn),
    amountColumn: has(mapping.amountColumn),
    debitColumn: has(mapping.debitColumn),
    creditColumn: has(mapping.creditColumn),
    descriptionColumns: mapping.descriptionColumns.filter((c) => headers.includes(c)),
    categoryColumn: has(mapping.categoryColumn),
  };
}
