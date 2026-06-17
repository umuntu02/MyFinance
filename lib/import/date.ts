import type { DateFormatId } from "@/types";
import type { Cell } from "./types";
import { cellToString, normalize } from "./text";

// ─────────────────────────────────────────────────────────────────────────────
// Date parsing — format-driven, never bank-specific.
//
// Native Date cells (SheetJS cellDates) and Excel serial numbers are handled
// directly. Textual dates are parsed according to the chosen DateFormatId, which
// resolves the FR/US day-vs-month ambiguity. `detectDateFormat` only SUGGESTS a
// format from the sample values; the user confirms or overrides it.
// ─────────────────────────────────────────────────────────────────────────────

// A few month names (EN + FR) so "15 janv. 2025" / "Jan 15 2025" still parse.
const MONTHS: Record<string, number> = {
  jan: 1, january: 1, janv: 1, janvier: 1,
  feb: 2, february: 2, fev: 2, fevr: 2, fevrier: 2,
  mar: 3, march: 3, mars: 3,
  apr: 4, april: 4, avr: 4, avril: 4,
  may: 5, mai: 5,
  jun: 6, june: 6, juin: 6,
  jul: 7, july: 7, juil: 7, juillet: 7,
  aug: 8, august: 8, aout: 8,
  sep: 9, sept: 9, september: 9, septembre: 9,
  oct: 10, october: 10, octobre: 10,
  nov: 11, november: 11, novembre: 11,
  dec: 12, december: 12, decembre: 12,
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function iso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  if (y < 100) y = y < 70 ? 2000 + y : 1900 + y;
  if (y < 1900 || y > 2100) return null;
  // Reject impossible days (e.g. 31 Feb) by round-tripping through Date.
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

function fromDate(value: Date): string | null {
  if (Number.isNaN(value.getTime())) return null;
  return iso(value.getFullYear(), value.getMonth() + 1, value.getDate());
}

// Excel serial date → ISO. Epoch is 1899-12-30 (accounts for the 1900 leap bug).
function fromSerial(serial: number): string | null {
  if (!Number.isFinite(serial) || serial < 1 || serial > 2958465) return null;
  const ms = Math.round(serial) * 86400000 + Date.UTC(1899, 11, 30);
  const dt = new Date(ms);
  return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

// Split a textual date into its numeric components, resolving month names.
function tokens(value: string): { nums: number[]; monthName: number | null } {
  const cleaned = normalize(value);
  const parts = cleaned.split(/[^a-z0-9]+/).filter(Boolean);
  const nums: number[] = [];
  let monthName: number | null = null;
  for (const p of parts) {
    if (/^\d+$/.test(p)) {
      nums.push(Number(p));
    } else {
      const key = p.slice(0, 4);
      const m = MONTHS[p] ?? MONTHS[key] ?? MONTHS[p.slice(0, 3)];
      if (m) monthName = m;
    }
  }
  return { nums, monthName };
}

function order(format: DateFormatId, a: number, b: number, c: number): string | null {
  switch (format) {
    case "DMY":
      return iso(c, b, a);
    case "MDY":
      return iso(c, a, b);
    case "YMD":
      return iso(a, b, c);
    default:
      return null;
  }
}

// Best-effort when no explicit format is given.
function parseAuto(nums: number[]): string | null {
  const [a, b, c] = nums;
  if (String(a).length === 4) return iso(a, b, c); // YMD
  if (String(c).length === 4 || c > 31) {
    if (a > 12) return iso(c, b, a); // DMY
    if (b > 12) return iso(c, a, b); // MDY
    return iso(c, b, a); // ambiguous → day-first (European default)
  }
  return iso(c, b, a);
}

export function parseDate(cell: Cell, format: DateFormatId): string | null {
  if (cell === null || cell === undefined) return null;
  if (cell instanceof Date) return fromDate(cell);
  if (typeof cell === "number") return fromSerial(cell);

  const raw = cellToString(cell);
  if (!raw) return null;

  const { nums, monthName } = tokens(raw);

  // "15 janv 2025" style — a month name plus two numbers (day + year).
  if (monthName && nums.length >= 2) {
    const year = nums.find((n) => String(n).length === 4) ?? nums[1];
    const day = nums.find((n) => n !== year) ?? nums[0];
    return iso(year, monthName, day);
  }

  if (nums.length < 3) return null;
  const [a, b, c] = nums;
  if (format === "auto") return parseAuto(nums);
  return order(format, a, b, c);
}

// Suggest a format from sample values. Returns "auto" when every sample is a
// native Date/serial (the order is irrelevant) or when nothing is conclusive.
export function detectDateFormat(samples: Cell[]): DateFormatId {
  let textual = 0;
  let dmyVotes = 0;
  let mdyVotes = 0;
  let ymdVotes = 0;

  for (const cell of samples) {
    if (cell instanceof Date || typeof cell === "number") continue;
    const raw = cellToString(cell);
    if (!raw) continue;
    const { nums } = tokens(raw);
    if (nums.length < 3) continue;
    textual++;
    const [a, b] = nums;
    if (String(a).length === 4) {
      ymdVotes++;
    } else if (a > 12) {
      dmyVotes++; // first component can only be a day
    } else if (b > 12) {
      mdyVotes++; // second component can only be a day
    }
  }

  if (textual === 0) return "auto";
  if (ymdVotes >= dmyVotes && ymdVotes >= mdyVotes && ymdVotes > 0) return "YMD";
  if (mdyVotes > dmyVotes) return "MDY";
  return "DMY"; // European default when ambiguous
}
