import { cn } from "@/lib/utils";
import type { Trade } from "@/lib/types/trading";
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">成交记录</h3>
        </div>
        <div className="text-center py-6 text-xs text-muted-foreground">
          暂无成交记录
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">成交记录</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">
          共 {trades.length} 笔
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card border-b">
            <tr className="text-muted-foreground">
              <th className="text-left py-2 px-3 font-normal">时间</th>
              <th className="text-left py-2 px-3 font-normal">股票</th>
              <th className="text-center py-2 px-3 font-normal">方向</th>
              <th className="text-right py-2 px-3 font-normal">价格</th>
              <th className="text-right py-2 px-3 font-normal">数量</th>
              <th className="text-right py-2 px-3 font-normal">金额</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice().reverse().map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-secondary/30">
                <td className="py-2 px-3 text-muted-foreground">
                  {new Date(t.time).toLocaleTimeString()}
                </td>
                <td className="py-2 px-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground number-font">{t.code}</div>
                </td>
                <td className="py-2 px-3 text-center">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
                    t.side === "buy" ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                  )}>
                    {t.side === "buy" ? (
                      <ArrowUpCircle className="h-3 w-3" />
                    ) : (
                      <ArrowDownCircle className="h-3 w-3" />
                    )}
                    {t.side === "buy" ? "买入" : "卖出"}
                  </span>
                </td>
                <td className="py-2 px-3 text-right number-font">¥{t.price.toFixed(2)}</td>
                <td className="py-2 px-3 text-right number-font">{t.quantity}</td>
                <td className={cn(
                  "py-2 px-3 text-right number-font font-medium",
                  t.side === "buy" ? "text-gain" : "text-loss"
                )}>
                  ¥{t.amount.toLocaleString("zh-CN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
