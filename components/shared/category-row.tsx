import { Trash2 } from "lucide-react";
import type { Currency } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CategoryRowProps = {
  icon: string;          // lucide icon name
  name: string;
  recordCount: number;
  total: number;
  currency?: Currency;
  percentage?: number;   // share of total (0–100)
  iconBgClassName?: string;
  className?: string;
  onDelete?: () => void; // when set, renders a delete button (category management)
  deleteLabel?: string;
};

export function CategoryRow({
  icon,
  name,
  recordCount,
  total,
  currency = "USD",
  percentage,
  iconBgClassName,
  className,
  onDelete,
  deleteLabel = "Delete",
}: CategoryRowProps) {
  const Icon = getIcon(icon);

  return (
    <div className={cn("flex items-center gap-3 py-2.5", className)}>
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
          iconBgClassName
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Name + count */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground leading-none truncate">
          {name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {recordCount} {recordCount === 1 ? "record" : "records"}
        </p>
      </div>

      {/* Amount + percentage */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-foreground">
          {formatCurrency(total, currency)}
        </p>
        {percentage !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatPercent(percentage)}
          </p>
        )}
      </div>

      {/* Delete (category management only) */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 cursor-pointer text-muted-foreground hover:text-expense"
          onClick={onDelete}
          aria-label={deleteLabel}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
