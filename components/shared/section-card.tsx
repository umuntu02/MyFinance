import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
  className?: string;
  headerExtra?: ReactNode;
};

export function SectionCard({
  title,
  viewAllHref,
  viewAllLabel = "View all",
  children,
  className,
  headerExtra,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-border shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <div className="flex items-center gap-3">
          {headerExtra}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {viewAllLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
