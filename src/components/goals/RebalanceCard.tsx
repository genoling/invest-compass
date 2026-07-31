import type { RebalanceAction } from "@/lib/types/goal";
import { ArrowUpCircle, ArrowDownCircle, Info } from "lucide-react";

interface RebalanceCardProps {
  actions: RebalanceAction[];
}

export default function RebalanceCard({ actions }: RebalanceCardProps) {
  if (actions.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground">
        <Info className="h-4 w-4 mx-auto mb-1" />
        当前资产配置在安全区间内，无需再平衡
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actions.map((action, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card p-3 flex items-start gap-3"
        >
          {action.action === "buy" ? (
            <ArrowUpCircle className="h-5 w-5 text-gain-DEFAULT shrink-0 mt-0.5" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 text-loss-DEFAULT shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  action.action === "buy"
                    ? "bg-gain-light/50 text-gain-DEFAULT"
                    : "bg-loss-light/50 text-loss-DEFAULT"
                }`}
              >
                {action.action === "buy" ? "建议买入" : "建议卖出"}
              </span>
              <span className="font-semibold">
                {action.symbol} {action.assetName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {action.reason}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
              <span className="text-muted-foreground">
                当前占比{" "}
                <span className="font-medium text-foreground number-font">
                  {action.currentWeight}%
                </span>
              </span>
              <span className="text-muted-foreground">
                目标占比{" "}
                <span className="font-medium text-foreground number-font">
                  {action.targetWeight}%
                </span>
              </span>
              <span className="text-muted-foreground">
                建议操作{" "}
                <span className="font-medium text-foreground number-font">
                  {action.quantity} 股 (≈$
                  {action.amount.toLocaleString()})
                </span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
