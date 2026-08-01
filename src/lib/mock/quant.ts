import type { StrategyConfig, BacktestResult } from "@/lib/types/quant";

/** Mock 策略列表 */
export const mockStrategies: StrategyConfig[] = [
  {
    id: "s-001",
    name: "均线交叉策略",
    type: "ma_cross",
    description: "短期均线上穿长期均线买入，下穿卖出",
    params: { shortPeriod: 5, longPeriod: 20 },
    markets: ["A股"],
    enabled: true,
    createdAt: "2026-07-01T08:00:00Z",
  },
  {
    id: "s-002",
    name: "动量突破策略",
    type: "momentum",
    description: "价格突破 N 日高点时买入，跌破低点时卖出",
    params: { lookbackPeriod: 20, breakoutThreshold: 1.02 },
    markets: ["A股"],
    enabled: false,
    createdAt: "2026-07-15T10:30:00Z",
  },
  {
    id: "s-003",
    name: "均值回归策略",
    type: "mean_reversion",
    description: "价格偏离均值超阈值时反向交易",
    params: { meanPeriod: 20, deviationThreshold: 2 },
    markets: ["A股", "港股"],
    enabled: true,
    createdAt: "2026-07-20T14:00:00Z",
  },
];

/** Mock 回测结果 */
export const mockBacktestResults: BacktestResult[] = [
  {
    id: "bt-001",
    strategyId: "s-001",
    params: {
      startDate: "2025-01-01",
      endDate: "2026-06-30",
      initialCapital: 100000,
      symbol: "000001.SZ",
    },
    metrics: {
      totalReturn: 23.5,
      annualReturn: 15.1,
      maxDrawdown: -12.3,
      sharpeRatio: 1.42,
      winRate: 58.3,
      totalTrades: 47,
      avgHoldingDays: 12,
    },
    status: "completed",
    equityCurve: [
      { date: "2025-01", value: 100000 },
      { date: "2025-03", value: 108500 },
      { date: "2025-06", value: 102300 },
      { date: "2025-09", value: 115200 },
      { date: "2025-12", value: 120800 },
      { date: "2026-03", value: 118400 },
      { date: "2026-06", value: 123500 },
    ],
    trades: [
      { date: "2025-01-15", type: "buy", price: 12.5, quantity: 800, amount: 10000, reason: "MA5 上穿 MA20" },
      { date: "2025-03-10", type: "sell", price: 13.8, quantity: 800, amount: 11040, reason: "MA5 下穿 MA20" },
      { date: "2025-04-20", type: "buy", price: 11.2, quantity: 1000, amount: 11200, reason: "MA5 上穿 MA20" },
      { date: "2025-06-15", type: "sell", price: 12.9, quantity: 1000, amount: 12900, reason: "MA5 下穿 MA20" },
    ],
    createdAt: "2026-07-15T09:00:00Z",
  },
  {
    id: "bt-002",
    strategyId: "s-003",
    params: {
      startDate: "2025-06-01",
      endDate: "2026-07-30",
      initialCapital: 50000,
      symbol: "600519.SH",
    },
    metrics: {
      totalReturn: 18.2,
      annualReturn: 13.8,
      maxDrawdown: -8.7,
      sharpeRatio: 1.85,
      winRate: 62.5,
      totalTrades: 24,
      avgHoldingDays: 8,
    },
    status: "completed",
    equityCurve: [
      { date: "2025-06", value: 50000 },
      { date: "2025-09", value: 52800 },
      { date: "2025-12", value: 54500 },
      { date: "2026-03", value: 56200 },
      { date: "2026-06", value: 57800 },
      { date: "2026-07", value: 59100 },
    ],
    trades: [
      { date: "2025-07-01", type: "buy", price: 1680, quantity: 30, amount: 50400, reason: "价格跌破均值-2σ" },
      { date: "2025-08-15", type: "sell", price: 1750, quantity: 30, amount: 52500, reason: "价格回归均值" },
    ],
    createdAt: "2026-07-20T11:00:00Z",
  },
];
