/**
 * 自动交易 Hook
 *
 * 定时拉取行情 → 执行策略 → 自动下单到模拟引擎
 */
import { useState, useCallback, useRef, useEffect } from "react";
import type { StrategyConfig } from "@/lib/types/quant";
import type { SimulatorState } from "@/lib/types/trading";
import type { KLinePoint } from "@/lib/akshare/client";
import { generateSignal, type StrategySignal } from "./strategy";
import { placeOrder, refreshPositions } from "./simulator";

interface AutoTradeState {
  running: boolean;
  signals: StrategySignal[];
  lastCheck: string | null;
}

const CHECK_INTERVAL = 30000; // 30 秒检查一次（A股不需要太频繁）

export function useAutoTrade(
  strategies: StrategyConfig[],
  simState: SimulatorState,
  setSimState: React.Dispatch<React.SetStateAction<SimulatorState>>,
  klines: Record<string, KLinePoint[]>
) {
  const [autoState, setAutoState] = useState<AutoTradeState>({
    running: false,
    signals: [],
    lastCheck: null,
  });
  const intervalRef = useRef<number | null>(null);

  const executeStrategyCheck = useCallback(() => {
    const enabledStrategies = strategies.filter((s) => s.enabled);
    if (enabledStrategies.length === 0) return;

    const newSignals: StrategySignal[] = [];
    let newState = simState;

    for (const strategy of enabledStrategies) {
      // 为每个启用的策略检查关注的股票
      const watchCodes = ["000001", "600519", "000858", "300750", "601318", "600036", "002594", "688981", "000002", "601166", "600030", "000725", "002415", "300059", "600276"];
      for (const code of watchCodes) {
        const history = klines[code] || [];
        if (history.length < 20) continue;

        const signal = generateSignal(strategy, code, history);
        newSignals.push(signal);

        // 只有买入/卖出信号才自动下单
        if (signal.action !== "hold") {
          const { state } = placeOrder(newState, {
            code,
            name: signal.strategyName,
            side: signal.action,
            price: 0, // 市价单
            quantity: signal.quantity,
            type: "market",
            preClose: history[history.length - 1]?.close || 10,
          });
          newState = state;
        }
      }
    }

    // 用行情刷新持仓市值
    const quotes = Object.entries(klines).map(([code, k]) => ({
      code,
      price: k[k.length - 1]?.close || 0,
    }));
    newState = refreshPositions(newState, quotes);

    setSimState(newState);
    setAutoState((prev) => ({
      ...prev,
      signals: [...newSignals.slice(-50), ...prev.signals].slice(0, 50),
      lastCheck: new Date().toISOString(),
    }));
  }, [strategies, simState, setSimState, klines]);

  const startAutoTrade = useCallback(() => {
    if (autoState.running) return;
    setAutoState((prev) => ({ ...prev, running: true }));
    executeStrategyCheck(); // 立即执行一次
    intervalRef.current = window.setInterval(executeStrategyCheck, CHECK_INTERVAL);
  }, [autoState.running, executeStrategyCheck]);

  const stopAutoTrade = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAutoState((prev) => ({ ...prev, running: false }));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { autoState, startAutoTrade, stopAutoTrade };
}
