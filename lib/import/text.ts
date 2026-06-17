import type { Cell } from "./types";

// Shared text helpers for the import engine.

// Lower-case, accent-stripped, whitespace-collapsed — used to match headers and
// keywords across languages without hard-coding per-bank strings.
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// A cell rendered as a trimmed display string (Date → ISO-ish, never "[object]").
export function cellToString(cell: Cell): string {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) {
    if (Number.isNaN(cell.getTime())) return "";
    const y = cell.getFullYear();
    const m = String(cell.getMonth() + 1).padStart(2, "0");
    const d = String(cell.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(cell).replace(/\s+/g, " ").trim();
}

export function isBlank(cell: Cell): boolean {
  return cellToString(cell) === "";
}
