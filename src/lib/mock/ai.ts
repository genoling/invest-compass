import type { AIAnalysisResult } from "@/lib/types/ai";

export const mockAIAnalyses: AIAnalysisResult[] = [
  {
    id: "ai-1",
    goalId: "goal-1",
    summary:
      "建议逢低布局行业龙头、基本面良好的科技类股票，整体市场情绪偏乐观，但短期存在波动风险。",
    details: {
      marketSentiment:
        "近期科技行业政策利好频出，市场情绪偏乐观。人工智能、半导体板块资金持续流入，交易活跃度维持高位。但需注意部分个股估值已偏高，市场分化正在加剧。",
      technicalAnalysis:
        "从技术面看，纳斯达克指数处于上升通道，均线系统呈多头排列。MACD指标金叉向上，KDJ指标处于强势区域。短期支撑位在18500点，压力位在19200点。",
      fundamentalAnalysis:
        "行业基本面整体向好：龙头企业营收和净利润保持两位数增长，研发投入持续加大。云计算和AI算力需求强劲，预计2026年行业增速维持在15%以上。",
      riskAnalysis:
        "主要风险点：1) 美联储降息节奏不确定；2) 地缘政治风险上升；3) 科技板块估值溢价扩大。建议控制单一个股仓位不超过20%，设置10%止损线。",
    },
    suggestions: [
      {
        assetClass: "stocks",
        symbol: "AAPL",
        action: "buy",
        priceRange: "180-190",
        quantity: 20,
        allocationTarget: 15,
        reason: "估值合理，现金流充裕，服务收入占比持续提升",
      },
      {
        assetClass: "stocks",
        symbol: "NVDA",
        action: "hold",
        priceRange: "900-950",
        allocationTarget: 20,
        reason: "AI龙头地位稳固，但短期涨幅较大，建议持有观望",
      },
      {
        assetClass: "stocks",
        symbol: "MSFT",
        action: "buy",
        priceRange: "420-435",
        quantity: 15,
        allocationTarget: 12,
        reason: "云计算和AI业务增长确定性强，当前估值合理偏低",
      },
    ],
    relatedNews: ["n2", "n3"],
    relatedKnowledge: ["k1", "k3"],
    riskLevel: "medium",
    createdAt: new Date(
      Date.now() - 2 * 60 * 60 * 1000
    ).toISOString(),
  },
  {
    id: "ai-2",
    goalId: "goal-1",
    summary:
      "加密货币市场短期回调，比特币维持震荡格局。建议维持现有仓位，等待趋势明朗后再做调整。",
    details: {
      marketSentiment:
        "加密货币市场情绪由乐观转为中性，资金流入速度放缓。交易所成交量下降20%，市场观望情绪浓厚。",
      technicalAnalysis:
        "BTC在66000-69000区间震荡，布林带收窄预示变盘临近。MACD高位死叉，RSI回落至50附近，短期方向不明。",
      fundamentalAnalysis:
        "ETF资金仍在净流入但速度放缓。监管政策不确定性增加，机构投资者持仓比例趋于稳定。",
      riskAnalysis:
        "加密货币高波动特征明显，建议仓位控制在总资产10%以内，设置15%止损线。",
    },
    suggestions: [
      {
        assetClass: "cryptocurrency",
        symbol: "BTC",
        action: "hold",
        priceRange: "66000-69000",
        allocationTarget: 10,
        reason: "短期方向不明，维持现有仓位观望",
      },
    ],
    relatedNews: ["n5"],
    relatedKnowledge: ["k5"],
    riskLevel: "high",
    createdAt: new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString(),
  },
];
