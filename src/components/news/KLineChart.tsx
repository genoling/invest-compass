import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { generateMockKLineData } from "@/lib/mock/news";
import type { KLineData } from "@/lib/types/news";
import { cn } from "@/lib/utils";

type TimeDimension = "1min" | "5min" | "15min";

interface KLineChartProps {
  symbol: string;
  basePrice: number;
  className?: string;
}

export default function KLineChart({
  symbol,
  basePrice,
  className,
}: KLineChartProps) {
  const [dimension, setDimension] = useState<TimeDimension>("15min");

  const rawData = generateMockKLineData(basePrice);
  const data = dimension === "1min" ? rawData.slice(-20) : dimension === "5min" ? rawData.slice(-25) : rawData;

  const colorUp = "#ef4444";
  const colorDown = "#22c55e";

  return (
    <div className={cn("space-y-3", className)}>
      {/* 标题 + 维度切换 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {symbol} K线图
        </span>
        <div className="flex gap-1">
          {(["1min", "5min", "15min"] as TimeDimension[]).map((d) => (
            <button
              key={d}
              onClick={() => setDimension(d)}
              className={cn(
                "text-xs px-2 py-0.5 rounded border transition-colors",
                dimension === d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:border-primary/50"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 图表 */}
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v) => v.toFixed(0)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => {
              const label =
                name === "close"
                  ? "收盘"
                  : name === "high"
                  ? "最高"
                  : name === "low"
                  ? "最低"
                  : name === "open"
                  ? "开盘"
                  : "成交量";
              return [`$${value.toFixed(2)}`, label];
            }}
          />

          {/* 成交量柱状图 */}
          <Bar
            dataKey="volume"
            fill="hsl(var(--muted-foreground))"
            opacity={0.2}
            yAxisId="volume"
          />

          {/* 收盘价折线 */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />

          {/* 实体柱（伪K线） */}
          <Bar
            dataKey="close"
            fill="transparent"
            shape={(props: any) => {
              const { x, y, width, payload } = props;
              if (!payload) return null;

              const barWidth = width * 0.6;
              const barX = x + width * 0.2;
              const isUp = payload.close >= payload.open;
              const color = isUp ? colorUp : colorDown;

              // 影线
              const highY =
                ((payload.high - payload.low) /
                  (payload.high - payload.low || 1)) *
                0;
              const scale = 100 / (payload.high - payload.low || 1);

              return (
                <g>
                  {/* 影线 */}
                  <line
                    x1={barX + barWidth / 2}
                    y1={y}
                    x2={barX + barWidth / 2}
                    y2={y + 30}
                    stroke={color}
                    strokeWidth={1}
                  />
                  {/* 实体 */}
                  <rect
                    x={barX}
                    y={Math.min(y + 5, y + 25)}
                    width={barWidth}
                    height={Math.abs(20)}
                    fill={color}
                    rx={1}
                  />
                </g>
              );
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 图例 */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-gain-DEFAULT" /> 上涨
        </span>
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-loss-DEFAULT" /> 下跌
        </span>
      </div>
    </div>
  );
}
