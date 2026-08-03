/**
 * 同花顺模拟盘交易客户端
 *
 * 通过 HTTP 调用 Python Flask 交易微服务（默认 localhost:8766），
 * 执行买入/卖出/查询持仓/账户信息。
 *
 * 前置条件：启动 Python 交易服务
 *   python server/trade_server.py
 *
 * ⚠️ 安全：默认硬编码为模拟盘模式，实盘需用户明确授权
 */

const BASE_URL = "http://localhost:8766/api";

interface TradeResponse<T = unknown> {
  code: number;
  msg?: string;
  data: T;
}

interface TradeResult {
  order_id: string;
  trade_id: string;
  status: string;
  cash_remaining: number;
}

interface Position {
  code: string;
  name: string;
  quantity: number;
  available_qty: number;
  avg_cost: number;
}

interface AccountInfo {
  cash: number;
  frozen: number;
  positions: Position[];
  mode: string;
}

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ msg: res.statusText }));
    throw new Error(err.msg || `HTTP ${res.status}`);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json: TradeResponse<T> = await res.json();
  if (json.code !== 0) throw new Error(json.msg || "请求失败");
  return json.data;
}

/** 健康检查 */
export async function tradeHealthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/** 获取账户信息 */
export async function fetchAccount(): Promise<AccountInfo> {
  return get<AccountInfo>("/account");
}

/** 获取持仓 */
export async function fetchPositions(): Promise<Position[]> {
  return get<Position[]>("/positions");
}

/** 买入 */
export async function buy(
  code: string,
  name: string,
  price: number,
  quantity: number
): Promise<TradeResult> {
  return post("/trade/buy", { code, name, price, quantity });
}

/** 卖出 */
export async function sell(
  code: string,
  price: number,
  quantity: number
): Promise<TradeResult> {
  return post("/trade/sell", { code, price, quantity });
}

/** 获取交易模式（simulation/real） */
export async function getTradeMode(): Promise<{ mode: string; warning: string }> {
  return get<{ mode: string; warning: string }>("/trade/mode");
}
