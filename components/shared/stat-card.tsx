import type { ElementType } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "positive" | "negative" | "neutral";

// A stat-card badge: short text, a colour variant, and an optional leading icon
// (e.g. an up/down arrow for a month-over-month variation).
export type StatCardBadge = {
  text: string;
  variant?: BadgeVariant;
  icon?: ElementType;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: ElementType;
  iconClassName?: string;
  badge?: StatCardBadge;
  className?: string;
};

const BADGE_STYLES: Record<BadgeVariant, string> = {
  positive: "bg-income/10 text-income",
  negative: "bg-expense/10 text-expense",
  neutral:  "bg-muted text-muted-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  badge,
  className,
}: StatCardProps) {
  const badgeVariant = badge?.variant ?? "neutral";

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5 shadow-sm border border-border flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground font-medium leading-snug">
          {label}
        </p>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted",
            iconClassName
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-foreground leading-none tracking-tight">
          {value}
        </p>
        {badge && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
              BADGE_STYLES[badgeVariant]
            )}
          >
            {badge.icon && <badge.icon className="h-3 w-3" />}
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}
