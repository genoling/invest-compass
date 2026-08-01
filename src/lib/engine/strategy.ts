/**
 * 策略引擎
 *
 * 输入：历史 K 线 + 实时行情 → 输出：买入/卖出/持有信号
 * 支持 4 种策略：均线交叉 / 动量突破 / 均值回归 / 网格交易
 */

import type { StrategyConfig } from "@/lib/types/quant";
import type { KLinePoint, SpotQuote } from "@/lib/akshare/client";

/** 信号方向 */
export type SignalAction = "buy" | "sell" | "hold";

/** 策略信号 */
export interface StrategySignal {
  /** 信号 ID */
  id: string;
  /** 策略 ID */
  strategyId: string;
  /** 策略名称 */
  strategyName: string;
  /** 股票代码 */
  code: string;
  /** 操作 */
  action: SignalAction;
  /** 当前价格 */
  price: number;
  /** 建议数量 */
  quantity: number;
  /** 信号强度 0-100 */
  strength: number;
  /** 触发原因 */
  reason: string;
  /** 时间 */
  time: string;
}

/** 简易移动平均线 */
function sma(data: number[], period: number): number {
  if (data.length < period) return 0;
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/** 简易标准差 */
function stddev(data: number[], mean: number): number {
  if (data.length < 2) return 0;
  const variance = data.reduce((sum, v) => sum + (v - mean) ** 2, 0) / data.length;
  return Math.sqrt(variance);
}

let signalSeq = 0;

function makeSignal(
  strategy: StrategyConfig,
  code: string,
  action: SignalAction,
  price: number,
  reason: string,
  strength = 50
): StrategySignal {
  return {
    id: `SIG-${Date.now()}-${++signalSeq}`,
    strategyId: strategy.id,
    strategyName: strategy.name,
    code,
    action,
    price,
    quantity: 100, // 默认每次交易 1 手
    strength,
    reason,
    time: new Date().toISOString(),
  };
}

/**
 * 主入口：根据策略配置 + 行情数据生成信号
 */
export function generateSignal(
  strategy: StrategyConfig,
  code: string,
  klines: KLinePoint[],
  spot?: SpotQuote
): StrategySignal {
  const closes = klines.map((k) => k.close);
  const currentPrice = spot?.price || closes[closes.length - 1] || 0;

  switch (strategy.type) {
    case "ma_cross":
      return maCrossStrategy(strategy, code, closes, currentPrice);
    case "momentum":
      return momentumStrategy(strategy, code, klines, currentPrice);
    case "mean_reversion":
      return meanReversionStrategy(strategy, code, closes, currentPrice);
    case "grid":
      return gridStrategy(strategy, code, closes, currentPrice);
    case "bollinger":
      return bollingerStrategy(strategy, code, closes, currentPrice);
    case "macd":
      return macdStrategy(strategy, code, closes, currentPrice);
    default:
      return makeSignal(strategy, code, "hold", currentPrice, "未知策略类型");
  }
}

// ============ 均线交叉策略 ============
function maCrossStrategy(
  s: StrategyConfig,
  code: string,
  closes: number[],
  price: number
): StrategySignal {
  const short = s.params.shortPeriod || 5;
  const long = s.params.longPeriod || 20;

  const maShort = sma(closes, short);
  const maLong = sma(closes, long);

  // 需要前一根的均线来判断交叉
  const prevCloses = closes.slice(0, -1);
  const prevMaShort = sma(prevCloses, short);
  const prevMaLong = sma(prevCloses, long);

  if (prevMaShort <= prevMaLong && maShort > maLong) {
    return makeSignal(s, code, "buy", price, `金叉：MA${short}(${maShort.toFixed(2)}) 上穿 MA${long}(${maLong.toFixed(2)})`, 70);
  }
  if (prevMaShort >= prevMaLong && maShort < maLong) {
    return makeSignal(s, code, "sell", price, `死叉：MA${short}(${maShort.toFixed(2)}) 下穿 MA${long}(${maLong.toFixed(2)})`, 70);
  }
  return makeSignal(s, code, "hold", price, `MA${short}=${maShort.toFixed(2)} MA${long}=${maLong.toFixed(2)}`, 30);
}

// ============ 动量突破策略 ============
function momentumStrategy(
  s: StrategyConfig,
  code: string,
  klines: KLinePoint[],
  price: number
): StrategySignal {
  const period = s.params.lookbackPeriod || 20;
  const threshold = s.params.breakoutThreshold || 1.02;

  const recent = klines.slice(-period);
  const highs = recent.map((k) => k.high);
  const lows = recent.map((k) => k.low);
  const highest = Math.max(...highs);
  const lowest = Math.min(...lows);

  if (price >= highest * threshold) {
    return makeSignal(s, code, "buy", price, `突破 ${period}日高点 ¥${highest.toFixed(2)} × ${threshold}`, 65);
  }
  if (price <= lowest) {
    return makeSignal(s, code, "sell", price, `跌破 ${period}日低点 ¥${lowest.toFixed(2)}`, 65);
  }
  return makeSignal(s, code, "hold", price, `${period}日区间：¥${lowest.toFixed(2)} - ¥${highest.toFixed(2)}`, 30);
}

// ============ 均值回归策略 ============
function meanReversionStrategy(
  s: StrategyConfig,
  code: string,
  closes: number[],
  price: number
): StrategySignal {
  const period = s.params.meanPeriod || 20;
  const threshold = s.params.deviationThreshold || 2;

  const mean = sma(closes, period);
  const dev = stddev(closes, mean);

  if (price < mean - threshold * dev) {
    return makeSignal(s, code, "buy", price, `超跌：价格 ¥${price.toFixed(2)} < 均值-${threshold}σ (${(mean - threshold * dev).toFixed(2)})`, 60);
  }
  if (price > mean) {
    return makeSignal(s, code, "sell", price, `回归均值 ¥${mean.toFixed(2)}，价格 ¥${price.toFixed(2)} 已超均值`, 55);
  }
  return makeSignal(s, code, "hold", price, `价格 ¥${price.toFixed(2)} 偏离均值 ¥${mean.toFixed(2)}`, 30);
}

// ============ 网格交易策略 ============
function gridStrategy(
  s: StrategyConfig,
  code: string,
  closes: number[],
  price: number
): StrategySignal {
  const levels = s.params.gridLevels || 10;
  const upper = s.params.upperPrice || 100;
  const lower = s.params.lowerPrice || 80;

  if (price >= upper) {
    return makeSignal(s, code, "sell", price, `触及网格上沿 ¥${upper}`, 50);
  }
  if (price <= lower) {
    return makeSignal(s, code, "buy", price, `触及网格下沿 ¥${lower}`, 50);
  }

  const step = (upper - lower) / levels;
  const gridIndex = Math.floor((price - lower) / step);
  const gridPrice = lower + gridIndex * step;

  return makeSignal(s, code, "hold", price, `网格 ${gridIndex + 1}/${levels}，价格区间 ¥${(gridPrice - step / 2).toFixed(2)} - ¥${(gridPrice + step / 2).toFixed(2)}`, 20);
}

// ============ 布林带策略 ============
function bollingerStrategy(
  s: StrategyConfig,
  code: string,
  closes: number[],
  price: number
): StrategySignal {
  const period = s.params.period || 20;
  const deviation = s.params.deviation || 2;

  const mid = sma(closes, period);
  const dev = stddev(closes, mid);

  const upper = mid + deviation * dev;
  const lower = mid - deviation * dev;

  if (price <= lower) {
    return makeSignal(s, code, "buy", price, `触及布林下轨 ¥${lower.toFixed(2)}（中轨 ¥${mid.toFixed(2)}）`, 65);
  }
  if (price >= upper) {
    return makeSignal(s, code, "sell", price, `触及布林上轨 ¥${upper.toFixed(2)}（中轨 ¥${mid.toFixed(2)}）`, 65);
  }
  return makeSignal(s, code, "hold", price, `布林带 ¥${lower.toFixed(2)} - ¥${upper.toFixed(2)}（中轨 ¥${mid.toFixed(2)}）`, 25);
}

// ============ MACD 策略 ============
function ema(data: number[], period: number): number {
  if (data.length < period) return sma(data, data.length);
  const k = 2 / (period + 1);
  let result = data[0];
  for (let i = 1; i < data.length; i++) {
    result = data[i] * k + result * (1 - k);
  }
  return result;
}

function macdStrategy(
  s: StrategyConfig,
  code: string,
  closes: number[],
  price: number
): StrategySignal {
  const fast = s.params.fastPeriod || 12;
  const slow = s.params.slowPeriod || 26;
  const signal = s.params.signalPeriod || 9;

  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const dif = emaFast - emaSlow;

  // 用收盘价计算 DIF 序列近似 DEA
  const difValues: number[] = [];
  for (let i = fast; i <= closes.length; i++) {
    const slice = closes.slice(0, i);
    const ef = ema(slice, fast);
    const es = ema(slice, slow);
    difValues.push(ef - es);
  }
  const dea = ema(difValues, signal);

  const prevDifs = difValues.slice(0, -1);
  const prevDeaVals: number[] = [];
  for (let i = signal; i <= prevDifs.length; i++) {
    prevDeaVals.push(ema(prevDifs.slice(0, i), signal));
  }
  const prevDea = prevDeaVals[prevDeaVals.length - 1] || dea;

  if (prevDifs[prevDifs.length - 1] <= prevDea && dif > dea) {
    return makeSignal(s, code, "buy", price, `MACD金叉：DIF(${dif.toFixed(3)}) 上穿 DEA(${dea.toFixed(3)})`, 75);
  }
  if (prevDifs[prevDifs.length - 1] >= prevDea && dif < dea) {
    return makeSignal(s, code, "sell", price, `MACD死叉：DIF(${dif.toFixed(3)}) 下穿 DEA(${dea.toFixed(3)})`, 75);
  }
  return makeSignal(s, code, "hold", price, `MACD：DIF=${dif.toFixed(3)} DEA=${dea.toFixed(3)}`, 35);
}
