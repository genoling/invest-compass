import type { NewsItem } from "@/lib/types/news";
import {
  X,
  ExternalLink,
  Clock,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import KLineChart from "./KLineChart";

interface NewsDetailProps {
  news: NewsItem | null;
  onClose: () => void;
}

export default function NewsDetail({ news, onClose }: NewsDetailProps) {
  if (!news) return null;

  const sentimentColor = {
    positive: "text-gain-DEFAULT",
    negative: "text-loss-DEFAULT",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pb-10 px-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border bg-card shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-1 hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-4">
          {/* 标签栏 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
              {news.category}
            </span>
            {news.sentiment && (
              <span
                className={cn(
                  "text-xs font-medium",
                  sentimentColor[news.sentiment]
                )}
              >
                {news.sentiment === "positive"
                  ? "利好"
                  : news.sentiment === "negative"
                  ? "利空"
                  : "中性"}
              </span>
            )}
            {news.industry.map((ind) => (
              <span
                key={ind}
                className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {ind}
              </span>
            ))}
          </div>

          {/* 标题 */}
          <h2 className="text-xl font-bold leading-snug">
            {news.headline}
          </h2>

          {/* 元信息 */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(news.publishedAt).toLocaleString("zh-CN")}
            </span>
            <span>来源：{news.source}</span>
            <span>{news.author}</span>
          </div>

          {/* 关联资产 */}
          {news.relatedSymbols.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">相关资产：</span>
              {news.relatedSymbols.map((sym) => (
                <span
                  key={sym}
                  className="px-2 py-0.5 rounded bg-secondary font-medium text-xs"
                >
                  {sym}
                </span>
              ))}
            </div>
          )}

          {/* 正文 */}
          <div className="prose prose-sm max-w-none text-foreground border-t pt-4">
            <p className="leading-relaxed whitespace-pre-line">
              {news.content}
            </p>
          </div>

          {/* K线图 */}
          <KLineChart
            symbol={news.relatedSymbols[0] || "AAPL"}
            basePrice={187}
          />

          {/* 原文链接 */}
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            查看原文
          </a>
        </div>
      </div>
    </div>
  );
}
