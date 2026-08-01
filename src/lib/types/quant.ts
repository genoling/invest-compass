import type { ReactNode } from "react";

/** 策略类型 */
export type StrategyType = "ma_cross" | "momentum" | "mean_reversion" | "grid" | "bollinger" | "macd";

/** 策略配置 */
export interface StrategyConfig {
  id: string;
  name: string;
  type: StrategyType;
  description: string;
  /** 参数键值对 */
  params: Record<string, number>;
  /** 适用市场 */
  markets: string[];
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: string;
}

/** 回测结果 */
export interface BacktestResult {
  id: string;
  strategyId: string;
  /** 回测参数 */
  params: {
    startDate: string;
    endDate: string;
    initialCapital: number;
    symbol: string;
  };
  /** 关键指标 */
  metrics: {
    totalReturn: number; // 总收益率 (%)
    annualReturn: number; // 年化收益率 (%)
    maxDrawdown: number; // 最大回撤 (%)
    sharpeRatio: number; // 夏普比率
    winRate: number; // 胜率 (%)
    totalTrades: number; // 总交易次数
    avgHoldingDays: number; // 平均持仓天数
  };
  /** 回测状态 */
  status: "running" | "completed" | "failed";
  /** 权益曲线数据点 */
  equityCurve: { date: string; value: number }[];
  /** 交易记录 */
  trades: Trade[];
  createdAt: string;
}

/** 交易记录 */
export interface Trade {
  date: string;
  type: "buy" | "sell";
  price: number;
  quantity: number;
  amount: number;
  reason: string;
}

/** 策略预设模板 */
export const strategyTemplates: Omit<StrategyConfig, "id" | "createdAt" | "enabled">[] = [
  {
    name: "均线交叉策略",
    type: "ma_cross",
    description: "短期均线上穿长期均线买入，下穿卖出",
    params: { shortPeriod: 5, longPeriod: 20 },
    markets: ["A股", "港股", "美股"],
  },
  {
    name: "动量突破策略",
    type: "momentum",
    description: "价格突破 N 日高点时买入，跌破低点时卖出",
    params: { lookbackPeriod: 20, breakoutThreshold: 1.02 },
    markets: ["A股", "加密货币"],
  },
  {
    name: "均值回归策略",
    type: "mean_reversion",
    description: "价格偏离均值超阈值时反向交易",
    params: { meanPeriod: 20, deviationThreshold: 2 },
    markets: ["A股", "美股"],
  },
  {
    name: "网格交易策略",
    type: "grid",
    description: "在价格区间内设置多个买卖挂单，低买高卖",
    params: { gridLevels: 10, upperPrice: 100, lowerPrice: 80 },
    markets: ["加密货币", "外汇"],
  },
  {
    name: "布林带策略",
    type: "bollinger",
    description: "价格触及下轨买入，触及上轨卖出，突破中轨加仓",
    params: { period: 20, deviation: 2 },
    markets: ["A股", "美股", "外汇"],
  },
  {
    name: "MACD 金叉策略",
    type: "macd",
    description: "MACD 金叉（DIF 上穿 DEA）买入，死叉卖出",
    params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    markets: ["A股", "港股", "美股"],
  },
];
