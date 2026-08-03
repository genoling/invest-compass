import { useState, useCallback, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Play,
  Plus,
  Settings2,
  ChevronDown,
  ChevronUp,
  Activity,
  DollarSign,
  Percent,
  Clock,
  Target,
  Shield,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockStrategies, mockBacktestResults } from "@/lib/mock/quant";
import { strategyTemplates } from "@/lib/types/quant";
import type { StrategyConfig, BacktestResult } from "@/lib/types/quant";
import type { SimulatorState, OrderSide, OrderType } from "@/lib/types/trading";
import { createInitialState, placeOrder, refreshPositions } from "@/lib/engine/simulator";
import { useAutoTrade } from "@/lib/engine/useAutoTrade";
import { saveSimState, loadSimState } from "@/lib/engine/persistence";
import { buy as tradeBuy, sell as tradeSell, tradeHealthCheck } from "@/lib/trade/client";
import AccountPanel from "@/components/quant/AccountPanel";
import TradePanel from "@/components/quant/TradePanel";
import EquityCurve from "@/components/quant/EquityCurve";
import TradeHistory from "@/components/quant/TradeHistory";

export default function QuantPage() {
  const [strategies, setStrategies] = useState<StrategyConfig[]>(mockStrategies);
  const [backtests] = useState<BacktestResult[]>(mockBacktestResults);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [backtestParams, setBacktestParams] = useState({
    strategyId: mockStrategies[0]?.id || "",
    symbol: "000001.SZ",
    startDate: "2025-01-01",
    endDate: "2026-06-30",
    initialCapital: 100000,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [expandedBacktest, setExpandedBacktest] = useState<string | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  // 模拟交易引擎（带 Firestore 持久化）
  const [simState, setSimState] = useState<SimulatorState>(() => createInitialState(100000));
  const [lastOrderMsg, setLastOrderMsg] = useState("");

  // 初始化：从 Firestore 加载
  useEffect(() => {
    loadSimState().then((saved) => {
      if (saved) setSimState(saved);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 保存到 Firestore：每次状态变化时
  useEffect(() => {
    saveSimState(simState);
  }, [simState]);

  // 自动交易（策略引擎）
  const { autoState, startAutoTrade, stopAutoTrade } = useAutoTrade(
    strategies, simState, setSimState, {} // klines 暂为空，真实数据从 AKShare 获取
  );

  const handlePlaceOrder = useCallback((params: {
    code: string; name: string; side: OrderSide; price: number; quantity: number; type: OrderType;
  }) => {
    const { code, name, side, price, quantity } = params;

    // 优先走 trade_server 模拟盘
    tradeHealthCheck().then(async (healthy) => {
      if (healthy) {
        try {
          if (side === "buy") {
            await tradeBuy(code, name, price, quantity);
          } else {
            await tradeSell(code, price, quantity);
          }
          setLastOrderMsg(`✅ [模拟盘] ${side === "buy" ? "买入" : "卖出"} ${name} ${quantity}股 成交`);
          // 刷新账户信息
          const { fetchAccount } = await import("@/lib/trade/client");
          const acc = await fetchAccount();
          // 同步到自建引擎
          setSimState((prev) => ({
            ...prev,
            account: {
              ...prev.account,
              availableCash: acc.cash,
              positionValue: acc.positions.reduce((sum, p) => sum + p.avg_cost * p.quantity, 0),
            },
            positions: acc.positions.map((p) => ({
              code: p.code, name: p.name, quantity: p.quantity,
              availableQty: p.available_qty, avgCost: p.avg_cost,
              currentPrice: p.avg_cost, marketValue: p.avg_cost * p.quantity,
              pnl: 0, pnlPct: 0,
            })),
          }));
          setTimeout(() => setLastOrderMsg(""), 3000);
          return;
        } catch (e) {
          console.warn("trade_server 下单失败，回退自建引擎:", e);
        }
      }

      // 回退：自建模拟引擎
      const preClose = 10;
      const { state, order } = placeOrder(simState, { code, name, side, price, quantity, type: "market", preClose });
      setSimState(state);

      if (order.status === "rejected") {
        setLastOrderMsg(`❌ ${order.rejectReason}`);
      } else if (order.status === "filled") {
        setLastOrderMsg(`✅ [本地] ${side === "buy" ? "买入" : "卖出"} ${name} ${quantity}股 成交`);
      }
      setTimeout(() => setLastOrderMsg(""), 3000);
    });
  }, [simState]);

  const selectedBacktest = backtests.find((b) => b.id === expandedBacktest);

  const handleCreateStrategy = () => {
    const tmpl = strategyTemplates[selectedTemplate];
    const newId = `s-${String(strategies.length + 1).padStart(3, "0")}`;
    const strategy: StrategyConfig = {
      ...tmpl,
      id: newId,
      enabled: false,
      createdAt: new Date().toISOString(),
    };
    setStrategies([...strategies, strategy]);
    setShowCreate(false);
  };

  const toggleStrategy = (id: string) => {
    setStrategies(
      strategies.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleRunBacktest = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  const getStrategyLabel = (type: string) => {
    const map: Record<string, string> = {
      ma_cross: "均线交叉",
      momentum: "动量突破",
      mean_reversion: "均值回归",
      grid: "网格交易",
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">量化模型</h1>
          <p className="text-sm text-muted-foreground mt-1">
            创建策略、回测验证、量化操作
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={autoState.running ? stopAutoTrade : startAutoTrade}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              autoState.running
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            )}
          >
            <Activity className={cn("h-4 w-4", autoState.running && "animate-pulse")} />
            {autoState.running ? "停止自动交易" : "启动自动交易"}
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              showCreate
                ? "bg-secondary text-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <Plus className="h-4 w-4" />
            新建策略
          </button>
        </div>
      </div>

      {/* 创建策略表单 */}
      {showCreate && (
        <div className="rounded-lg border bg-card p-5 space-y-4 animate-in">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            选择策略模板
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {strategyTemplates.map((tmpl, i) => (
              <button
                key={tmpl.type}
                onClick={() => setSelectedTemplate(i)}
                className={cn(
                  "text-left rounded-lg border p-3 transition-colors",
                  selectedTemplate === i
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:border-primary/50"
                )}
              >
                <div className="text-sm font-medium">{tmpl.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {tmpl.description}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tmpl.markets.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateStrategy}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              创建策略
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 左侧：模拟交易 + 策略列表 */}
        <div className="xl:col-span-1 space-y-4">
          {/* 模拟账户 */}
          <AccountPanel account={simState.account} positions={simState.positions} />

          {/* 下单面板 */}
          <TradePanel onPlaceOrder={handlePlaceOrder} />

          {/* 操作反馈 */}
          {lastOrderMsg && (
            <div className="text-xs text-center py-1.5 rounded bg-secondary/50 animate-in">
              {lastOrderMsg}
            </div>
          )}

          {/* 策略列表 */}
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">
              我的策略（{strategies.length}）
            </h2>
          </div>

          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className={cn(
                "rounded-lg border bg-card transition-colors",
                strategy.enabled && "border-primary/50"
              )}
            >
              <button
                onClick={() =>
                  setExpandedStrategy(
                    expandedStrategy === strategy.id ? null : strategy.id
                  )
                }
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 启停开关 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStrategy(strategy.id);
                      }}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        strategy.enabled ? "bg-green-500" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                          strategy.enabled ? "left-5" : "left-0.5"
                        )}
                      />
                    </button>
                    <div>
                      <div className="text-sm font-medium">
                        {strategy.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getStrategyLabel(strategy.type)}
                      </div>
                    </div>
                  </div>
                  {expandedStrategy === strategy.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedStrategy === strategy.id && (
                <div className="px-4 pb-4 space-y-2 border-t pt-3">
                  <p className="text-xs text-muted-foreground">
                    {strategy.description}
                  </p>
                  <div className="text-xs space-y-1">
                    <span className="text-muted-foreground">参数：</span>
                    {Object.entries(strategy.params).map(([k, v]) => (
                      <span
                        key={k}
                        className="inline-block ml-1 px-1.5 py-0.5 rounded bg-secondary text-xs"
                      >
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {strategy.markets.map((m) => (
                      <span
                        key={m}
                        className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {strategies.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              暂无策略，点击"新建策略"开始
            </div>
          )}

          {/* 自动交易信号日志 */}
          {autoState.running && autoState.signals.length > 0 && (
            <div className="rounded-lg border bg-card">
              <div className="p-3 border-b flex items-center justify-between">
                <span className="text-xs font-medium">交易信号日志</span>
                <span className="text-[10px] text-muted-foreground">
                  最近 {Math.min(autoState.signals.length, 50)} 条
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {autoState.signals.slice(0, 20).map((sig) => (
                  <div key={sig.id} className="px-3 py-1.5 border-b last:border-0 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "w-10 text-center font-medium shrink-0",
                        sig.action === "buy" ? "text-gain" : sig.action === "sell" ? "text-loss" : "text-muted-foreground"
                      )}>
                        {sig.action === "buy" ? "买入" : sig.action === "sell" ? "卖出" : "持有"}
                      </span>
                      <span className="truncate">{sig.reason.slice(0, 40)}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {new Date(sig.time).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：回测区域 */}
        <div className="xl:col-span-2 space-y-6">
          {/* 回测参数配置 */}
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Play className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">回测参数</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  策略
                </label>
                <select
                  value={backtestParams.strategyId}
                  onChange={(e) =>
                    setBacktestParams({
                      ...backtestParams,
                      strategyId: e.target.value,
                    })
                  }
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                >
                  {strategies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  标的代码
                </label>
                <input
                  type="text"
                  value={backtestParams.symbol}
                  onChange={(e) =>
                    setBacktestParams({
                      ...backtestParams,
                      symbol: e.target.value,
                    })
                  }
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm number-font"
                  placeholder="000001.SZ"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  起始日期
                </label>
                <input
                  type="date"
                  value={backtestParams.startDate}
                  onChange={(e) =>
                    setBacktestParams({
                      ...backtestParams,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  结束日期
                </label>
                <input
                  type="date"
                  value={backtestParams.endDate}
                  onChange={(e) =>
                    setBacktestParams({
                      ...backtestParams,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  初始资金
                </label>
                <input
                  type="number"
                  value={backtestParams.initialCapital}
                  onChange={(e) =>
                    setBacktestParams({
                      ...backtestParams,
                      initialCapital: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm number-font"
                />
              </div>
            </div>
            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className={cn(
                "mt-4 flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-colors",
                isRunning
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isRunning ? (
                <>
                  <Activity className="h-4 w-4 animate-pulse" />
                  回测运行中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  开始回测
                </>
              )}
            </button>
          </div>

          {/* 回测结果列表 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">回测结果</h2>
            </div>

            {backtests.map((bt) => {
              const strategy = strategies.find((s) => s.id === bt.strategyId);
              return (
                <div key={bt.id} className="mb-3">
                  <button
                    onClick={() =>
                      setExpandedBacktest(
                        expandedBacktest === bt.id ? null : bt.id
                      )
                    }
                    className="w-full rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                  >
                    <div className="p-4 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">
                            {strategy?.name || "未知策略"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {bt.params.symbol} · {bt.params.startDate} ~{" "}
                            {bt.params.endDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div
                              className={cn(
                                "text-sm font-semibold number-font",
                                bt.metrics.totalReturn >= 0
                                  ? "text-gain"
                                  : "text-loss"
                              )}
                            >
                              {bt.metrics.totalReturn >= 0 ? "+" : ""}
                              {bt.metrics.totalReturn}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              总收益率
                            </div>
                          </div>
                          {expandedBacktest === bt.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {expandedBacktest === bt.id && (
                    <div className="rounded-b-lg border-x border-b bg-card p-4 space-y-4 animate-in">
                      {/* 关键指标 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          {
                            label: "年化收益",
                            value: `${bt.metrics.annualReturn}%`,
                            icon: TrendingUp,
                            gain: bt.metrics.annualReturn >= 0,
                          },
                          {
                            label: "最大回撤",
                            value: `${bt.metrics.maxDrawdown}%`,
                            icon: Shield,
                            gain: false,
                          },
                          {
                            label: "夏普比率",
                            value: bt.metrics.sharpeRatio.toFixed(2),
                            icon: Target,
                            gain: bt.metrics.sharpeRatio >= 1,
                          },
                          {
                            label: "胜率",
                            value: `${bt.metrics.winRate}%`,
                            icon: Percent,
                            gain: bt.metrics.winRate >= 50,
                          },
                        ].map((m) => (
                          <div
                            key={m.label}
                            className="rounded-md border bg-background p-3"
                          >
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              <m.icon className="h-3 w-3" />
                              {m.label}
                            </div>
                            <div
                              className={cn(
                                "text-lg font-semibold number-font",
                                m.gain ? "text-gain" : "text-loss"
                              )}
                            >
                              {m.value}
                            </div>
                          </div>
                        ))}
                        <div className="rounded-md border bg-background p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <DollarSign className="h-3 w-3" />
                            总交易
                          </div>
                          <div className="text-lg font-semibold number-font">
                            {bt.metrics.totalTrades}
                          </div>
                        </div>
                        <div className="rounded-md border bg-background p-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            平均持仓
                          </div>
                          <div className="text-lg font-semibold number-font">
                            {bt.metrics.avgHoldingDays}天
                          </div>
                        </div>
                      </div>

                      {/* 权益曲线 */}
                      {bt.equityCurve.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">
                            权益曲线
                          </h4>
                          <div className="h-32 flex items-end gap-1">
                            {bt.equityCurve.map((point, i) => {
                              const maxVal = Math.max(
                                ...bt.equityCurve.map((p) => p.value)
                              );
                              const minVal = Math.min(
                                ...bt.equityCurve.map((p) => p.value)
                              );
                              const pct =
                                ((point.value - minVal) / (maxVal - minVal)) *
                                100;
                              return (
                                <div
                                  key={point.date}
                                  className="flex-1 flex flex-col items-center gap-0.5"
                                  title={`${point.date}: ¥${point.value.toLocaleString()}`}
                                >
                                  <div className="text-[9px] text-muted-foreground">
                                    {point.value >= bt.params.initialCapital
                                      ? "▲"
                                      : "▼"}
                                  </div>
                                  <div
                                    className={cn(
                                      "w-full rounded-t",
                                      point.value >= bt.params.initialCapital
                                        ? "bg-gain/60"
                                        : "bg-loss/60"
                                    )}
                                    style={{ height: `${Math.max(pct, 3)}%` }}
                                  />
                                  {i % 2 === 0 && (
                                    <div className="text-[9px] text-muted-foreground mt-0.5">
                                      {point.date.slice(5)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 交易记录 */}
                      {bt.trades.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">
                            交易记录
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b text-muted-foreground">
                                  <th className="text-left py-1.5 px-2">
                                    日期
                                  </th>
                                  <th className="text-left py-1.5 px-2">
                                    类型
                                  </th>
                                  <th className="text-right py-1.5 px-2">
                                    价格
                                  </th>
                                  <th className="text-right py-1.5 px-2">
                                    数量
                                  </th>
                                  <th className="text-right py-1.5 px-2">
                                    金额
                                  </th>
                                  <th className="text-left py-1.5 px-2">
                                    原因
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {bt.trades.map((t, i) => (
                                  <tr key={i} className="border-b last:border-0">
                                    <td className="py-1.5 px-2">{t.date}</td>
                                    <td className="py-1.5 px-2">
                                      <span
                                        className={cn(
                                          "px-1.5 py-0.5 rounded text-xs",
                                          t.type === "buy"
                                            ? "bg-gain/10 text-gain"
                                            : "bg-loss/10 text-loss"
                                        )}
                                      >
                                        {t.type === "buy" ? "买入" : "卖出"}
                                      </span>
                                    </td>
                                    <td className="text-right py-1.5 px-2 number-font">
                                      {t.price}
                                    </td>
                                    <td className="text-right py-1.5 px-2">
                                      {t.quantity}
                                    </td>
                                    <td className="text-right py-1.5 px-2 number-font">
                                      ¥{t.amount.toLocaleString()}
                                    </td>
                                    <td className="py-1.5 px-2 text-muted-foreground max-w-[180px] truncate">
                                      {t.reason}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {backtests.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground rounded-lg border bg-card">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                暂无回测结果，配置参数后点击"开始回测"
              </div>
            )}

            {/* 模拟账户权益曲线 */}
            {simState.equityCurve.length > 1 && (
              <EquityCurve
                data={simState.equityCurve}
                initialCapital={simState.account.initialCapital}
              />
            )}

            {/* 成交记录 */}
            {simState.trades.length > 0 && (
              <TradeHistory trades={simState.trades} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
