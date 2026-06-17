import type { DecimalSeparator, ThousandsSeparator } from "@/types";
import type { Cell } from "./types";
import { cellToString } from "./text";

// ─────────────────────────────────────────────────────────────────────────────
// Amount parsing — format-driven (decimal + thousands separators), not
// bank-specific. Handles currency symbols, spaces/NBSP, leading/trailing minus
// and parenthesised negatives, e.g. "1 234,56 €", "$1,234.56", "(45.00)", "12,50-".
// `detectNumberFormat` only SUGGESTS the separators from samples; user overrides.
// ─────────────────────────────────────────────────────────────────────────────

const SPACE_RE = /[\s  ]/g;

export function parseAmount(
  cell: Cell,
  decimal: DecimalSeparator,
  thousands: ThousandsSeparator,
): number | null {
  if (cell === null || cell === undefined) return null;
  if (typeof cell === "number") return Number.isFinite(cell) ? cell : null;
  if (cell instanceof Date) return null;

  let s = cellToString(cell);
  if (!s) return null;

  // Parenthesised or trailing-minus negatives.
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (/-\s*$/.test(s)) {
    negative = true;
    s = s.replace(/-\s*$/, "");
  }
  if (/^\s*-/.test(s)) negative = true;

  // Drop everything that isn't a digit or a separator we care about.
  s = s.replace(SPACE_RE, "");
  s = s.replace(/[^\d.,'-]/g, "");
  if (thousands !== "none") {
    const t = thousands === " " ? "" : thousands; // spaces already gone
    if (t) s = s.split(t).join("");
  }
  // Normalise the decimal separator to a dot.
  if (decimal === ",") s = s.replace(/,/g, ".");
  else s = s.replace(/,/g, "");
  s = s.replace(/-/g, "");

  // Guard against a stray second dot (e.g. an undeclared thousands sep).
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  if (s === "" || s === ".") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -Math.abs(n) : n;
}

// Suggest separators from sample values. The rightmost of "." / "," in a value
// is treated as the decimal point; the other becomes the thousands separator.
export function detectNumberFormat(samples: Cell[]): {
  decimal: DecimalSeparator;
  thousands: ThousandsSeparator;
} {
  let commaDecimal = 0;
  let dotDecimal = 0;
  let spaceThousands = 0;
  let sawGrouping = false;

  for (const cell of samples) {
    if (typeof cell === "number" || cell instanceof Date) continue;
    const raw = cellToString(cell).replace(/[^\d.,'\s  ]/g, "");
    if (!raw) continue;

    if (/[\d][\s  ]\d{3}\b/.test(raw)) spaceThousands++;

    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");

    if (lastComma !== -1 && lastDot !== -1) {
      if (lastComma > lastDot) commaDecimal++;
      else dotDecimal++;
      sawGrouping = true;
    } else if (lastComma !== -1) {
      const after = raw.length - lastComma - 1;
      // "1,234" (exactly 3 trailing digits, no other comma) is most likely a
      // thousands group; otherwise the comma is a decimal point.
      const onlyOne = raw.indexOf(",") === lastComma;
      if (after === 3 && onlyOne) sawGrouping = true;
      else commaDecimal++;
    } else if (lastDot !== -1) {
      const after = raw.length - lastDot - 1;
      const onlyOne = raw.indexOf(".") === lastDot;
      if (after === 3 && onlyOne) sawGrouping = true;
      else dotDecimal++;
    }
  }

  let decimal: DecimalSeparator;
  if (commaDecimal > dotDecimal) decimal = ",";
  else if (dotDecimal > commaDecimal) decimal = ".";
  else decimal = spaceThousands > 0 ? "," : "."; // space-grouped tends to be FR

  let thousands: ThousandsSeparator = "none";
  if (spaceThousands > 0) thousands = " ";
  else if (sawGrouping) thousands = decimal === "," ? "." : ",";

  return { decimal, thousands };
}
