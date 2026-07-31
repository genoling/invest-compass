import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Target,
  Brain,
  Newspaper,
  ArrowRight,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import AssetAllocationChart from "@/components/dashboard/AssetAllocationChart";
import { mockGoals, mockProgress } from "@/lib/mock/goal";
import { mockAIAnalyses } from "@/lib/mock/ai";
import { mockNews } from "@/lib/mock/news";
import { mockKnowledge, mockProgressList } from "@/lib/mock/knowledge";

export default function DashboardPage() {
  // 汇总所有目标数据
  const totalValue = mockGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalPnl = Object.values(mockProgress).reduce(
    (s, p) => s + p.totalPnl,
    0
  );
  const mainGoal = mockGoals[0];
  const mainProgress = mockProgress[mainGoal?.id];
  const progressPercent = mainProgress?.progressPercentage || 0;

  // 最新 AI 建议
  const latestAnalysis = mockAIAnalyses[0];
  const suggestionCount =
    latestAnalysis?.suggestions.filter((s) => s.action !== "hold").length ||
    0;

  // 再平衡预警
  const rebalanceCount = Object.values(mockProgress).reduce(
    (s, p) => s + p.rebalanceActions.length,
    0
  );

  // 学习进度
  const completed = mockProgressList.filter(
    (p) => p.status === "completed"
  ).length;
  const totalKnowledge = mockKnowledge.length;

  // 最新资讯
  const latestNews = mockNews.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          资产大盘
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          投资组合全景概览
        </p>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总资产"
          value={`¥${formatNum(totalValue)}`}
          change={totalPnl > 0 ? `+${formatNum(totalPnl)}` : formatNum(totalPnl)}
          icon={LayoutDashboard}
          trend={totalPnl > 0 ? "up" : totalPnl < 0 ? "down" : "neutral"}
        />
        <StatCard
          title="目标完成度"
          value={`${progressPercent.toFixed(1)}%`}
          change={`距离目标 ¥${formatNum((mainGoal?.targetAmount || 0) - totalValue)}`}
          icon={Target}
          trend="neutral"
        />
        <StatCard
          title="AI 建议"
          value={`${suggestionCount} 条`}
          change={suggestionCount > 0 ? "待执行操作" : "无需操作"}
          icon={Brain}
          trend={suggestionCount > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="学习进度"
          value={`${completed}/${totalKnowledge}`}
          change={`${Math.round((completed / totalKnowledge) * 100)}% 完成`}
          icon={BookOpen}
          trend="neutral"
        />
      </div>

      {/* 资产配置 + 快捷入口 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AssetAllocationChart
          data={
            mainGoal
              ? Object.entries(mainGoal.currentAllocations).map(
                  ([k, v]) => ({ name: k, value: v })
                )
              : undefined
          }
        />

        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            快捷操作
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              to="/goals"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary/50 transition-colors group"
            >
              <Target className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">投资目标</div>
                <div className="text-xs text-muted-foreground">
                  {mockGoals.length} 个进行中
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/news"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary/50 transition-colors group"
            >
              <Newspaper className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">实时资讯</div>
                <div className="text-xs text-muted-foreground">
                  {mockNews.length} 条最新
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/ai-advisor"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary/50 transition-colors group"
            >
              <Brain className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">AI 决策</div>
                <div className="text-xs text-muted-foreground">
                  {mockAIAnalyses.length} 次分析
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/learn"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary/50 transition-colors group"
            >
              <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">知识学习</div>
                <div className="text-xs text-muted-foreground">
                  {completed}/{totalKnowledge} 完成
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>

          {/* 再平衡预警 */}
          {rebalanceCount > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-amber-700">
                  再平衡提醒
                </span>
                <p className="text-amber-600 mt-0.5">
                  有 {rebalanceCount} 条再平衡建议待处理，前往投资目标查看详情。
                </p>
              </div>
              <Link
                to="/goals"
                className="shrink-0 text-xs text-amber-700 font-medium hover:underline"
              >
                查看
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 最新资讯摘要 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            最新资讯
          </h3>
          <Link
            to="/news"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            查看全部
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-1 lg:grid-cols-3">
          {latestNews.map((n) => (
            <Link
              key={n.id}
              to="/news"
              className="rounded-lg border bg-card p-3 hover:shadow-sm hover:border-primary/30 transition-all"
            >
              <h4 className="text-sm font-medium line-clamp-2">
                {n.headline}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {n.summary}
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(n.publishedAt).toLocaleString("zh-CN")}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatNum(n: number): string {
  if (Math.abs(n) >= 10000)
    return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}
