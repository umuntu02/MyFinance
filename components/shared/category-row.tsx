import type { Currency } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

type CategoryRowProps = {
  icon: string;          // lucide icon name
  name: string;
  recordCount: number;
  total: number;
  currency?: Currency;
  percentage?: number;   // share of total (0–100)
  iconBgClassName?: string;
  className?: string;
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
    </div>
  );
}
