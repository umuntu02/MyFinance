import * as XLSX from "xlsx";
import type { Cell } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// File parsing (CLIENT ONLY) — turns an uploaded XLSX/XLS/CSV into a raw 2D grid
// of native cells via SheetJS. The file is read entirely in the browser; nothing
// is uploaded or stored until the user confirms the import. `cellDates` keeps
// real Date objects for date cells so the engine can format them precisely.
// ─────────────────────────────────────────────────────────────────────────────

export async function readSpreadsheet(file: File): Promise<Cell[][]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const firstSheet = wb.SheetNames[0];
  const ws = firstSheet ? wb.Sheets[firstSheet] : undefined;
  if (!ws) return [];

  const grid = XLSX.utils.sheet_to_json<Cell[]>(ws, {
    header: 1,
    raw: true,
    blankrows: false,
    defval: null,
  });

  return grid.map((row) => (Array.isArray(row) ? row : []));
}
