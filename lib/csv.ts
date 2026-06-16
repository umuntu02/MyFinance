// ─────────────────────────────────────────────────────────────────────────────
// CSV helpers (client-side download)
//
// Shared by the topbar "Export" button and the Monthly Report page so the CSV
// formatting (escaping + UTF-8 BOM for Excel) lives in exactly one place. The
// data always comes from the Zustand cache, which is hydrated from the current
// user's Postgres rows — so an export is always scoped to the logged-in user.
// ─────────────────────────────────────────────────────────────────────────────

type Cell = string | number;

function escapeCell(value: Cell): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Cell[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\n");
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename: string, rows: Cell[][]): void {
  // Prepend a BOM so Excel reads UTF-8 (accents, currency symbols) correctly.
  const blob = new Blob(["\uFEFF" + toCsv(rows)], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, filename);
}

// "YYYY-MM-DD" for default export filenames.
export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
