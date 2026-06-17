// Generic bank-statement import engine — barrel export.
// One robust engine, driven entirely by a user-defined ImportMapping. No code
// path detects or special-cases any particular bank.

export type {
  Cell,
  SheetTable,
  PreviewRow,
  PreviewSummary,
  ImportIssue,
  ExistingEntry,
} from "./types";

export { readSpreadsheet } from "./parse-file";
export { detectHeaderRow, extractTable, buildHeaders } from "./header-detect";
export { suggestMapping, emptyMapping, reconcileMapping } from "./column-suggest";
export { detectDateFormat, parseDate } from "./date";
export { detectNumberFormat, parseAmount } from "./number";
export { buildPreview, summarize, DEFAULT_CATEGORY } from "./transform";
export { cellToString, normalize } from "./text";
