import { useState } from "react";
import { mockAIAnalyses } from "@/lib/mock/ai";
import type { AIAnalysisResult } from "@/lib/types/ai";
import {
  Brain,
  TrendingUp,
  Target,
  Shield,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  Clock,
  Settings,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const riskColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const riskLabels = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
};

export default function AIAdvisorPage() {
  const [analyses] = useState<AIAnalysisResult[]>(mockAIAnalyses);
  const [selectedId, setSelectedId] = useState<string>(analyses[0]?.id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  // 分析参数
  const [focusDimension, setFocusDimension] = useState("all");
  const [detailLevel, setDetailLevel] = useState("full");
  const [showParams, setShowParams] = useState(false);

  const current = analyses.find((a) => a.id === selectedId);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const handleCopy = () => {
    if (!current) return;
    const text = `【AI分析结论】\n${current.summary}\n\n【操作建议】\n${current.suggestions.map((s) => `- ${s.action === "buy" ? "买入" : s.action === "sell" ? "卖出" : "持有"} ${s.symbol}: ${s.reason}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            AI 辅助决策
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            基于投资理念的智能分析与操作建议
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            isAnalyzing
              ? "bg-muted text-muted-foreground cursor-wait"
              : "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          <Brain
            className={cn(
              "h-4 w-4",
              isAnalyzing && "animate-pulse"
            )}
          />
          {isAnalyzing ? "分析中..." : "发起分析"}
        </button>
      </div>

      {/* 分析参数面板 */}
      {showParams && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" />
            分析参数设置
          </div>
          <div className="flex flex-wrap gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1.5">重点分析维度</div>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { v: "all", l: "综合分析" },
                  { v: "technical", l: "技术面" },
                  { v: "fundamental", l: "基本面" },
                  { v: "marketSentiment", l: "市场情绪" },
                ].map((d) => (
                  <button
                    key={d.v}
                    onClick={() => setFocusDimension(d.v)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-colors",
                      focusDimension === d.v
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden sm:block w-px bg-border self-stretch" />
            <div>
              <div className="text-xs text-muted-foreground mb-1.5">输出详细程度</div>
              <div className="flex gap-1.5">
                {[
                  { v: "summary", l: "仅结论" },
                  { v: "full", l: "完整分析" },
                ].map((d) => (
                  <button
                    key={d.v}
                    onClick={() => setDetailLevel(d.v)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-colors",
                      detailLevel === d.v
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分析参数开关 */}
      <button
        onClick={() => setShowParams(!showParams)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Settings className="h-3.5 w-3.5" />
        {showParams ? "收起参数" : "调整分析参数"}
      </button>

      {/* 历史分析列表 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {analyses.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedId(a.id)}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              a.id === selectedId
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleString("zh-CN")}
              </span>
            </div>
            <div className="mt-1 font-medium text-xs line-clamp-1">
              {a.summary.slice(0, 25)}...
            </div>
          </button>
        ))}
      </div>

      {current ? (
        <div className="space-y-5">
          {/* 结论摘要 */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">核心结论</h2>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium ml-auto",
                  riskColors[current.riskLevel]
                )}
              >
                {riskLabels[current.riskLevel]}
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              {current.summary}
            </p>
            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-green-500">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>复制分析结果</span>
                </>
              )}
            </button>
          </div>

          {/* 分析维度（仅完整分析模式显示） */}
          {detailLevel === "full" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <AnalysisBlock
              icon={TrendingUp}
              title="市场情绪分析"
              content={current.details.marketSentiment}
            />
            <AnalysisBlock
              icon={Target}
              title="技术面分析"
              content={current.details.technicalAnalysis}
            />
            <AnalysisBlock
              icon={Brain}
              title="基本面分析"
              content={current.details.fundamentalAnalysis}
            />
            <AnalysisBlock
              icon={Shield}
              title="风险分析"
              content={current.details.riskAnalysis}
            />
          </div>
          )}

          {/* 操作建议 */}
          <div>
            <h3 className="font-semibold text-sm mb-3">
              操作建议
            </h3>
            <div className="space-y-2">
              {current.suggestions.map((s, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border bg-card p-3"
                >
                  {s.action === "buy" ? (
                    <ArrowUpCircle className="h-5 w-5 text-gain-DEFAULT shrink-0 mt-0.5" />
                  ) : s.action === "sell" ? (
                    <ArrowDownCircle className="h-5 w-5 text-loss-DEFAULT shrink-0 mt-0.5" />
                  ) : (
                    <MinusCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          s.action === "buy"
                            ? "bg-gain-light/50 text-gain-DEFAULT"
                            : s.action === "sell"
                            ? "bg-loss-light/50 text-loss-DEFAULT"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.action === "buy"
                          ? "买入"
                          : s.action === "sell"
                          ? "卖出"
                          : "持有"}
                      </span>
                      <span className="font-semibold text-sm">
                        {s.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        价格区间 {s.priceRange}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.reason}
                    </p>
                    {s.quantity && (
                      <span className="text-xs text-muted-foreground mt-1 block">
                        建议数量：{s.quantity} 股
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-1">
            暂无分析记录
          </h3>
          <p className="text-sm text-muted-foreground">
            点击"发起分析"按钮，基于当前行情获取AI投资建议
          </p>
        </div>
      )}

      {/* 免责声明 */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          AI分析结果仅供参考，不构成投资建议。投资有风险，决策需谨慎。
        </span>
      </div>
    </div>
  );
}

function AnalysisBlock({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">{title}</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {content}
      </p>
    </div>
  );
}
