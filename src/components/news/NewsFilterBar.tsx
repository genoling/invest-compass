import type { AssetClass, NewsCategory } from "@/lib/types/news";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface NewsFilterBarProps {
  onFilterChange: (filters: {
    assetClass?: AssetClass;
    category?: NewsCategory;
    keyword?: string;
  }) => void;
}

const assetClassOptions: { value: AssetClass; label: string }[] = [
  { value: "stocks", label: "股票" },
  { value: "cryptocurrency", label: "加密货币" },
  { value: "bonds", label: "债券" },
  { value: "forex", label: "外汇" },
];

const categoryOptions: {
  value: NewsCategory;
  label: string;
}[] = [
  { value: "market", label: "市场行情" },
  { value: "industry", label: "行业板块" },
  { value: "concept", label: "概念题材" },
  { value: "macro", label: "宏观政策" },
  { value: "company", label: "公司动态" },
];

export default function NewsFilterBar({
  onFilterChange,
}: NewsFilterBarProps) {
  const [keyword, setKeyword] = useState("");
  const [assetClass, setAssetClass] = useState<AssetClass | undefined>();
  const [category, setCategory] = useState<NewsCategory | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const emitChange = (
    kw: string,
    ac?: AssetClass,
    cat?: NewsCategory
  ) => {
    onFilterChange({
      keyword: kw || undefined,
      assetClass: ac,
      category: cat,
    });
  };

  return (
    <div className="space-y-3">
      {/* 搜索栏 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索资讯标题、摘要、关键字..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              emitChange(e.target.value, assetClass, category);
            }}
            className="w-full rounded-lg border bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          {keyword && (
            <button
              onClick={() => {
                setKeyword("");
                emitChange("", assetClass, category);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-secondary transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">筛选</span>
        </button>
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2">
          <div className="flex flex-wrap gap-1.5">
            {assetClassOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  const next =
                    assetClass === opt.value ? undefined : opt.value;
                  setAssetClass(next);
                  emitChange(keyword, next, category);
                }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  assetClass === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="w-px bg-border hidden sm:block" />
          <div className="flex flex-wrap gap-1.5">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  const next =
                    category === opt.value ? undefined : opt.value;
                  setCategory(next);
                  emitChange(keyword, assetClass, next);
                }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  category === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
