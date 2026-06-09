import type { Currency } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;      // 0–100
  saved: number;
  target: number;
  currency?: Currency;
  className?: string;
};

export function ProgressBar({
  value,
  saved,
  target,
  currency = "USD",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const remaining = Math.max(0, target - saved);

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Track */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-gold transition-all duration-500"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-income font-medium">{formatPercent(clamped)} complete</span>
        <span className="text-expense font-medium">
          {formatCurrency(remaining, currency)} left
        </span>
      </div>
    </div>
  );
}
