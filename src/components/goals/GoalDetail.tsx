import { useState } from "react";
import type { InvestmentGoal, GoalProgress, Holding } from "@/lib/types/goal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { periodOptions, riskOptions } from "@/lib/types/goal";
import { cn } from "@/lib/utils";
import {
  X,
  Clock,
  Plus,
  Minus,
  ArrowRight,
} from "lucide-react";
import HoldingTable from "./HoldingTable";
import RebalanceCard from "./RebalanceCard";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#6b7280", "#ef4444"];

type TabType = "overview" | "holdings" | "history";

interface GoalDetailProps {
  goal: InvestmentGoal;
  progress: GoalProgress;
  holdings: Holding[];
  onClose: () => void;
}

/** Mock 操作历史记录 */
const mockHistory = [
  {
    id: "h1",
    type: "rebalance",
    action: "再平衡操作",
    desc: "根据系统建议卖出17股NVDA，买入20股AAPL",
    date: "2026-07-20T14:30:00Z",
    beforeVal: 148000,
    afterVal: 150250,
  },
  {
    id: "h2",
    type: "deposit",
    action: "追加资金",
    desc: "追加定投资金 ¥20,000",
    date: "2026-07-01T09:00:00Z",
    beforeVal: 130000,
    afterVal: 150000,
  },
  {
    id: "h3",
    type: "adjust",
    action: "调整目标配置",
    desc: "将加密货币配置比例从15%调整为10%，增加股票和债券比例",
    date: "2026-06-15T10:00:00Z",
    beforeVal: 125000,
    afterVal: 130000,
  },
  {
    id: "h4",
    type: "create",
    action: "创建目标",
    desc: "创建「长期价值投资-科技行业」目标，初始投入 ¥100,000",
    date: "2026-01-01T08:00:00Z",
    beforeVal: 0,
    afterVal: 100000,
  },
];

export default function GoalDetail({
  goal,
  progress,
  holdings,
  onClose,
}: GoalDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const period = periodOptions.find((p) => p.value === goal.period);
  const risk = riskOptions.find((r) => r.value === goal.riskTolerance);

  const pieData = Object.entries(goal.currentAllocations)
    .filter(([, v]) => v > 0)
    .map(([key, value], i) => ({
      name: key,
      value,
      color: COLORS[i % COLORS.length],
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-10 px-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1 hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-5">
          {/* 标题 + 状态 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  goal.status === "active"
                    ? "bg-gain-light/50 text-gain-DEFAULT"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {goal.status === "active" ? "进行中" : goal.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {period?.label} · {risk?.label}
              </span>
            </div>
            <h2 className="text-xl font-bold">{goal.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {goal.description}
            </p>
          </div>

          {/* 概览数据 */}
          <div className="grid gap-3 grid-cols-3 text-center">
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">目标金额</div>
              <div className="text-base font-bold number-font mt-0.5">
                ¥{(goal.targetAmount / 10000).toFixed(0)}万
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">当前市值</div>
              <div className="text-base font-bold number-font mt-0.5">
                ¥{(goal.currentAmount / 10000).toFixed(1)}万
              </div>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="text-xs text-muted-foreground">盈亏</div>
              <div
                className={cn(
                  "text-base font-bold number-font mt-0.5",
                  progress.totalPnl > 0 ? "text-gain-DEFAULT" : "text-loss-DEFAULT"
                )}
              >
                {progress.totalPnl > 0 ? "+" : ""}
                {progress.totalPnl.toFixed(0)}
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">完成度</span>
              <span className="font-bold number-font">
                {progress.progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(progress.progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Tab 切换 */}
          <div className="flex gap-1 border-b">
            {([
              ["overview", "概览"],
              ["holdings", "持仓明细"],
              ["history", "历史记录"],
            ] as [TabType, string][]).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab 内容 */}
          {activeTab === "overview" && (
            <div className="grid gap-5 lg:grid-cols-2">
              {/* 资产配置 */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold text-sm mb-3">资产配置</h3>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-24">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={22}
                          outerRadius={42}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 text-xs">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground capitalize">{item.name}</span>
                        <span className="font-medium number-font">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 配置详情 */}
              <div>
                <h3 className="font-semibold text-sm mb-3">再平衡建议</h3>
                <RebalanceCard actions={progress.rebalanceActions} />
              </div>
            </div>
          )}

          {activeTab === "holdings" && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <HoldingTable holdings={holdings} />
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {mockHistory.map((h) => {
                const typeIcon = {
                  rebalance: "🔄",
                  deposit: "💵",
                  adjust: "⚙️",
                  create: "🎯",
                };
                return (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 rounded-lg border bg-card p-3"
                  >
                    <span className="text-lg shrink-0">
                      {typeIcon[h.type as keyof typeof typeIcon]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {h.action}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(h.date).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {h.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs number-font">
                        <span className="text-muted-foreground">
                          ¥{formatNum(h.beforeVal)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          ¥{formatNum(h.afterVal)}
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            h.afterVal > h.beforeVal
                              ? "text-gain-DEFAULT"
                              : "text-loss-DEFAULT"
                          )}
                        >
                          {h.afterVal > h.beforeVal ? "+" : ""}
                          {formatNum(h.afterVal - h.beforeVal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}
