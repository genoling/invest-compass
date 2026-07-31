import type { Holding } from "@/lib/types/goal";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HoldingTableProps {
  holdings: Holding[];
}

export default function HoldingTable({ holdings }: HoldingTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        暂无持仓数据，请先添加持仓资产
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 font-medium">资产</th>
            <th className="pb-2 font-medium text-right">持仓数量</th>
            <th className="pb-2 font-medium text-right">成本价</th>
            <th className="pb-2 font-medium text-right">现价</th>
            <th className="pb-2 font-medium text-right">市值</th>
            <th className="pb-2 font-medium text-right">占比</th>
            <th className="pb-2 font-medium text-right">盈亏</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const isUp = h.pnl > 0;
            const isDown = h.pnl < 0;

            return (
              <tr
                key={h.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded bg-secondary flex items-center justify-center font-bold text-xs">
                      {h.assetSymbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{h.assetSymbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {h.assetName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 text-right number-font">
                  {h.quantity}
                </td>
                <td className="py-2.5 text-right number-font text-muted-foreground">
                  ${h.purchasePrice.toFixed(2)}
                </td>
                <td className="py-2.5 text-right number-font">
                  ${h.currentPrice.toFixed(2)}
                </td>
                <td className="py-2.5 text-right number-font">
                  ${h.currentValue.toLocaleString()}
                </td>
                <td className="py-2.5 text-right number-font">
                  {h.weight.toFixed(1)}%
                </td>
                <td
                  className={cn(
                    "py-2.5 text-right number-font",
                    isUp && "text-gain-DEFAULT",
                    isDown && "text-loss-DEFAULT"
                  )}
                >
                  <div className="flex items-center justify-end gap-1">
                    {isUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : isDown ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    <span>
                      {h.pnl > 0 ? "+" : ""}
                      {h.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs">
                    ({h.pnlPercent > 0 ? "+" : ""}
                    {h.pnlPercent.toFixed(2)}%)
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
