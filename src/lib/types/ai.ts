/** AI 分析结果 */
export interface AIAnalysisResult {
  id: string;
  goalId?: string;
  summary: string;
  details: {
    marketSentiment: string;
    technicalAnalysis: string;
    fundamentalAnalysis: string;
    riskAnalysis: string;
  };
  suggestions: AIActionSuggestion[];
  relatedNews: string[];
  relatedKnowledge: string[];
  riskLevel: "low" | "medium" | "high";
  createdAt: string;
}

/** AI 操作建议 */
export interface AIActionSuggestion {
  assetClass: string;
  symbol: string;
  action: "buy" | "sell" | "hold";
  priceRange: string;
  quantity?: number;
  allocationTarget?: number;
  reason: string;
}

/** 分析维度 */
export type AnalysisDimension =
  | "technical"
  | "fundamental"
  | "marketSentiment"
  | "holdingMatch"
  | "riskReturn";
