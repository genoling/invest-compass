import type { MarketQuote, NewsItem, KLineData } from "@/lib/types/news";

/** Mock 行情数据 */
export const mockMarketQuotes: MarketQuote[] = [
  {
    symbol: "AAPL",
    name: "苹果",
    assetClass: "stocks",
    price: 187.35,
    change: 3.82,
    changePercent: 2.08,
    volume: 48392000,
    high24h: 188.90,
    low24h: 184.10,
    marketCap: 2900000000000,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "MSFT",
    name: "微软",
    assetClass: "stocks",
    price: 428.15,
    change: -2.35,
    changePercent: -0.55,
    volume: 18567000,
    high24h: 432.50,
    low24h: 426.00,
    marketCap: 3180000000000,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "NVDA",
    name: "英伟达",
    assetClass: "stocks",
    price: 925.40,
    change: 15.30,
    changePercent: 1.68,
    volume: 35421000,
    high24h: 932.00,
    low24h: 910.50,
    marketCap: 2280000000000,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "TSLA",
    name: "特斯拉",
    assetClass: "stocks",
    price: 218.60,
    change: -5.40,
    changePercent: -2.41,
    volume: 89230000,
    high24h: 225.00,
    low24h: 216.00,
    marketCap: 695000000000,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "GOOGL",
    name: "谷歌",
    assetClass: "stocks",
    price: 176.80,
    change: 1.25,
    changePercent: 0.71,
    volume: 22340000,
    high24h: 178.10,
    low24h: 175.30,
    marketCap: 2180000000000,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "AMZN",
    name: "亚马逊",
    assetClass: "stocks",
    price: 205.30,
    change: 0.85,
    changePercent: 0.42,
    volume: 30120000,
    high24h: 207.00,
    low24h: 203.50,
    marketCap: 2130000000000,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "BTC",
    name: "比特币",
    assetClass: "cryptocurrency",
    price: 68250.00,
    change: 1250.00,
    changePercent: 1.86,
    volume: 28500000,
    high24h: 69100.00,
    low24h: 66800.00,
    marketCap: 1340000000000,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
  },
  {
    symbol: "ETH",
    name: "以太坊",
    assetClass: "cryptocurrency",
    price: 3460.50,
    change: -82.30,
    changePercent: -2.32,
    volume: 15200000,
    high24h: 3580.00,
    low24h: 3420.00,
    marketCap: 416000000000,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
  },
];

