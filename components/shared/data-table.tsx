import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type TableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /**
   * Cap the cell width and clip overflowing content with an ellipsis. Use for
   * free-text columns (descriptions, labels) where an imported value can be
   * hundreds of characters long with no breakable space — otherwise the cell
   * would widen the table past its container.
   */
  truncate?: boolean;
  /** Full text shown as a native tooltip when the cell is truncated. */
  title?: (row: T) => string;
};

type DataTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyText?: string;
  keyExtractor: (row: T) => string;
};

export function DataTable<T>({
  columns,
  data,
  onEdit,
  onDelete,
  emptyText = "No records found.",
  keyExtractor,
}: DataTableProps<T>) {
  const hasActions = Boolean(onEdit ?? onDelete);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  "text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3",
                  col.headerClassName
                )}
              >
                {col.header}
              </TableHead>
            ))}
            {hasActions && (
              <TableHead className="text-xs font-semibold tracking-wider uppercase text-muted-foreground py-3 text-right w-22.5">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                className="hover:bg-muted/30 transition-colors"
              >
                {columns.map((col) => (
                  <TableCell key={col.id} className={cn("py-3 text-sm", col.className)}>
                    {col.truncate ? (
                      <div
                        className="max-w-37.5 truncate sm:max-w-75 lg:max-w-md"
                        title={col.title?.(row)}
                      >
                        {col.cell(row)}
                      </div>
                    ) : (
                      col.cell(row)
                    )}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                          onClick={() => onEdit(row)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-expense"
                          onClick={() => onDelete(row)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
