/** 资产类别 */
export type AssetClass = "stocks" | "cryptocurrency" | "bonds" | "forex";

/** 行情数据类型 */
export interface MarketQuote {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h?: number;
  low24h?: number;
  marketCap?: number;
  currency: string;
  lastUpdated: string;
}

/** K线数据点 */
export interface KLineData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** 资讯分类 */
export type NewsCategory =
  | "market"
  | "industry"
  | "concept"
  | "macro"
  | "company";

/** 资讯条目 */
export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  content: string;
  author: string;
  source: string;
  url: string;
  category: NewsCategory;
  type: string;
  relatedSymbols: string[];
  industry: string[];
  sentiment?: "positive" | "negative" | "neutral";
  publishedAt: string;
  updatedAt: string;
}

/** 资讯筛选条件 */
export interface NewsFilter {
  assetClass?: AssetClass;
  category?: NewsCategory;
  industry?: string;
  keyword?: string;
  sentiment?: "positive" | "negative" | "neutral";
}
