import type { NewsItem } from "@/lib/types/news";
import NewsCard from "./NewsCard";
import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface NewsListProps {
  news: NewsItem[];
  onNewsClick?: (news: NewsItem) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  /** 是否显示新资讯到达提示 */
  newItemsCount?: number;
  onDismissNewItems?: () => void;
}

export default function NewsList({
  news,
  onNewsClick,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  newItemsCount = 0,
  onDismissNewItems,
}: NewsListProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleScroll = useCallback(() => {
    setIsUserScrolling(true);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!loaderRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (news.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg">暂无相关资讯</p>
        <p className="text-sm mt-1">尝试调整筛选条件</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" onScroll={handleScroll}>
      {/* 新资讯提示 */}
      {newItemsCount > 0 && !isUserScrolling && (
        <button
          onClick={onDismissNewItems}
          className="w-full rounded-lg border-2 border-primary/50 bg-primary/5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          有 {newItemsCount} 条新资讯到达，点击刷新
        </button>
      )}

      {/* 资讯列表 */}
      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} onClick={onNewsClick} />
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-6">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              加载中...
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              加载更多
            </button>
          )}
        </div>
      )}
    </div>
  );
}
