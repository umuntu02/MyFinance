import type { ImportMapping } from "@/types";
import type {
  ExistingEntry,
  ImportIssue,
  PreviewRow,
  PreviewSummary,
  SheetTable,
} from "./types";
import { cellToString, normalize } from "./text";
import { parseDate } from "./date";
import { parseAmount } from "./number";

// ─────────────────────────────────────────────────────────────────────────────
// Transform — applies a (generic, user-defined) ImportMapping to every data row
// and produces editable preview rows. Common to ALL file shapes: date → ISO,
// amount → number with debit/credit (or signed) resolved to income/expense,
// multi-column label flattened, corrupt/empty/amount-less rows excluded & listed,
// duplicates flagged (non-blocking). No per-bank branching anywhere.
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_CATEGORY = "Other";

function colIndex(headers: string[], name: string | null): number {
  return name ? headers.indexOf(name) : -1;
}

function dedupeKey(date: string, amount: number, label: string): string {
  return `${date}|${amount.toFixed(2)}|${normalize(label)}`;
}

// Strip the user-defined noise text from a label (case-insensitive, literal —
// never a user-supplied regex, so it can't throw). Empty result → keep original.
function cleanupLabel(label: string, pattern: string): string {
  const p = pattern.trim();
  if (!p) return label;
  const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cleaned = label.replace(new RegExp(escaped, "gi"), " ").replace(/\s+/g, " ").trim();
  return cleaned || label;
}

export function buildPreview(
  table: SheetTable,
  mapping: ImportMapping,
  existing: ExistingEntry[] = [],
): { rows: PreviewRow[]; summary: PreviewSummary } {
  const { headers, dataRows } = table;

  const dateIdx = colIndex(headers, mapping.dateColumn);
  const amountIdx = colIndex(headers, mapping.amountColumn);
  const debitIdx = colIndex(headers, mapping.debitColumn);
  const creditIdx = colIndex(headers, mapping.creditColumn);
  const categoryIdx = colIndex(headers, mapping.categoryColumn);
  const descIdx = mapping.descriptionColumns
    .map((c) => headers.indexOf(c))
    .filter((i) => i >= 0);

  const existingKeys = new Set(
    existing.map((e) => dedupeKey(e.date, Math.abs(e.amount), e.label)),
  );
  const batchKeys = new Set<string>();

  const rows: PreviewRow[] = dataRows.map((row, sourceIndex) => {
    const issues: ImportIssue[] = [];

    const date = dateIdx >= 0 ? parseDate(row[dateIdx], mapping.dateFormat) : null;
    if (!date) issues.push("noDate");

    // Resolve amount + type.
    let amount: number | null = null;
    let type: "income" | "expense" | null = null;

    if (mapping.amountMode === "split") {
      const debit = debitIdx >= 0 ? parseAmount(row[debitIdx], mapping.decimalSeparator, mapping.thousandsSeparator) : null;
      const credit = creditIdx >= 0 ? parseAmount(row[creditIdx], mapping.decimalSeparator, mapping.thousandsSeparator) : null;
      const debitAbs = debit !== null ? Math.abs(debit) : 0;
      const creditAbs = credit !== null ? Math.abs(credit) : 0;
      if (debitAbs > 0 && debitAbs >= creditAbs) {
        amount = debitAbs;
        type = "expense";
      } else if (creditAbs > 0) {
        amount = creditAbs;
        type = "income";
      }
    } else {
      const signed = amountIdx >= 0 ? parseAmount(row[amountIdx], mapping.decimalSeparator, mapping.thousandsSeparator) : null;
      if (signed !== null && signed !== 0) {
        const expenseWhenNegative = mapping.expenseSign === "negative";
        const isExpense = expenseWhenNegative ? signed < 0 : signed > 0;
        amount = Math.abs(signed);
        type = isExpense ? "expense" : "income";
      }
    }
    if (amount === null || type === null) issues.push("noAmount");

    const joined = descIdx.map((i) => cellToString(row[i])).filter(Boolean).join(" ").trim();
    const description = cleanupLabel(joined, mapping.labelCleanup ?? "") || "—";

    const rawCategory = categoryIdx >= 0 ? cellToString(row[categoryIdx]) : "";
    const category = rawCategory || DEFAULT_CATEGORY;

    const valid = Boolean(date) && amount !== null && type !== null;

    let duplicate = false;
    if (valid && date && amount !== null) {
      const key = dedupeKey(date, amount, description);
      if (existingKeys.has(key) || batchKeys.has(key)) {
        duplicate = true;
        issues.push("duplicate");
      }
      batchKeys.add(key);
    }

    return {
      id: `row-${sourceIndex}`,
      sourceIndex,
      cells: row.map(cellToString),
      date,
      amount,
      type,
      description,
      category,
      duplicate,
      issues,
      valid,
      included: valid, // corrupt/empty/amount-less rows start excluded
    };
  });

  return { rows, summary: summarize(rows) };
}

export function summarize(rows: PreviewRow[]): PreviewSummary {
  let incomes = 0;
  let expenses = 0;
  let ignored = 0;
  let duplicates = 0;
  for (const r of rows) {
    if (r.duplicate) duplicates++;
    if (!r.included) {
      ignored++;
      continue;
    }
    if (r.type === "income") incomes++;
    else if (r.type === "expense") expenses++;
  }
  return { incomes, expenses, ignored, duplicates, importable: incomes + expenses };
}
