import type { InvestmentGoal, GoalProgress } from "@/lib/types/goal";
import {
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { periodOptions, riskOptions } from "@/lib/types/goal";

interface GoalCardProps {
  goal: InvestmentGoal;
  progress: GoalProgress;
  onClick?: () => void;
}

export default function GoalCard({
  goal,
  progress,
  onClick,
}: GoalCardProps) {
  const period = periodOptions.find((p) => p.value === goal.period);
  const risk = riskOptions.find((r) => r.value === goal.riskTolerance);
  const driftedClasses = Object.keys(goal.targetAllocations).filter(
    (k) => {
      const drift =
        (goal.currentAllocations[k] || 0) -
        (goal.targetAllocations[k] || 0);
      return Math.abs(drift) > goal.rebalanceThreshold;
    }
  );

  return (
    <div
      className="rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={onClick}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{goal.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {goal.description}
          </p>
        </div>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            goal.status === "active"
              ? "bg-gain-light/50 text-gain-DEFAULT"
              : goal.status === "completed"
              ? "bg-blue-100 text-blue-600"
              : "bg-muted text-muted-foreground"
          )}
        >
          {goal.status === "active"
            ? "进行中"
            : goal.status === "completed"
            ? "已完成"
            : "已暂停"}
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">目标完成度</span>
          <span className="font-bold number-font">
            {progress.progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min(progress.progressPercentage, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">目标</span>
          <span className="font-medium number-font">
            ¥{formatNum(goal.targetAmount)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">当前</span>
          <span className="font-medium number-font">
            ¥{formatNum(goal.currentAmount)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{period?.label}</span>
          <span className="text-muted-foreground">{period?.desc}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{risk?.label}</span>
        </div>
      </div>

      {/* 再平衡提示 */}
      {driftedClasses.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs p-2 rounded bg-amber-50 border border-amber-200 text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          资产配置偏离阈值，{driftedClasses.length} 类资产需要再平衡
        </div>
      )}
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}