/** Mock 资讯列表 */
export const mockNews: NewsItem[] = [
  {
    id: "n1",
    headline: "美联储维持利率不变，市场反应积极",
    summary:
      "美联储在最新一次议息会议上决定维持基准利率不变，符合市场预期。鲍威尔表示通胀正在朝着2%目标回落。",
    content:
      "美联储联邦公开市场委员会(FOMC)在为期两天的会议后宣布，将联邦基金利率目标区间维持在5.25%-5.50%不变...",
    author: "财经记者",
    source: "财经日报",
    url: "https://example.com/n1",
    category: "macro",
    type: "Macro",
    relatedSymbols: ["SPY", "QQQ"],
    industry: ["宏观经济"],
    sentiment: "positive",
    publishedAt: new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString(),
  },
  {
    id: "n2",
    headline: "人工智能政策利好行业发展，科技股集体走强",
    summary:
      "国务院发布新一代人工智能发展规划实施细则，明确了对AI芯片、大模型等关键领域的支持政策。",
    content:
      "根据最新发布的实施细则，国家将加大对人工智能核心技术和基础研究的投入...",
    author: "科技记者",
    source: "科技新闻",
    url: "https://example.com/n2",
    category: "industry",
    type: "Industry",
    relatedSymbols: ["NVDA", "AMD"],
    industry: ["人工智能", "半导体"],
    sentiment: "positive",
    publishedAt: new Date(
      Date.now() - 60 * 60 * 1000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - 60 * 60 * 1000
    ).toISOString(),
  },
  {
    id: "n3",
    headline: "苹果发布新一代M4芯片，性能大幅提升",
    summary:
      "苹果公司正式发布M4系列芯片，采用3纳米工艺，AI算力较上一代提升200%。",
    content:
      "苹果公司在今天的特别活动中发布了全新的M4和M4 Pro芯片...",
    author: "科技编辑",
    source: "科技日报",
    url: "https://example.com/n3",
    category: "company",
    type: "Company",
    relatedSymbols: ["AAPL"],
    industry: ["消费电子", "半导体"],
    sentiment: "positive",
    publishedAt: new Date(
      Date.now() - 2 * 60 * 60 * 1000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - 2 * 60 * 60 * 1000
    ).toISOString(),
  },
  {
    id: "n4",
    headline: "新能源赛道持续调整，分析师建议逢低布局",
    summary:
      "新能源板块持续回调，多只龙头股估值回到历史低位。分析师认为行业基本面依然稳健。",
    content:
      "受市场情绪影响，新能源板块近期持续走弱...",
    author: "行业分析师",
    source: "证券时报",
    url: "https://example.com/n4",
    category: "industry",
    type: "Industry",
    relatedSymbols: ["TSLA"],
    industry: ["新能源", "电动汽车"],
    sentiment: "neutral",
    publishedAt: new Date(
      Date.now() - 3 * 60 * 60 * 1000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - 3 * 60 * 60 * 1000
    ).toISOString(),
  },
  {
    id: "n5",
    headline: "比特币突破68000美元，加密货币市场情绪回暖",
    summary:
      "比特币价格突破68000美元关口，24小时涨幅达1.86%。市场预计现货ETF资金持续流入。",
    content:
      "比特币今日延续上涨态势，盘中最高触及69100美元...",
    author: "加密记者",
    source: "区块链日报",
    url: "https://example.com/n5",
    category: "market",
    type: "Market",
    relatedSymbols: ["BTC", "ETH"],
    industry: ["加密货币"],
    sentiment: "positive",
    publishedAt: new Date(
      Date.now() - 15 * 60 * 1000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - 15 * 60 * 1000
    ).toISOString(),
  },
  {
    id: "n6",
    headline: "云计算市场增速放缓，行业竞争加剧",
    summary:
      "最新报告显示，全球云计算市场增速回落至15%，微软Azure与AWS的市场份额竞争白热化。",
    content: "根据Gartner发布的最新云计算市场报告...",
    author: "行业观察",
    source: "经济观察报",
    url: "https://example.com/n6",
    category: "industry",
    type: "Industry",
    relatedSymbols: ["MSFT", "AMZN", "GOOGL"],
    industry: ["云计算", "科技"],
    sentiment: "neutral",
    publishedAt: new Date(
      Date.now() - 4 * 60 * 60 * 1000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - 4 * 60 * 60 * 1000
    ).toISOString(),
  },
];

/** Mock K线数据（30个交易日） */
export function generateMockKLineData(
  basePrice: number
): KLineData[] {
  const data: KLineData[] = [];
  let price = basePrice;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const volatility = price * 0.02;
    const open = price + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    data.push({
      time: date.toISOString().split("T")[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(Math.random() * 50000000 + 10000000),
    });
    price = close;
  }
  return data;
}

/** 模拟实时价格波动 */
export function simulatePriceChange(
  quote: MarketQuote
): MarketQuote {
  const volatility = quote.price * 0.003;
  const change = (Math.random() - 0.48) * volatility;
  const newPrice = Math.round((quote.price + change) * 100) / 100;
  return {
    ...quote,
    price: newPrice,
    change: Math.round((quote.change + change) * 100) / 100,
    changePercent:
      Math.round(
        ((newPrice - (quote.price - quote.change)) /
          (quote.price - quote.change)) *
          10000
      ) / 100,
    lastUpdated: new Date().toISOString(),
  };
}
