/**
 * 模拟交易引擎
 *
 * 模拟 A股真实交易规则：
 * - T+1（当日买入次日可卖）
 * - 涨跌停限制（±10%）
 * - 最小交易单位 100 股
 * - 手续费（佣金 + 印花税）
 * - 市价单 / 限价单
 */

import type {
  SimAccount,
  Position,
  Order,
  OrderSide,
  OrderType,
  OrderStatus,
  Trade,
  SimulatorState,
} from "@/lib/types/trading";
import {
  MIN_TRADE_UNIT,
  LIMIT_PCT,
  COMMISSION_RATE,
  STAMP_TAX_RATE,
  MIN_COMMISSION,
} from "@/lib/types/trading";

// ============ 工厂函数 ============

let orderSeq = 0;
let tradeSeq = 0;

function nextOrderId() {
  return `ORD-${Date.now()}-${++orderSeq}`;
}

function nextTradeId() {
  return `TRD-${Date.now()}-${++tradeSeq}`;
}

export function createAccount(initialCapital = 100000): SimAccount {
  return {
    totalAssets: initialCapital,
    availableCash: initialCapital,
    frozenCash: 0,
    positionValue: 0,
    totalPnl: 0,
    totalPnlPct: 0,
    initialCapital,
    createdAt: new Date().toISOString(),
  };
}

export function createInitialState(initialCapital = 100000): SimulatorState {
  return {
    account: createAccount(initialCapital),
    positions: [],
    orders: [],
    trades: [],
    equityCurve: [
      { date: new Date().toISOString().slice(0, 10), value: initialCapital },
    ],
  };
}

// ============ 规则校验 ============

export function calcLimitPrice(preClose: number, side: OrderSide): number {
  if (side === "buy") return preClose * (1 + LIMIT_PCT);
  return preClose * (1 - LIMIT_PCT);
}

export function isPriceValid(
  price: number,
  preClose: number,
  side: OrderSide
): boolean {
  const limit = calcLimitPrice(preClose, side);
  if (side === "buy") return price <= limit;
  return price >= limit;
}

export function calcCommission(amount: number): number {
  const fee = amount * COMMISSION_RATE;
  return Math.max(fee, MIN_COMMISSION);
}

export function calcStampTax(amount: number): number {
  return amount * STAMP_TAX_RATE;
}

// ============ 核心引擎 ============

