import { useState } from "react";
import {
  mockGoals,
  mockHoldings,
  mockProgress,
} from "@/lib/mock/goal";
import type { InvestmentGoal } from "@/lib/types/goal";
import GoalCard from "@/components/goals/GoalCard";
import GoalDetail from "@/components/goals/GoalDetail";
import GoalForm from "@/components/goals/GoalForm";
import { Plus } from "lucide-react";
import { defaultAllocations } from "@/lib/types/goal";

export default function GoalsPage() {
  const [goals, setGoals] = useState(mockGoals);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleCreateGoal = (data: {
    name: string;
    description: string;
    targetAmount: number;
    initialAmount: number;
    riskTolerance: string;
    period: string;
  }) => {
    const allocations =
      defaultAllocations[
        data.riskTolerance as keyof typeof defaultAllocations
      ] || defaultAllocations.moderate;

    const newGoal: InvestmentGoal = {
      id: `goal-${Date.now()}`,
      name: data.name,
      description: data.description,
      targetAmount: data.targetAmount,
      initialAmount: data.initialAmount,
      currentAmount: data.initialAmount,
      riskTolerance: data.riskTolerance as InvestmentGoal["riskTolerance"],
      period: data.period as InvestmentGoal["period"],
      startDate: new Date().toISOString(),
      endDate: new Date(
        Date.now() +
          (data.period === "short"
            ? 365
            : data.period === "medium"
            ? 365 * 3
            : 365 * 5) *
            86400000
      ).toISOString(),
      targetAllocations: allocations,
      currentAllocations: allocations,
      rebalanceThreshold: 5,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    setShowForm(false);
  };

  const activeGoal = selectedGoal
    ? goals.find((g) => g.id === selectedGoal)
    : null;
  const activeProgress = selectedGoal
    ? mockProgress[selectedGoal]
    : null;
  const activeHoldings = selectedGoal
    ? mockHoldings[selectedGoal] || []
    : [];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            投资目标
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            短/中/长期投资目标管理与进度追踪
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          新建目标
        </button>
      </div>

      {/* 目标列表 */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {goals.map((goal) => {
          const progress = mockProgress[goal.id] || {
            id: "temp",
            goalId: goal.id,
            totalCurrentValue: goal.currentAmount,
            progressPercentage:
              (goal.currentAmount /
                Math.max(goal.targetAmount, 1)) *
              100,
            totalPnl: 0,
            totalPnlPercent: 0,
            allocationDrifts: {},
            rebalanceActions: [],
            lastUpdated: new Date().toISOString(),
          };
          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              progress={progress}
              onClick={() =>
                setSelectedGoal(
                  selectedGoal === goal.id ? null : goal.id
                )
              }
            />
          );
        })}
      </div>

      {/* 空状态 */}
      {goals.length === 0 && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold mb-1">
            还没有投资目标
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            创建你的第一个投资目标，开始资产配置管理之旅
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            新建目标
          </button>
        </div>
      )}

      {/* 目标详情弹窗 */}
      {activeGoal && activeProgress && (
        <GoalDetail
          goal={activeGoal}
          progress={activeProgress}
          holdings={activeHoldings}
          onClose={() => setSelectedGoal(null)}
        />
      )}

      {/* 新建目标弹窗 */}
      {showForm && (
        <GoalForm
          onSubmit={handleCreateGoal}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
