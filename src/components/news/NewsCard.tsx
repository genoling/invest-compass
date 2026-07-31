import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/types/news";
import { Clock, ExternalLink, Tag } from "lucide-react";

interface NewsCardProps {
  news: NewsItem;
  onClick?: (news: NewsItem) => void;
  compact?: boolean;
}

const sentimentColors = {
  positive: "text-gain-DEFAULT",
  negative: "text-loss-DEFAULT",
  neutral: "text-muted-foreground",
};

const sentimentLabels = {
  positive: "利好",
  negative: "利空",
  neutral: "中性",
};

const categoryLabels: Record<string, string> = {
  market: "市场",
  industry: "行业",
  concept: "概念",
  macro: "宏观",
  company: "公司",
};

export default function NewsCard({
  news,
  onClick,
  compact = false,
}: NewsCardProps) {
  const timeAgo = getTimeAgo(new Date(news.publishedAt));

  return (
    <article
      className={cn(
        "group cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30",
        compact && "p-3"
      )}
      onClick={() => onClick?.(news)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
              {categoryLabels[news.category] || news.category}
            </span>
            {news.sentiment && (
              <span
                className={cn(
                  "text-xs font-medium",
                  sentimentColors[news.sentiment]
                )}
              >
                {sentimentLabels[news.sentiment]}
              </span>
            )}
          </div>
          <h3
            className={cn(
              "font-semibold leading-snug group-hover:text-primary transition-colors",
              compact ? "text-sm" : "text-base"
            )}
          >
            {news.headline}
          </h3>
          {!compact && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
              {news.summary}
            </p>
          )}
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </span>
        <span>{news.source}</span>
        {news.relatedSymbols.length > 0 && !compact && (
          <span className="flex items-center gap-1 ml-auto">
            <Tag className="h-3 w-3" />
            {news.relatedSymbols.slice(0, 3).join(", ")}
            {news.relatedSymbols.length > 3 &&
              ` +${news.relatedSymbols.length - 3}`}
          </span>
        )}
      </div>
    </article>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}天前`;
  return date.toLocaleDateString("zh-CN");
}