export function placeOrder(
  state: SimulatorState,
  params: {
    code: string;
    name: string;
    side: OrderSide;
    price: number; // 市价单传 0
    quantity: number;
    type: OrderType;
    preClose: number; // 昨收（用于涨跌停校验）
    todayBuys?: number; // 当日已买入数量（T+1 校验）
  }
): { state: SimulatorState; order: Order } {
  const { account, positions } = state;
  const { code, name, side, price: rawPrice, quantity, type, preClose } = params;

  // 1. 数量校验
  if (quantity <= 0 || quantity % MIN_TRADE_UNIT !== 0) {
    return {
      state,
      order: createRejectedOrder(code, name, side, rawPrice, quantity, type, `数量必须为 ${MIN_TRADE_UNIT} 股的整数倍`),
    };
  }

  // 2. 涨跌停校验
  if (!isPriceValid(rawPrice > 0 ? rawPrice : preClose, preClose, side)) {
    return {
      state,
      order: createRejectedOrder(code, name, side, rawPrice, quantity, type, `价格超出涨跌停限制`),
    };
  }

  const execPrice = rawPrice > 0 ? rawPrice : preClose; // 市价单用前收价
  const amount = execPrice * quantity;
  const commission = calcCommission(amount);

  if (side === "buy") {
    // 买入校验
    const totalCost = amount + commission;
    if (totalCost > account.availableCash) {
      return {
        state,
        order: createRejectedOrder(code, name, side, rawPrice, quantity, type, `资金不足：需要 ¥${totalCost.toFixed(2)}，可用 ¥${account.availableCash.toFixed(2)}`),
      };
    }
  } else {
    // 卖出校验：持仓 + T+1
    const pos = positions.find((p) => p.code === code);
    if (!pos || pos.availableQty < quantity) {
      return {
        state,
        order: createRejectedOrder(code, name, side, rawPrice, quantity, type, `可卖数量不足：需要 ${quantity} 股，可用 ${pos?.availableQty || 0} 股（T+1 限制）`),
      };
    }
  }

  // 3. 创建订单
  const order: Order = {
    id: nextOrderId(),
    code,
    name,
    side,
    price: rawPrice,
    quantity,
    filledQty: 0,
    type,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newOrders = [...state.orders, order];

  // 4. 市价单立即模拟成交
  let newState = { ...state, orders: newOrders };
  if (type === "market") {
    newState = executeOrder(newState, order.id, execPrice);
  }

  return { state: newState, order };
}

function createRejectedOrder(
  code: string,
  name: string,
  side: OrderSide,
  price: number,
  quantity: number,
  type: OrderType,
  reason: string
): Order {
  return {
    id: nextOrderId(),
    code,
    name,
    side,
    price,
    quantity,
    filledQty: 0,
    type,
    status: "rejected",
    rejectReason: reason,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function executeOrder(
  state: SimulatorState,
  orderId: string,
  execPrice: number
): SimulatorState {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order || order.status !== "pending") return state;

  const amount = execPrice * order.quantity;
  const commission = calcCommission(amount);
  const stampTax = order.side === "sell" ? calcStampTax(amount) : 0;
  const now = new Date().toISOString();

  // 更新订单
  const updatedOrder: Order = {
    ...order,
    status: "filled",
    filledQty: order.quantity,
    price: execPrice,
    updatedAt: now,
  };

  // 成交记录
  const trade: Trade = {
    id: nextTradeId(),
    orderId: order.id,
    code: order.code,
    name: order.name,
    side: order.side,
    price: execPrice,
    quantity: order.quantity,
    amount,
    time: now,
  };

  let { account, positions } = state;

  if (order.side === "buy") {
    // 买入：扣资金 + 更新持仓
    const totalCost = amount + commission;
    account = {
      ...account,
      availableCash: account.availableCash - totalCost,
    };

    const existing = positions.find((p) => p.code === order.code);
    if (existing) {
      const totalQty = existing.quantity + order.quantity;
      const newAvgCost = (existing.avgCost * existing.quantity + amount) / totalQty;
      positions = positions.map((p) =>
        p.code === order.code
          ? {
              ...p,
              quantity: totalQty,
              avgCost: newAvgCost,
              // 当日买入不可卖（T+1），但这里简化处理：新增部分不可卖
              availableQty: p.availableQty,
            }
          : p
      );
    } else {
      positions = [
        ...positions,
        {
          code: order.code,
          name: order.name,
          quantity: order.quantity,
          availableQty: 0, // T+1：当日买入不可卖
          avgCost: execPrice,
          currentPrice: execPrice,
          marketValue: amount,
          pnl: 0,
          pnlPct: 0,
        },
      ];
    }
  } else {
    // 卖出：加资金 + 减持仓
    const netCash = amount - commission - stampTax;
    account = {
      ...account,
      availableCash: account.availableCash + netCash,
    };

    positions = positions
      .map((p) => {
        if (p.code !== order.code) return p;
        const remainingQty = p.quantity - order.quantity;
        if (remainingQty <= 0) return null;
        return {
          ...p,
          quantity: remainingQty,
          availableQty: Math.min(p.availableQty, remainingQty),
          marketValue: p.currentPrice * remainingQty,
          pnl: (p.currentPrice - p.avgCost) * remainingQty,
          pnlPct: ((p.currentPrice - p.avgCost) / p.avgCost) * 100,
        };
      })
      .filter(Boolean) as Position[];
  }

  // 重新计算账户总览
  const positionValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
  const totalAssets = account.availableCash + positionValue;
  const totalPnl = totalAssets - account.initialCapital;
  const totalPnlPct = (totalPnl / account.initialCapital) * 100;

  const updatedAccount: SimAccount = {
    ...account,
    totalAssets,
    positionValue,
    totalPnl,
    totalPnlPct,
  };

  const updatedEquityCurve = [
    ...state.equityCurve,
    { date: now.slice(0, 10), value: totalAssets },
  ];

  return {
    account: updatedAccount,
    positions,
    orders: state.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
    trades: [...state.trades, trade],
    equityCurve: updatedEquityCurve,
  };
}

/** 刷新持仓市价（行情更新时调用） */
export function refreshPositions(
  state: SimulatorState,
  quotes: { code: string; price: number }[]
): SimulatorState {
  const priceMap = new Map(quotes.map((q) => [q.code, q.price]));
  const positions = state.positions.map((p) => {
    const newPrice = priceMap.get(p.code) || p.currentPrice;
    const marketValue = newPrice * p.quantity;
    const pnl = (newPrice - p.avgCost) * p.quantity;
    const pnlPct = p.avgCost > 0 ? ((newPrice - p.avgCost) / p.avgCost) * 100 : 0;
    return { ...p, currentPrice: newPrice, marketValue, pnl, pnlPct };
  });

  const positionValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalAssets = state.account.availableCash + positionValue;
  const totalPnl = totalAssets - state.account.initialCapital;

  return {
    ...state,
    positions,
    account: {
      ...state.account,
      totalAssets,
      positionValue,
      totalPnl,
      totalPnlPct: (totalPnl / state.account.initialCapital) * 100,
    },
  };
}

/** 每日结算：T+1 释放可卖数量 */
export function dailySettlement(state: SimulatorState): SimulatorState {
  return {
    ...state,
    positions: state.positions.map((p) => ({
      ...p,
      availableQty: p.quantity, // 所有持仓变为可卖
    })),
  };
}
