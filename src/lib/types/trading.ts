/**
 * 模拟交易数据模型
 *
 * 模拟 A股交易：T+1、涨跌停限制、100 股起买
 */

// ============ 账户 ============

export interface SimAccount {
  /** 总资金（含持仓市值） */
  totalAssets: number;
  /** 可用资金 */
  availableCash: number;
  /** 冻结资金（挂单中） */
  frozenCash: number;
  /** 持仓市值 */
  positionValue: number;
  /** 累计盈亏 */
  totalPnl: number;
  /** 累计盈亏百分比 */
  totalPnlPct: number;
  /** 初始资金 */
  initialCapital: number;
  /** 创建时间 */
  createdAt: string;
}

// ============ 持仓 ============

export interface Position {
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 持仓数量（股） */
  quantity: number;
  /** 可用数量（可卖，T+1 约束） */
  availableQty: number;
  /** 成本均价 */
  avgCost: number;
  /** 当前价 */
  currentPrice: number;
  /** 市值 */
  marketValue: number;
  /** 浮动盈亏 */
  pnl: number;
  /** 浮动盈亏百分比 */
  pnlPct: number;
}

// ============ 委托/订单 ============

export type OrderSide = "buy" | "sell";
export type OrderStatus = "pending" | "filled" | "cancelled" | "rejected";
export type OrderType = "market" | "limit";

export interface Order {
  /** 订单 ID */
  id: string;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 买卖方向 */
  side: OrderSide;
  /** 委托价格（市价单用 0） */
  price: number;
  /** 委托数量（股） */
  quantity: number;
  /** 已成交数量 */
  filledQty: number;
  /** 订单类型 */
  type: OrderType;
  /** 状态 */
  status: OrderStatus;
  /** 拒绝原因 */
  rejectReason?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

// ============ 成交记录 ============

export interface Trade {
  /** 成交 ID */
  id: string;
  /** 关联订单 ID */
  orderId: string;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 买卖方向 */
  side: OrderSide;
  /** 成交价格 */
  price: number;
  /** 成交数量 */
  quantity: number;
  /** 成交金额 */
  amount: number;
  /** 成交时间 */
  time: string;
}

// ============ 权益记录（画曲线用） ============

export interface EquityPoint {
  date: string;
  value: number;
}

// ============ A股交易规则常量 ============

/** 最小交易单位（股） */
export const MIN_TRADE_UNIT = 100;

/** 涨跌停幅度（10%，北交所 30%） */
export const LIMIT_PCT = 0.10;

/** 手续费率（佣金，双向） */
export const COMMISSION_RATE = 0.00025;

/** 印花税率（卖出单向） */
export const STAMP_TAX_RATE = 0.001;

/** 最小手续费（元） */
export const MIN_COMMISSION = 5;

// ============ 模拟器状态 ============

export interface SimulatorState {
  account: SimAccount;
  positions: Position[];
  orders: Order[];
  trades: Trade[];
  equityCurve: EquityPoint[];
}
