"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipContentProps,
} from "recharts";
import type { Currency } from "@/types";
import { formatCurrency } from "@/lib/format";

export type PieSlice = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  data: PieSlice[];
  height?: number;
  currency?: Currency;
};

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <span
          className="inline-block h-2 w-2 rounded-full shrink-0"
          style={{ background: item.payload.color }}
        />
        {item.name}
      </p>
      <p className="text-muted-foreground mt-0.5">
        {formatCurrency(item.value as number)}
      </p>
    </div>
  );
}

export function ExpenseDistributionPie({ data, height = 280, currency = "USD" }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height }} className="animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="48%"
          outerRadius="70%"
          dataKey="value"
          paddingAngle={1}
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={ChartTooltip} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{ fontSize: 11, lineHeight: "1.6" }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
