"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  type TooltipContentProps,
} from "recharts";
import type { Currency } from "@/types";
import { formatCurrency } from "@/lib/format";

export type SavingsBarDatum = {
  month: string;
  netSavings: number;
};

type Props = {
  data: SavingsBarDatum[];
  height?: number;
  currency?: Currency;
};

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className={value >= 0 ? "text-income font-medium" : "text-expense font-medium"}>
        Net savings: {formatCurrency(value)}
      </p>
    </div>
  );
}

export function SavingsBarChart({ data, height = 260, currency = "USD" }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height }} className="animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={28}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={ChartTooltip} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
        <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
        <Bar
          dataKey="netSavings"
          name="Net Savings"
          fill="var(--sidebar)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
