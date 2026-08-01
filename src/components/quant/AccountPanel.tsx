import { cn } from "@/lib/utils";
import type { SimAccount, Position } from "@/lib/types/trading";
import { Wallet, TrendingUp, DollarSign } from "lucide-react";

interface AccountPanelProps {
  account: SimAccount;
  positions: Position[];
}

export default function AccountPanel({ account, positions }: AccountPanelProps) {
  const pnlPositive = account.totalPnl >= 0;

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          模拟账户
        </div>
      </div>

      {/* 总资产 */}
      <div className="px-4 py-3 border-b bg-secondary/20">
        <div className="text-xs text-muted-foreground mb-1">总资产</div>
        <div className="text-2xl font-bold number-font">
          ¥{account.totalAssets.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
        </div>
        <div className={cn("text-xs mt-1 number-font", pnlPositive ? "text-gain" : "text-loss")}>
          {pnlPositive ? "+" : ""}{account.totalPnl.toFixed(2)} ({pnlPositive ? "+" : ""}{account.totalPnlPct.toFixed(2)}%)
        </div>
      </div>

      {/* 资金明细 */}
      <div className="grid grid-cols-3 gap-0 divide-x">
        <div className="p-3 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">可用资金</div>
          <div className="text-sm font-semibold number-font text-green-600">
            ¥{account.availableCash.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">持仓市值</div>
          <div className="text-sm font-semibold number-font">
            ¥{account.positionValue.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="p-3 text-center">
          <div className="text-xs text-muted-foreground mb-0.5">累计盈亏</div>
          <div className={cn("text-sm font-semibold number-font", pnlPositive ? "text-gain" : "text-loss")}>
            {pnlPositive ? "+" : ""}{account.totalPnl.toFixed(0)}
          </div>
        </div>
      </div>

      {/* 持仓列表 */}
      {positions.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 mt-1">
            <TrendingUp className="h-3 w-3" />
            持仓（{positions.length}）
          </div>
          {positions.map((pos) => (
            <div key={pos.code} className="flex items-center justify-between py-2 border-t text-xs">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{pos.name}</div>
                <div className="text-muted-foreground number-font">{pos.code}</div>
              </div>
              <div className="text-right ml-3">
                <div className="number-font font-medium">{pos.quantity} 股</div>
                <div className="text-muted-foreground number-font">
                  ¥{pos.currentPrice.toFixed(2)}
                </div>
              </div>
              <div className={cn("text-right ml-3 min-w-[70px] number-font", pos.pnl >= 0 ? "text-gain" : "text-loss")}>
                <div>{pos.pnl >= 0 ? "+" : ""}{pos.pnl.toFixed(0)}</div>
                <div className="text-[10px]">{pos.pnlPct >= 0 ? "+" : ""}{pos.pnlPct.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {positions.length === 0 && (
        <div className="px-4 py-6 text-center text-xs text-muted-foreground">
          暂无持仓，开始交易吧
        </div>
      )}
    </div>
  );
}
