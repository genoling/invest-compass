import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import type { EquityPoint } from "@/lib/types/trading";

interface EquityCurveProps {
  data: EquityPoint[];
  initialCapital: number;
  className?: string;
}

export default function EquityCurve({ data, initialCapital, className }: EquityCurveProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-48 text-sm text-muted-foreground", className)}>
        暂无权益数据
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: point.date.slice(5), // MM-DD
    value: point.value,
  }));

  const currentValue = data[data.length - 1]?.value || initialCapital;
  const isPositive = currentValue >= initialCapital;

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">权益曲线</h3>
        <div className={cn("text-sm font-semibold number-font", isPositive ? "text-gain" : "text-loss")}>
          ¥{currentValue.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#ef4444" : "#22c55e"} stopOpacity={0.2} />
              <stop offset="95%" stopColor={isPositive ? "#ef4444" : "#22c55e"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`¥${value.toLocaleString("zh-CN")}`, "权益"]}
          />
          <ReferenceLine y={initialCapital} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "#ef4444" : "#22c55e"}
            fill="url(#equityGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-[10px] text-muted-foreground text-center mt-1">
        虚线 = 初始资金 ¥{initialCapital.toLocaleString("zh-CN")}
      </div>
    </div>
  );
}
