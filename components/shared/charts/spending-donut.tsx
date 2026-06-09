"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import type { Currency } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/format";

export type DonutSlice = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: DonutSlice[];
  height?: number;
  currency?: Currency;
};

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full shrink-0"
          style={{ background: item.payload.color }}
        />
        <span className="font-semibold text-foreground">{item.name}</span>
      </p>
      <p className="text-muted-foreground mt-0.5">
        {formatCurrency(item.value as number)}
      </p>
    </div>
  );
}

export function SpendingDonut({ data, height = 260, currency = "USD" }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height }} className="animate-pulse rounded-xl bg-muted" />;
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="55%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="80%"
            dataKey="value"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={ChartTooltip} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="flex-1 space-y-2 min-w-0">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground truncate flex-1">{entry.name}</span>
            <span className="font-medium text-foreground shrink-0">
              {total > 0 ? formatPercent((entry.value / total) * 100, 0) : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
