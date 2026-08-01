/**
 * 行情数据 Hook
 *
 * 优先从 AKShare Python 服务获取真实 A股行情，
 * 服务不可用时回退到 Mock 数据。
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { MarketQuote } from "@/lib/types/news";
import { mockMarketQuotes, simulatePriceChange } from "@/lib/mock/news";
import { fetchAllSpots, healthCheck } from "./client";
import type { SpotQuote } from "./client";

/** AKShare 行情 → MarketQuote 映射 */
function toMarketQuote(spot: SpotQuote): MarketQuote {
  return {
    symbol: spot.code,
    name: spot.name,
    price: spot.price,
    change: spot.price - spot.pre_close,
    changePercent: spot.change_pct,
    currency: "CNY",
    assetClass: "stocks",
    volume: spot.volume,
    high24h: spot.high,
    low24h: spot.low,
    lastUpdated: new Date().toISOString(),
  };
}

/** 默认关注的 A股标的 */
const WATCH_LIST = [
  "000001", // 平安银行
  "600519", // 贵州茅台
  "000858", // 五粮液
  "300750", // 宁德时代
  "601318", // 中国平安
  "600036", // 招商银行
  "002594", // 比亚迪
  "688981", // 中芯国际
  "000002", // 万科A
  "601166", // 兴业银行
  "600030", // 中信证券
  "000725", // 京东方A
  "002415", // 海康威视
  "300059", // 东方财富
  "600276", // 恒瑞医药
];

export function useMarketQuotes() {
  const [quotes, setQuotes] = useState<MarketQuote[]>(mockMarketQuotes);
  const [dataSource, setDataSource] = useState<"akshare" | "mock">("mock");
  const [loading, setLoading] = useState(true);
  const isRunningRef = useRef(false);

  /** 从 AKShare 获取数据 */
  const fetchFromAKShare = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    try {
      // 只获取关注列表中的股票（减少请求量）
      const allSpots = await fetchAllSpots();
      const filtered = allSpots
        .filter((s) => WATCH_LIST.includes(s.code))
        .map(toMarketQuote);

      if (filtered.length > 0) {
        setQuotes(filtered);
        setDataSource("akshare");
      }
    } catch (e) {
      console.warn("AKShare 服务不可用，使用 Mock 数据:", e);
      // 回退到 Mock 模拟波动
      setQuotes((prev) =>
        prev.map((q) => (Math.random() > 0.3 ? simulatePriceChange(q) : q))
      );
    } finally {
      setLoading(false);
      isRunningRef.current = false;
    }
  }, []);

  /** 初始化：检查 AKShare 服务并决定数据源 */
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const healthy = await healthCheck().catch(() => false);
      if (cancelled) return;

      if (healthy) {
        console.log("✅ AKShare 服务可用，使用真实 A股行情");
        await fetchFromAKShare();
      } else {
        console.log("⚠️ AKShare 服务不可用，使用 Mock 数据");
        setQuotes(mockMarketQuotes);
        setDataSource("mock");
        setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [fetchFromAKShare]);

  /** 定时刷新（AKShare 模式 5 秒，Mock 模式 3 秒） */
  useEffect(() => {
    const interval = dataSource === "akshare" ? 5000 : 3000;
    const timer = setInterval(() => {
      if (dataSource === "akshare") {
        fetchFromAKShare();
      } else {
        setQuotes((prev) =>
          prev.map((q) => (Math.random() > 0.3 ? simulatePriceChange(q) : q))
        );
      }
    }, interval);

    return () => clearInterval(timer);
  }, [dataSource, fetchFromAKShare]);

  /** 手动刷新 */
  const refresh = useCallback(() => {
    if (dataSource === "akshare") {
      fetchFromAKShare();
    }
  }, [dataSource, fetchFromAKShare]);

  return { quotes, dataSource, loading, refresh };
}
