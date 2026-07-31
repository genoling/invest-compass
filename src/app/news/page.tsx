import { useState, useCallback, useMemo } from "react";
import MarketTicker from "@/components/news/MarketTicker";
import NewsFilterBar from "@/components/news/NewsFilterBar";
import NewsList from "@/components/news/NewsList";
import NewsDetail from "@/components/news/NewsDetail";
import {
  mockMarketQuotes,
  mockNews,
  simulatePriceChange,
} from "@/lib/mock/news";
import type {
  MarketQuote,
  NewsItem,
  AssetClass,
  NewsCategory,
} from "@/lib/types/news";
import { useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";

const PAGE_SIZE = 6;

export default function NewsPage() {
  const [quotes, setQuotes] = useState<MarketQuote[]>(mockMarketQuotes);
  const [allNews] = useState<NewsItem[]>(mockNews);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>(mockNews);
  const [visibleNews, setVisibleNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  // 模拟实时行情推送
  useEffect(() => {
    const timer = setInterval(() => {
      setQuotes((prev) =>
        prev.map((q) =>
          Math.random() > 0.3 ? simulatePriceChange(q) : q
        )
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // 基于筛选条件过滤
  const filtersRef = useRef<{
    assetClass?: AssetClass;
    category?: NewsCategory;
    keyword?: string;
  }>({});

  const handleFilter = useCallback(
    (f: {
      assetClass?: AssetClass;
      category?: NewsCategory;
      keyword?: string;
    }) => {
      filtersRef.current = f;

      let result = allNews;

      if (f.keyword) {
        const kw = f.keyword.toLowerCase();
        result = result.filter(
          (n) =>
            n.headline.toLowerCase().includes(kw) ||
            n.summary.toLowerCase().includes(kw) ||
            n.industry.some((i) => i.toLowerCase().includes(kw))
        );
      }

      if (f.category) {
        result = result.filter((n) => n.category === f.category);
      }

      if (f.assetClass) {
        // 按资产类别过滤：资讯关联资产中匹配
        result = result.filter((n) =>
          n.relatedSymbols.some((sym) => {
            const quote = quotes.find((q) => q.symbol === sym);
            return quote?.assetClass === f.assetClass;
          })
        );
      }

      setFilteredNews(result);
      setPage(1);
      setVisibleNews(result.slice(0, PAGE_SIZE));
    },
    [allNews, quotes]
  );

  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const start = 0;
      const end = nextPage * PAGE_SIZE;
      setVisibleNews(filteredNews.slice(start, end));
      setPage(nextPage);
      setIsLoading(false);
    }, 500);
  }, [page, filteredNews]);

  // 初始加载
  useMemo(() => {
    setVisibleNews(mockNews.slice(0, PAGE_SIZE));
  }, []);

  const hasMore = visibleNews.length < filteredNews.length;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            实时资讯
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            市场行情与行业资讯实时追踪
          </p>
        </div>
        <button
          onClick={() => {
            setQuotes(
              mockMarketQuotes.map((q) => simulatePriceChange(q))
            );
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          刷新行情
        </button>
      </div>

      {/* 行情跑马灯 */}
      <div className="rounded-xl border bg-card p-3">
        <div className="text-xs text-muted-foreground mb-2 px-1">
          实时行情 &middot; 每3秒自动刷新
        </div>
        <MarketTicker
          quotes={quotes}
          onSelect={(q) =>
            setSelectedQuote(
              selectedQuote === q.symbol ? undefined : q.symbol
            )
          }
          selectedSymbol={selectedQuote}
        />
      </div>

      {/* 筛选栏 */}
      <NewsFilterBar onFilterChange={handleFilter} />

      {/* 资讯列表 */}
      <NewsList
        news={visibleNews}
        onNewsClick={setSelectedNews}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
      />

      {/* 详情弹窗 */}
      <NewsDetail
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
      />
    </div>
  );
}
