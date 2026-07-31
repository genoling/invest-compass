import { useState, useMemo } from "react";
import {
  mockKnowledge,
  mockProgressList,
} from "@/lib/mock/knowledge";
import type {
  KnowledgeItem,
  KnowledgeCategory,
  LearningProgress,
} from "@/lib/types/knowledge";
import {
  BookOpen,
  Search,
  Clock,
  BarChart3,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryOptions: {
  value: KnowledgeCategory;
  label: string;
  icon: string;
}[] = [
  {
    value: "investment_philosophy",
    label: "投资理念",
    icon: "💡",
  },
  { value: "basic_terms", label: "基础术语", icon: "📖" },
  {
    value: "technical_analysis",
    label: "技术分析",
    icon: "📊",
  },
  {
    value: "fundamental_analysis",
    label: "基本面分析",
    icon: "🔍",
  },
  { value: "risk_control", label: "风险控制", icon: "🛡️" },
  { value: "strategy_cases", label: "策略案例", icon: "📋" },
];

const difficultyOptions = [
  { value: "all", label: "全部" },
  { value: "beginner", label: "初级" },
  { value: "intermediate", label: "中级" },
  { value: "advanced", label: "高级" },
] as const;

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    KnowledgeCategory | "all"
  >("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    string
  >("all");
  const [keyword, setKeyword] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<KnowledgeItem | null>(null);

  const filteredItems = useMemo(() => {
    let result = mockKnowledge;
    if (selectedCategory !== "all") {
      result = result.filter(
        (k) => k.category === selectedCategory
      );
    }
    if (selectedDifficulty !== "all") {
      result = result.filter(
        (k) => k.difficulty === selectedDifficulty
      );
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (k) =>
          k.title.toLowerCase().includes(kw) ||
          k.summary.toLowerCase().includes(kw) ||
          k.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }
    return result;
  }, [selectedCategory, selectedDifficulty, keyword]);

  // 计算学习进度
  const totalItems = mockKnowledge.length;
  const completedItems = mockProgressList.filter(
    (p) => p.status === "completed"
  ).length;
  const progressPercent =
    totalItems > 0
      ? Math.round((completedItems / totalItems) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* 页面标题 + 进度 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            知识学习
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            投资理念、技术分析、风险控制知识体系
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3 bg-card rounded-lg border px-4 py-3">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">
              学习进度
            </div>
            <div className="text-lg font-bold number-font">
              {progressPercent}%
            </div>
            <div className="text-xs text-muted-foreground">
              {completedItems}/{totalItems} 完成
            </div>
          </div>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border transition-colors",
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground hover:border-primary/50"
          )}
        >
          全部
        </button>
        {categoryOptions.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-colors",
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground hover:border-primary/50"
            )}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* 搜索 + 难度 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索知识内容..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-lg border bg-card pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-1">
          {difficultyOptions.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDifficulty(d.value)}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-md border transition-colors",
                selectedDifficulty === d.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:border-primary/50"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 知识列表 */}
      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
        {filteredItems.map((item) => {
          const progress = mockProgressList.find(
            (p) => p.knowledgeId === item.id
          );
          const isCompleted = progress?.status === "completed";
          const isReading = progress?.status === "reading";
          const cat = categoryOptions.find(
            (c) => c.value === item.category
          );

          return (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="flex items-start gap-3 rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md hover:border-primary/30"
            >
              <div
                className={cn(
                  "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-sm",
                  isCompleted
                    ? "bg-green-100"
                    : isReading
                    ? "bg-blue-100"
                    : "bg-secondary"
                )}
              >
                {cat?.icon || "📄"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-sm">
                    {item.title}
                  </h3>
                  {isCompleted && (
                    <span className="text-xs text-green-600 shrink-0">
                      已完成
                    </span>
                  )}
                  {isReading && (
                    <span className="text-xs text-blue-600 shrink-0">
                      学习中 {progress?.progressPercentage}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.summary}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                    {
                      difficultyOptions.find(
                        (d) => d.value === item.difficulty
                      )?.label
                    }
                  </span>
                  {item.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-xs text-muted-foreground"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground mt-2" />
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-1">
            未找到匹配内容
          </h3>
          <p className="text-sm text-muted-foreground">
            尝试调整筛选条件或搜索关键词
          </p>
        </div>
      )}

      {/* 知识详情弹窗 */}
      {selectedItem && (
        <KnowledgeDetail
          item={selectedItem}
          progress={mockProgressList.find(
            (p) => p.knowledgeId === selectedItem.id
          )}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function KnowledgeDetail({
  item,
  progress,
  onClose,
}: {
  item: KnowledgeItem;
  progress?: LearningProgress;
  onClose: () => void;
}) {
  const cat = categoryOptions.find(
    (c) => c.value === item.category
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-10 px-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border bg-card shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1 hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
              {cat?.icon} {cat?.label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
              {
                difficultyOptions.find(
                  (d) => d.value === item.difficulty
                )?.label
              }
            </span>
            {progress && (
              <span
                className={cn(
                  "text-xs font-medium ml-auto",
                  progress.status === "completed"
                    ? "text-green-600"
                    : "text-blue-600"
                )}
              >
                {progress.status === "completed"
                  ? "已完成"
                  : `学习中 ${progress.progressPercentage}%`}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold">{item.title}</h2>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(item.updatedAt).toLocaleDateString(
                "zh-CN"
              )}
            </span>
          </div>

          <div className="border-t pt-4">
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line leading-relaxed">
              {item.content}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {item.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
