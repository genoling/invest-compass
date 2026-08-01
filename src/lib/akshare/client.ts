/**
 * AKShare 行情数据客户端
 *
 * 通过 HTTP 调用 Python Flask 微服务（默认 localhost:8765），
 * 获取 A股实时行情、历史 K 线等数据。
 *
 * 前置条件：启动 Python 行情服务
 *   python server/akshare_server.py
 */

const BASE_URL = "http://localhost:8765/api";

/** 实时行情条目 */
export interface SpotQuote {
  code: string;
  name: string;
  price: number;
  change_pct: number;
  volume: number;
  turnover: number;
  high: number;
  low: number;
  open: number;
  pre_close: number;
}

/** K 线数据点 */
export interface KLinePoint {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  turnover: number;
  amplitude: number;
  change_pct: number;
}

/** 股票搜索匹配项 */
export interface StockMatch {
  code: string;
  name: string;
}

/** API 统一响应 */
interface ApiResponse<T> {
  code: number;
  msg?: string;
  data: T;
  total?: number;
}

async function fetchApi<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = params
    ? `${BASE_URL}${path}?${params.toString()}`
    : `${BASE_URL}${path}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AKShare API 请求失败: ${res.status} ${res.statusText}`);
  }
  const json: ApiResponse<T> = await res.json();
  if (json.code !== 0) {
    throw new Error(`AKShare API 错误: ${json.msg}`);
  }
  return json.data;
}

// ============ 公开 API ============

/** 获取全部 A股实时行情 */
export async function fetchAllSpots(): Promise<SpotQuote[]> {
  return fetchApi<SpotQuote[]>("/spot");
}

/** 获取单只股票实时行情 */
export async function fetchSpot(code: string): Promise<SpotQuote> {
  return fetchApi<SpotQuote>(`/spot/${code}`);
}

/** 获取历史 K 线 */
export async function fetchKLine(
  code: string,
  start: string,
  end: string,
  period = "daily"
): Promise<KLinePoint[]> {
  return fetchApi<KLinePoint[]>(
    "/kline",
    new URLSearchParams({ code, start, end, period })
  );
}

/** 搜索股票（代码或名称） */
export async function searchStocks(q: string): Promise<StockMatch[]> {
  return fetchApi<StockMatch[]>("/search", new URLSearchParams({ q }));
}

/** 健康检查 */
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
